<?php

namespace App\Service;

use App\Entity\ConsentLog;
use App\Entity\ForumPost;
use App\Entity\ForumSubscription;
use App\Entity\ForumTopic;
use App\Entity\PremiumSubscription;
use App\Entity\RefreshToken;
use App\Entity\User;
use App\Entity\VideoFavorite;
use App\Repository\ConsentLogRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Traitements RGPD : consentement, export (droit d'accès / portabilité),
 * effacement par anonymisation, purges automatiques.
 */
class GdprService
{
    public const DELETION_TTL = '+1 hour';
    public const IP_RETENTION = '-90 days';
    public const INACTIVITY_LIMIT = '-3 years';
    public const ANONYMOUS_LABEL = 'Utilisateur supprimé';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ConsentLogRepository $consentLogs,
        #[Autowire(env: 'CGU_VERSION')]
        private readonly string $cguVersion,
    ) {
    }

    public function getCurrentCguVersion(): string
    {
        return $this->cguVersion;
    }

    /**
     * Enregistre l'acceptation des CGU sur l'utilisateur et en garde la preuve (ConsentLog).
     * Le flush est laissé à l'appelant.
     */
    public function recordConsent(User $user, ?string $ipAddress): ConsentLog
    {
        $now = new \DateTimeImmutable();

        $user->setConsentVersion($this->cguVersion);
        $user->setConsentAt($now);

        $log = (new ConsentLog())
            ->setCguVersion($this->cguVersion)
            ->setIpAddress($ipAddress);
        $user->addConsentLog($log);

        $this->em->persist($log);

        return $log;
    }

    /**
     * Droit d'accès et de portabilité : toutes les données rattachées au compte.
     *
     * @return array<string, mixed>
     */
    public function export(User $user): array
    {
        $date = static fn (?\DateTimeInterface $d) => $d?->format(\DATE_ATOM);

        $topics = $this->em->getRepository(ForumTopic::class)->findBy(['author' => $user], ['createdAt' => 'ASC']);
        $posts = $this->em->getRepository(ForumPost::class)->findBy(['author' => $user], ['createdAt' => 'ASC']);
        $subscriptions = $this->em->getRepository(ForumSubscription::class)->findBy(['user' => $user]);
        $favorites = $this->em->getRepository(VideoFavorite::class)->findBy(['user' => $user], ['createdAt' => 'ASC']);
        $premiumSubscriptions = $this->em->getRepository(PremiumSubscription::class)->findBy(['user' => $user], ['createdAt' => 'ASC']);

        return [
            'exportedAt' => $date(new \DateTimeImmutable()),
            'account' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'pseudo' => $user->getPseudo(),
                'roles' => $user->getRoles(),
                'isVerified' => $user->isVerified(),
                'createdAt' => $date($user->getCreatedAt()),
                'lastLoginAt' => $date($user->getLastLoginAt()),
                'premiumUntil' => $date($user->getPremiumUntil()),
            ],
            'premiumSubscriptions' => array_map(static fn (PremiumSubscription $s) => [
                'plan' => $s->getPlan()->value,
                'status' => $s->getStatus()->value,
                'priceCents' => $s->getPriceCents(),
                'startedAt' => $date($s->getStartedAt()),
                'endsAt' => $date($s->getEndsAt()),
                'providerReference' => $s->getProviderReference(),
                'createdAt' => $date($s->getCreatedAt()),
            ], $premiumSubscriptions),
            'consents' => array_map(static fn (ConsentLog $c) => [
                'cguVersion' => $c->getCguVersion(),
                'acceptedAt' => $date($c->getCreatedAt()),
                'ipAddress' => $c->getIpAddress(),
            ], $user->getConsentLogs()->toArray()),
            'forum' => [
                'topics' => array_map(static fn (ForumTopic $t) => [
                    'id' => $t->getId(),
                    'title' => $t->getTitle(),
                    'createdAt' => $date($t->getCreatedAt()),
                ], $topics),
                'posts' => array_map(static fn (ForumPost $p) => [
                    'id' => $p->getId(),
                    'topic' => $p->getTopic()?->getTitle(),
                    'content' => $p->getContent(),
                    'isModerated' => $p->isModerated(),
                    'createdAt' => $date($p->getCreatedAt()),
                ], $posts),
                'subscriptions' => array_map(static fn (ForumSubscription $s) => [
                    'topic' => $s->getTopic()?->getTitle(),
                    'since' => $date($s->getCreatedAt()),
                ], $subscriptions),
            ],
            'videoFavorites' => array_map(static fn (VideoFavorite $f) => [
                'video' => $f->getVideo()?->getTitle(),
                'youtubeUrl' => $f->getVideo()?->getYoutubeUrl(),
                'addedAt' => $date($f->getCreatedAt()),
            ], $favorites),
        ];
    }

    /**
     * UC14, étape 1 : génère le jeton de confirmation (seule son empreinte est stockée).
     *
     * @return array{0: string, 1: \DateTimeImmutable} jeton en clair, expiration
     */
    public function requestDeletion(User $user): array
    {
        $plainToken = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable(self::DELETION_TTL);

        $user->setDeletionToken(hash('sha256', $plainToken))
            ->setDeletionTokenExpiresAt($expiresAt);
        $this->em->flush();

        return [$plainToken, $expiresAt];
    }

    /**
     * UC14, étape 2 : lien cliqué depuis l'email. Retourne false si le jeton est invalide ou expiré.
     */
    public function confirmDeletion(string $plainToken): bool
    {
        if ('' === $plainToken) {
            return false;
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['deletionToken' => hash('sha256', $plainToken)]);
        if (!$user || $user->getDeletionTokenExpiresAt() < new \DateTimeImmutable()) {
            return false;
        }

        $this->anonymize($user);

        return true;
    }

    /**
     * Effacement : le compte n'est plus rattachable à une personne.
     * Les messages du forum restent visibles sous « Utilisateur supprimé » (cohérence des discussions).
     */
    public function anonymize(User $user): void
    {
        if ($user->isAnonymized()) {
            return;
        }

        $identifier = $user->getUserIdentifier();

        // Sessions ouvertes : refresh tokens révoqués
        if ('' !== $identifier) {
            $this->em->createQueryBuilder()
                ->delete(RefreshToken::class, 'r')
                ->where('r.username = :username')
                ->setParameter('username', $identifier)
                ->getQuery()
                ->execute();
        }

        $this->em->createQueryBuilder()->delete(ForumSubscription::class, 's')->where('s.user = :user')
            ->setParameter('user', $user)->getQuery()->execute();
        $this->em->createQueryBuilder()->delete(VideoFavorite::class, 'f')->where('f.user = :user')
            ->setParameter('user', $user)->getQuery()->execute();

        // Abonnements Premium : conservés (obligation comptable : pièces justificatives 10 ans).
        // Ils restent rattachés à ce compte désormais anonyme (plus d'email ni de pseudo) :
        // seule la référence du prestataire de paiement permet, si besoin, de retrouver la facture.
        // L'accès Premium restant est en revanche supprimé.
        $user->setPremiumUntil(null);

        // La preuve de consentement est conservée, sans l'adresse IP
        foreach ($user->getConsentLogs() as $log) {
            $log->setIpAddress(null);
        }

        $user->setEmail(null)
            ->setPseudo(sprintf('utilisateur-supprime-%d', $user->getId()))
            // Hash invalide : aucune connexion possible
            ->setPassword('!anonymized')
            ->setRoles([])
            ->setIsVerified(false)
            ->setVerificationToken(null)
            ->setVerificationTokenExpiresAt(null)
            ->setDeletionToken(null)
            ->setDeletionTokenExpiresAt(null)
            ->setLastLoginAt(null)
            ->setAnonymizedAt(new \DateTimeImmutable());

        $this->em->flush();
    }

    /**
     * Purge planifiée (cron) : IP de plus de 90 jours, comptes inactifs depuis 3 ans.
     *
     * @return array{ipPurged: int, accountsAnonymized: int}
     */
    public function cleanup(bool $dryRun = false): array
    {
        $ipLimit = new \DateTimeImmutable(self::IP_RETENTION);
        $inactiveLimit = new \DateTimeImmutable(self::INACTIVITY_LIMIT);

        /** @var list<User> $inactive */
        $inactive = $this->em->createQueryBuilder()
            ->select('u')
            ->from(User::class, 'u')
            ->where('u.anonymizedAt IS NULL')
            ->andWhere('(u.lastLoginAt IS NOT NULL AND u.lastLoginAt < :limit) OR (u.lastLoginAt IS NULL AND u.createdAt < :limit)')
            ->setParameter('limit', $inactiveLimit)
            ->getQuery()
            ->getResult();

        if ($dryRun) {
            return [
                'ipPurged' => (int) $this->em->createQueryBuilder()
                    ->select('COUNT(c.id)')->from(ConsentLog::class, 'c')
                    ->where('c.createdAt < :before')->andWhere('c.ipAddress IS NOT NULL')
                    ->setParameter('before', $ipLimit)
                    ->getQuery()->getSingleScalarResult(),
                'accountsAnonymized' => \count($inactive),
            ];
        }

        $ipPurged = $this->consentLogs->purgeIpAddressesOlderThan($ipLimit);
        foreach ($inactive as $user) {
            $this->anonymize($user);
        }

        return ['ipPurged' => $ipPurged, 'accountsAnonymized' => \count($inactive)];
    }
}
