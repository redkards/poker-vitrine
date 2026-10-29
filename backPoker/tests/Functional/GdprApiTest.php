<?php

namespace App\Tests\Functional;

use App\Entity\ConsentLog;
use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumSubscription;
use App\Entity\ForumTopic;
use App\Entity\RefreshToken;
use App\Entity\User;
use App\Entity\Video;
use App\Entity\VideoFavorite;
use App\Enum\VideoLevel;
use App\Service\GdprService;
use Symfony\Component\Mime\Email;

/**
 * Sprint 4 — Profil et conformité RGPD (droit d'accès, rectification, effacement, durées de conservation).
 */
class GdprApiTest extends ApiTestCase
{
    private const PASSWORD = 'Brelan-d-As-2026!';

    private function member(string $pseudo = 'alice'): User
    {
        $user = (new User())->setEmail($pseudo.'@example.com')->setPseudo($pseudo)->setIsVerified(true);
        $user->setPassword(static::getContainer()->get('security.user_password_hasher')->hashPassword($user, self::PASSWORD));
        static::getContainer()->get(GdprService::class)->recordConsent($user, '203.0.113.7');
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    /**
     * @return array{Authorization: string}
     */
    private function auth(User|string $user, string $password = self::PASSWORD): array
    {
        $email = $user instanceof User ? $user->getEmail() : $user;
        $data = $this->jsonRequest('POST', '/api/login', ['email' => $email, 'password' => $password]);

        return ['Authorization' => 'Bearer '.$data['token']];
    }

    private function video(): Video
    {
        $video = (new Video())->setTitle('Les règles')->setYoutubeUrl('https://youtu.be/Hmd7pvhNHls')
            ->setCategory('Règles')->setLevel(VideoLevel::Debutant)->setPublishedAt(new \DateTimeImmutable('-1 day'));
        $this->em->persist($video);
        $this->em->flush();

        return $video;
    }

    public function testUpdatePseudoAndRejectDuplicate(): void
    {
        $alice = $this->member();
        $this->member('bob');
        $headers = $this->auth($alice);

        $data = $this->jsonRequest('PATCH', '/api/me', ['pseudo' => 'alice_pro'], $headers);
        self::assertResponseIsSuccessful();
        self::assertSame('alice_pro', $data['pseudo']);

        $this->jsonRequest('PATCH', '/api/me', ['pseudo' => 'bob'], $headers);
        self::assertResponseStatusCodeSame(409);
    }

    public function testChangePasswordRequiresCurrentAndRevokesSessions(): void
    {
        $alice = $this->member();
        $login = $this->jsonRequest('POST', '/api/login', ['email' => 'alice@example.com', 'password' => self::PASSWORD]);
        $headers = ['Authorization' => 'Bearer '.$login['token']];

        $this->jsonRequest('POST', '/api/me/password', ['currentPassword' => 'faux', 'newPassword' => 'Quinte-Flush-2027!'], $headers);
        self::assertResponseStatusCodeSame(422);

        $this->jsonRequest('POST', '/api/me/password', ['currentPassword' => self::PASSWORD, 'newPassword' => 'Quinte-Flush-2027!'], $headers);
        self::assertResponseIsSuccessful();

        // Ancien refresh token révoqué, nouveau mot de passe actif
        $this->jsonRequest('POST', '/api/token/refresh', ['refresh_token' => $login['refresh_token']]);
        self::assertResponseStatusCodeSame(401);
        $this->auth('alice@example.com', 'Quinte-Flush-2027!');
        self::assertResponseIsSuccessful();
    }

    public function testExportContainsAllPersonalData(): void
    {
        $alice = $this->member();
        $topic = (new ForumTopic())->setCategory((new ForumCategory())->setSlug('debutants')->setName('Débutants'))
            ->setAuthor($alice)->setTitle('Ma première question');
        $topic->addPost((new ForumPost())->setAuthor($alice)->setContent('Bonjour à tous'));
        $this->em->persist($topic->getCategory());
        $this->em->persist($topic);
        $this->em->persist(new VideoFavorite($alice, $this->video()));
        $this->em->flush();

        $this->client->request('GET', '/api/me/export', server: ['HTTP_AUTHORIZATION' => $this->auth($alice)['Authorization']]);
        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('Content-Disposition', sprintf('attachment; filename="pokervitrine-mes-donnees-%s.json"', date('Y-m-d')));

        $data = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertSame('alice@example.com', $data['account']['email']);
        self::assertSame('203.0.113.7', $data['consents'][0]['ipAddress']);
        self::assertSame('Ma première question', $data['forum']['topics'][0]['title']);
        self::assertSame('Bonjour à tous', $data['forum']['posts'][0]['content']);
        self::assertSame('Les règles', $data['videoFavorites'][0]['video']);
        self::assertArrayNotHasKey('password', $data['account']);
    }

    public function testDeletionNeedsPasswordThenEmailConfirmationThenAnonymizes(): void
    {
        $alice = $this->member();
        $topic = (new ForumTopic())->setCategory((new ForumCategory())->setSlug('debutants')->setName('Débutants'))
            ->setAuthor($alice)->setTitle('Un sujet qui doit rester');
        $topic->addPost((new ForumPost())->setAuthor($alice)->setContent('Mon message'));
        $this->em->persist($topic->getCategory());
        $this->em->persist($topic);
        $this->em->persist(new ForumSubscription($alice, $topic));
        $this->em->persist(new VideoFavorite($alice, $this->video()));
        $this->em->flush();
        $headers = $this->auth($alice);

        $this->jsonRequest('DELETE', '/api/me', ['password' => 'mauvais'], $headers);
        self::assertResponseStatusCodeSame(422);
        self::assertEmailCount(0);

        $this->jsonRequest('DELETE', '/api/me', ['password' => self::PASSWORD], $headers);
        self::assertResponseStatusCodeSame(202);
        self::assertEmailCount(1);
        $email = $this->getMailerMessage();
        self::assertInstanceOf(Email::class, $email);
        preg_match('#suppression-compte\?token=([a-f0-9]{64})#', (string) $email->getTextBody(), $m);
        self::assertNotEmpty($m[1] ?? null);

        // Rien n'est effacé avant confirmation
        $this->em->clear();
        self::assertNotNull($this->em->getRepository(User::class)->findOneBy(['email' => 'alice@example.com']));

        $this->jsonRequest('POST', '/api/account-deletion/confirm', ['token' => $m[1]]);
        self::assertResponseIsSuccessful();

        // Vérification de la suppression effective
        $this->em->clear();
        $user = $this->em->getRepository(User::class)->find($alice->getId());
        self::assertNull($user->getEmail());
        self::assertNotNull($user->getAnonymizedAt());
        self::assertStringStartsWith('utilisateur-supprime-', $user->getPseudo());
        self::assertSame([], $this->em->getRepository(ForumSubscription::class)->findBy(['user' => $user]));
        self::assertSame([], $this->em->getRepository(VideoFavorite::class)->findBy(['user' => $user]));
        self::assertSame([], $this->em->getRepository(RefreshToken::class)->findBy(['username' => 'alice@example.com']));
        foreach ($this->em->getRepository(ConsentLog::class)->findBy(['user' => $user]) as $log) {
            self::assertNull($log->getIpAddress(), 'preuve de consentement conservée sans IP');
        }

        // Plus de connexion possible, messages conservés sous un nom anonyme
        $this->jsonRequest('POST', '/api/login', ['email' => 'alice@example.com', 'password' => self::PASSWORD]);
        self::assertResponseStatusCodeSame(401);
        $thread = $this->jsonRequest('GET', '/api/forum/topics/'.$topic->getId());
        self::assertSame('Utilisateur supprimé', $thread['items'][0]['author']['pseudo']);
        self::assertSame('Mon message', $thread['items'][0]['content']);
        self::assertStringNotContainsString('alice', (string) $this->client->getResponse()->getContent());

        // Lien à usage unique
        $this->jsonRequest('POST', '/api/account-deletion/confirm', ['token' => $m[1]]);
        self::assertResponseStatusCodeSame(400);
    }

    public function testExpiredDeletionLinkIsRefused(): void
    {
        $alice = $this->member();
        [$token] = static::getContainer()->get(GdprService::class)->requestDeletion($alice);
        $alice->setDeletionTokenExpiresAt(new \DateTimeImmutable('-1 minute'));
        $this->em->flush();

        $this->jsonRequest('POST', '/api/account-deletion/confirm', ['token' => $token]);
        self::assertResponseStatusCodeSame(400);
        $this->em->clear();
        self::assertNotNull($this->em->getRepository(User::class)->find($alice->getId())->getEmail());
    }

    public function testCleanupPurgesOldIpsAndAnonymizesInactiveAccounts(): void
    {
        $recent = $this->member('recent');
        $dormant = $this->member('dormant');
        $dormant->setLastLoginAt(new \DateTimeImmutable('-3 years -1 day'));
        $oldLog = (new ConsentLog())->setCguVersion('1.0')->setIpAddress('198.51.100.1');
        $recent->addConsentLog($oldLog);
        $this->em->persist($oldLog);
        $this->em->flush();
        $this->em->getConnection()->executeStatement('UPDATE consent_log SET created_at = ? WHERE id = ?', [
            (new \DateTimeImmutable('-91 days'))->format('Y-m-d H:i:s'),
            $oldLog->getId(),
        ]);

        $result = static::getContainer()->get(GdprService::class)->cleanup();

        self::assertSame(1, $result['ipPurged']);
        self::assertSame(1, $result['accountsAnonymized']);
        $this->em->clear();
        self::assertNull($this->em->getRepository(User::class)->find($dormant->getId())->getEmail());
        self::assertSame('recent@example.com', $this->em->getRepository(User::class)->find($recent->getId())->getEmail());
        self::assertNull($this->em->getRepository(ConsentLog::class)->find($oldLog->getId())->getIpAddress());
    }

    public function testVideoFavorites(): void
    {
        $alice = $this->member();
        $video = $this->video();
        $headers = $this->auth($alice);

        $this->jsonRequest('POST', '/api/videos/'.$video->getId().'/favorite');
        self::assertResponseStatusCodeSame(401);

        self::assertTrue($this->jsonRequest('POST', '/api/videos/'.$video->getId().'/favorite', [], $headers)['isFavorite']);
        $this->jsonRequest('POST', '/api/videos/'.$video->getId().'/favorite', [], $headers);
        $favorites = $this->jsonRequest('GET', '/api/me/favorites', [], $headers);
        self::assertSame(['Les règles'], array_column($favorites, 'title'), 'pas de doublon');

        self::assertFalse($this->jsonRequest('DELETE', '/api/videos/'.$video->getId().'/favorite', [], $headers)['isFavorite']);
        self::assertSame([], $this->jsonRequest('GET', '/api/me/favorites', [], $headers));
    }
}
