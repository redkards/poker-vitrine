<?php

namespace App\Tests\Functional;

use App\Entity\ConsentLog;
use App\Entity\User;
use Symfony\Component\Mime\Email;

/**
 * Sprint 1 — UC4 (inscription), vérification email, login JWT, refresh, /api/me.
 */
class AuthFlowTest extends ApiTestCase
{
    private const PASSWORD = 'Brelan-d-As-2026!';

    private function register(array $override = []): array
    {
        return $this->jsonRequest('POST', '/api/register', array_merge([
            'pseudo' => 'joueur_1',
            'email' => 'Joueur@Example.com',
            'password' => self::PASSWORD,
            'acceptCgu' => true,
        ], $override));
    }

    /**
     * Récupère le jeton en clair depuis le lien de l'email envoyé.
     */
    private function tokenFromLastEmail(): string
    {
        $email = $this->getMailerMessage();
        self::assertInstanceOf(Email::class, $email);
        self::assertMatchesRegularExpression('#/verify-email\?token=([a-f0-9]{64})#', (string) $email->getTextBody());
        preg_match('#token=([a-f0-9]{64})#', (string) $email->getTextBody(), $m);

        return $m[1];
    }

    private function login(string $email = 'joueur@example.com', string $password = self::PASSWORD): array
    {
        return $this->jsonRequest('POST', '/api/login', ['email' => $email, 'password' => $password]);
    }

    public function testRegisterCreatesUnverifiedUserWithConsentAndSendsEmail(): void
    {
        $data = $this->register();

        self::assertResponseStatusCodeSame(201);
        self::assertStringContainsString('boîte mail', $data['message']);
        self::assertEmailCount(1);

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => 'joueur@example.com']);
        self::assertNotNull($user, 'email normalisé en minuscules');
        self::assertFalse($user->isVerified());
        self::assertSame('1.0', $user->getConsentVersion());
        self::assertStringStartsWith('$argon2id$', $user->getPassword());

        $logs = $this->em->getRepository(ConsentLog::class)->findBy(['user' => $user]);
        self::assertCount(1, $logs);
        self::assertSame('1.0', $logs[0]->getCguVersion());
        self::assertNotNull($logs[0]->getIpAddress());

        // Le jeton en clair n'est jamais stocké
        $plain = $this->tokenFromLastEmail();
        self::assertSame(hash('sha256', $plain), $user->getVerificationToken());
    }

    public function testRegisterRequiresExplicitConsent(): void
    {
        $this->register(['acceptCgu' => false]);
        self::assertResponseStatusCodeSame(422);
        self::assertEmailCount(0);
    }

    public function testRegisterRejectsWeakPasswordAndBadEmail(): void
    {
        $this->register(['password' => 'azerty12', 'email' => 'pas-un-email']);
        self::assertResponseStatusCodeSame(422);
    }

    public function testRegisterRejectsDuplicateEmailAndPseudo(): void
    {
        $this->register();
        $data = $this->register(['pseudo' => 'autre']);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('Un compte existe déjà avec cet email.', $data['message']);

        $this->register(['email' => 'autre@example.com']);
        self::assertResponseStatusCodeSame(409);
    }

    public function testLoginIsRefusedUntilEmailIsVerified(): void
    {
        $this->register();
        $data = $this->login();

        self::assertResponseStatusCodeSame(401);
        self::assertStringContainsString('confirmer votre adresse email', $data['message']);
    }

    public function testFullFlowVerifyLoginMeAndRefresh(): void
    {
        $this->register();
        $token = $this->tokenFromLastEmail();

        $this->jsonRequest('GET', '/api/verify-email?token='.$token);
        self::assertResponseIsSuccessful();

        // Lien à usage unique
        $this->jsonRequest('GET', '/api/verify-email?token='.$token);
        self::assertResponseStatusCodeSame(400);

        $auth = $this->login();
        self::assertResponseIsSuccessful();
        self::assertArrayHasKey('token', $auth);
        self::assertArrayHasKey('refresh_token', $auth);

        $me = $this->jsonRequest('GET', '/api/me', [], ['Authorization' => 'Bearer '.$auth['token']]);
        self::assertResponseIsSuccessful();
        self::assertSame('joueur_1', $me['pseudo']);
        self::assertSame(['ROLE_USER'], $me['roles']);
        self::assertNotNull($me['lastLoginAt']);
        self::assertArrayNotHasKey('password', $me);

        $refreshed = $this->jsonRequest('POST', '/api/token/refresh', ['refresh_token' => $auth['refresh_token']]);
        self::assertResponseIsSuccessful();
        self::assertArrayHasKey('token', $refreshed);
        self::assertNotSame($auth['refresh_token'], $refreshed['refresh_token'], 'rotation du refresh token');

        // Usage unique : l'ancien refresh token est révoqué
        $this->jsonRequest('POST', '/api/token/refresh', ['refresh_token' => $auth['refresh_token']]);
        self::assertResponseStatusCodeSame(401);
    }

    public function testExpiredLinkReturns410AndResendIssuesNewOne(): void
    {
        $this->register();
        $token = $this->tokenFromLastEmail();

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => 'joueur@example.com']);
        $user->setVerificationTokenExpiresAt(new \DateTimeImmutable('-1 minute'));
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/verify-email?token='.$token);
        self::assertResponseStatusCodeSame(410);
        self::assertSame('expired', $data['code']);

        $this->jsonRequest('POST', '/api/verify-email/resend', ['email' => 'joueur@example.com']);
        self::assertResponseStatusCodeSame(202);
        self::assertEmailCount(1);

        $this->jsonRequest('GET', '/api/verify-email?token='.$this->tokenFromLastEmail());
        self::assertResponseIsSuccessful();
    }

    public function testResendDoesNotRevealUnknownEmails(): void
    {
        $data = $this->jsonRequest('POST', '/api/verify-email/resend', ['email' => 'inconnu@example.com']);
        self::assertResponseStatusCodeSame(202);
        self::assertEmailCount(0);
        self::assertStringStartsWith('Si un compte', $data['message']);
    }

    public function testMeRequiresAuthentication(): void
    {
        $this->jsonRequest('GET', '/api/me');
        self::assertResponseStatusCodeSame(401);
    }

    public function testLoginIsThrottledAfterFiveFailures(): void
    {
        for ($i = 0; $i < 5; ++$i) {
            $this->login('personne@example.com', 'mauvais');
            self::assertResponseStatusCodeSame(401);
        }

        $this->login('personne@example.com', 'mauvais');
        self::assertResponseStatusCodeSame(429);
    }
}
