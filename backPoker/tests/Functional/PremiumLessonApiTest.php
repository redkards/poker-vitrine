<?php

namespace App\Tests\Functional;

use App\Entity\User;
use App\Service\GdprService;

/**
 * Contenus Expert réservés aux membres Premium : GET /api/lessons/expert/{slug} et GET /api/lessons/ranges/expert.
 */
class PremiumLessonApiTest extends ApiTestCase
{
    private const PASSWORD = 'Quinte-Flush-2026!';
    private const URI = '/api/lessons/expert/icm-et-bulle';

    /**
     * @return array{Authorization: string}
     */
    private function memberAuth(string $pseudo, ?string $premiumUntil = null): array
    {
        $user = (new User())->setEmail($pseudo.'@example.com')->setPseudo($pseudo)->setIsVerified(true);
        $user->setPassword(static::getContainer()->get('security.user_password_hasher')->hashPassword($user, self::PASSWORD));
        static::getContainer()->get(GdprService::class)->recordConsent($user, '203.0.113.7');
        if ($premiumUntil) {
            $user->setPremiumUntil(new \DateTimeImmutable($premiumUntil));
        }
        $this->em->persist($user);
        $this->em->flush();

        $data = $this->jsonRequest('POST', '/api/login', ['email' => $user->getEmail(), 'password' => self::PASSWORD]);

        return ['Authorization' => 'Bearer '.$data['token']];
    }

    public function testAnonymousIsUnauthorized(): void
    {
        $data = $this->jsonRequest('GET', self::URI);

        self::assertResponseStatusCodeSame(401);
        self::assertArrayNotHasKey('steps', $data);
    }

    public function testNonPremiumMemberGetsPremiumRequired(): void
    {
        $data = $this->jsonRequest('GET', self::URI, headers: $this->memberAuth('bob'));

        self::assertResponseStatusCodeSame(403);
        self::assertSame('premium_required', $data['code']);
        self::assertNotEmpty($data['message']);
        self::assertArrayNotHasKey('steps', $data);
        self::assertStringContainsString('no-store', (string) $this->client->getResponse()->headers->get('Cache-Control'));
    }

    public function testExpiredPremiumIsRefused(): void
    {
        $data = $this->jsonRequest('GET', self::URI, headers: $this->memberAuth('carole', '-1 day'));

        self::assertResponseStatusCodeSame(403);
        self::assertSame('premium_required', $data['code']);
    }

    public function testPremiumMemberGetsFullLesson(): void
    {
        $data = $this->jsonRequest('GET', self::URI, headers: $this->memberAuth('alice', '+1 month'));

        self::assertResponseIsSuccessful();
        $cache = (string) $this->client->getResponse()->headers->get('Cache-Control');
        self::assertStringContainsString('private', $cache);
        self::assertStringContainsString('no-store', $cache);
        self::assertSame('icm-et-bulle', $data['slug']);
        self::assertSame('avance', $data['level']);
        self::assertSame('Expert', $data['levelLabel']);
        self::assertCount(2, $data['cover']);
        self::assertNotEmpty($data['steps']);
        self::assertArrayHasKey('visual', $data['steps'][0]);
        self::assertCount(5, $data['quiz']);
        self::assertArrayHasKey('answer', $data['quiz'][0]);
    }

    public function testUnknownSlugIsNotFound(): void
    {
        $this->jsonRequest('GET', '/api/lessons/expert/lecon-inexistante', headers: $this->memberAuth('alice', '+1 month'));

        self::assertResponseStatusCodeSame(404);
    }

    public function testExpertFileHoldsFifteenLessonsWithFiveQuestions(): void
    {
        $lessons = json_decode((string) file_get_contents(static::getContainer()->getParameter('kernel.project_dir').'/resources/lessons/expert.json'), true);

        self::assertCount(15, $lessons);
        foreach ($lessons as $lesson) {
            self::assertCount(5, $lesson['quiz'], $lesson['slug']);
        }
    }

    public function testExpertRangesAreReservedToPremiumMembers(): void
    {
        $uri = '/api/lessons/ranges/expert';

        $this->jsonRequest('GET', $uri);
        self::assertResponseStatusCodeSame(401);

        $data = $this->jsonRequest('GET', $uri, headers: $this->memberAuth('bob'));
        self::assertResponseStatusCodeSame(403);
        self::assertSame('premium_required', $data['code']);
        self::assertStringContainsString('no-store', (string) $this->client->getResponse()->headers->get('Cache-Control'));

        $charts = $this->jsonRequest('GET', $uri, headers: $this->memberAuth('alice', '+1 month'));
        self::assertResponseIsSuccessful();
        self::assertStringContainsString('no-store', (string) $this->client->getResponse()->headers->get('Cache-Control'));
        self::assertCount(3, $charts);
        foreach ($charts as $chart) {
            self::assertNotEmpty($chart['title']);
            self::assertNotEmpty($chart['actions']);
            self::assertNotEmpty($chart['actions'][0]['hands'], $chart['id']);
        }
    }
}
