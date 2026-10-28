<?php

namespace App\Controller\Api;

use App\Dto\RegisterRequest;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\GdprService;
use App\Service\MailService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class UserController extends AbstractController
{
    private const VERIFICATION_TTL = '+24 hours';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $users,
        private readonly MailService $mailService,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * UC4 — S'inscrire
     */
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(
        #[MapRequestPayload] RegisterRequest $payload,
        Request $request,
        UserPasswordHasherInterface $hasher,
        GdprService $gdpr,
        RateLimiterFactoryInterface $registerLimiter,
    ): JsonResponse {
        if (!$registerLimiter->create($request->getClientIp())->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de tentatives, réessayez dans une minute.'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        if ($this->users->findOneBy(['email' => mb_strtolower(trim($payload->email))])) {
            return $this->json(['message' => 'Un compte existe déjà avec cet email.'], Response::HTTP_CONFLICT);
        }
        if ($this->users->findOneBy(['pseudo' => trim($payload->pseudo)])) {
            return $this->json(['message' => 'Ce pseudo est déjà utilisé.'], Response::HTTP_CONFLICT);
        }

        $user = (new User())
            ->setEmail($payload->email)
            ->setPseudo($payload->pseudo);
        $user->setPassword($hasher->hashPassword($user, $payload->password));

        $gdpr->recordConsent($user, $request->getClientIp());
        [$plainToken, $expiresAt] = $this->issueVerificationToken($user);

        $this->em->persist($user);
        $this->em->flush();

        $this->sendVerificationEmail($user, $plainToken, $expiresAt);

        return $this->json([
            'message' => 'Compte créé. Consultez votre boîte mail pour activer votre compte.',
        ], Response::HTTP_CREATED);
    }

    /**
     * Activation du compte depuis le lien reçu par email.
     */
    #[Route('/verify-email', name: 'api_verify_email', methods: ['GET'])]
    public function verifyEmail(#[MapQueryParameter] string $token = ''): JsonResponse
    {
        $user = '' !== $token ? $this->users->findOneByVerificationToken(hash('sha256', $token)) : null;

        if (!$user) {
            return $this->json(['code' => 'invalid', 'message' => 'Lien de vérification invalide ou déjà utilisé.'], Response::HTTP_BAD_REQUEST);
        }

        if ($user->getVerificationTokenExpiresAt() < new \DateTimeImmutable()) {
            return $this->json(['code' => 'expired', 'message' => 'Ce lien a expiré. Demandez-en un nouveau.'], Response::HTTP_GONE);
        }

        $user->setIsVerified(true)
            ->setVerificationToken(null)
            ->setVerificationTokenExpiresAt(null);
        $this->em->flush();

        return $this->json(['message' => 'Adresse email confirmée, vous pouvez vous connecter.']);
    }

    /**
     * Renvoi du lien (lien expiré ou perdu).
     * Réponse identique que le compte existe ou non (pas d'énumération des emails).
     */
    #[Route('/verify-email/resend', name: 'api_verify_email_resend', methods: ['POST'])]
    public function resendVerification(Request $request, RateLimiterFactoryInterface $verificationResendLimiter): JsonResponse
    {
        $email = mb_strtolower(trim((string) ($request->toArray()['email'] ?? '')));

        if (!$verificationResendLimiter->create($request->getClientIp().'|'.$email)->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de demandes, réessayez plus tard.'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        $user = '' !== $email ? $this->users->findOneBy(['email' => $email]) : null;
        if ($user && !$user->isVerified()) {
            [$plainToken, $expiresAt] = $this->issueVerificationToken($user);
            $this->em->flush();
            $this->sendVerificationEmail($user, $plainToken, $expiresAt);
        }

        return $this->json([
            'message' => 'Si un compte non activé correspond à cet email, un nouveau lien vient d\'être envoyé.',
        ], Response::HTTP_ACCEPTED);
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function me(#[CurrentUser] User $user): JsonResponse
    {
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'pseudo' => $user->getPseudo(),
            'roles' => $user->getRoles(),
            'isVerified' => $user->isVerified(),
            'createdAt' => $user->getCreatedAt()?->format(\DATE_ATOM),
            'lastLoginAt' => $user->getLastLoginAt()?->format(\DATE_ATOM),
            'consentVersion' => $user->getConsentVersion(),
        ]);
    }

    /**
     * Génère un jeton aléatoire ; seule son empreinte est stockée.
     *
     * @return array{0: string, 1: \DateTimeImmutable}
     */
    private function issueVerificationToken(User $user): array
    {
        $plainToken = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable(self::VERIFICATION_TTL);

        $user->setVerificationToken(hash('sha256', $plainToken))
            ->setVerificationTokenExpiresAt($expiresAt);

        return [$plainToken, $expiresAt];
    }

    private function sendVerificationEmail(User $user, string $plainToken, \DateTimeImmutable $expiresAt): void
    {
        try {
            $this->mailService->sendVerificationEmail($user, $plainToken, $expiresAt);
        } catch (TransportExceptionInterface $e) {
            // Le compte existe : l'utilisateur pourra redemander un lien
            $this->logger->error('Echec envoi email de vérification', ['userId' => $user->getId(), 'error' => $e->getMessage()]);
        }
    }
}
