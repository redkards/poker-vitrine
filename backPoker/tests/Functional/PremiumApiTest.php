<?php

namespace App\Tests\Functional;

use App\Entity\PremiumSubscription;
use App\Entity\User;
use App\Entity\Video;
use App\Enum\PremiumPlan;
use App\Enum\PremiumSubscriptionStatus;
use App\Enum\VideoLevel;
use App\Repository\PremiumSubscriptionRepository;
use App\Service\GdprService;
use App\Service\Premium\FakePremiumPaymentProvider;
use App\Service\Premium\PremiumService;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * Abonnement Premium : verrouillage des vidéos, formules, souscription, activation manuelle, RGPD.
 */
class PremiumApiTest extends ApiTestCase
{
    private const PASSWORD = 'Quinte-Flush-2026!';

    private function member(string $pseudo = 'alice', ?string $premiumUntil = null): User
    {
        $user = (new User())->setEmail($pseudo.'@example.com')->setPseudo($pseudo)->setIsVerified(true);
        $user->setPassword(static::getContainer()->get('security.user_password_hasher')->hashPassword($user, self::PASSWORD));
        static::getContainer()->get(GdprService::class)->recordConsent($user, '203.0.113.7');
        if ($premiumUntil) {
            $user->setPremiumUntil(new \DateTimeImmutable($premiumUntil));
        }
        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    /**
     * @return array{Authorization: string}
     */
    private function auth(User $user): array
    {
        $data = $this->jsonRequest('POST', '/api/login', ['email' => $user->getEmail(), 'password' => self::PASSWORD]);

        return ['Authorization' => 'Bearer '.$data['token']];
    }

    private function video(string $title, bool $premium): Video
    {
        $video = (new Video())->setTitle($title)->setYoutubeUrl('https://youtu.be/Hmd7pvhNHls')->setCategory('Stratégie')
            ->setLevel($premium ? VideoLevel::Avance : VideoLevel::Debutant)->setPremium($premium)
            ->setPublishedAt(new \DateTimeImmutable('-1 day'));
        $this->em->persist($video);
        $this->em->flush();

        return $video;
    }

    public function testPremiumVideoIsLockedForAnonymousAndNonPremiumMembers(): void
    {
        $this->video('Les règles', false);
        $premium = $this->video('Ranges 3-bet', true);
        $bob = $this->member('bob');
        $bobAuth = $this->auth($bob);

        foreach ([[], $bobAuth] as $headers) {
            $detail = $this->jsonRequest('GET', '/api/videos/'.$premium->getId(), headers: $headers);
            self::assertResponseIsSuccessful();
            self::assertTrue($detail['premium']);
            self::assertTrue($detail['locked']);
            self::assertNull($detail['youtubeId']);
            self::assertArrayNotHasKey('youtubeUrl', $detail);

            $list = $this->jsonRequest('GET', '/api/videos', headers: $headers);
            $byTitle = array_column($list['items'], null, 'title');
            self::assertNull($byTitle['Ranges 3-bet']['youtubeId']);
            self::assertFalse($byTitle['Les règles']['locked']);
            self::assertSame('Hmd7pvhNHls', $byTitle['Les règles']['youtubeId']);
        }

        // Les favoris restent possibles, sans révéler la vidéo
        $this->jsonRequest('POST', '/api/videos/'.$premium->getId().'/favorite', headers: $bobAuth);
        self::assertResponseIsSuccessful();
        $favorites = $this->jsonRequest('GET', '/api/me/favorites', headers: $bobAuth);
        self::assertTrue($favorites[0]['locked']);
        self::assertNull($favorites[0]['youtubeId']);
    }

    public function testPremiumVideoIsUnlockedForPremiumMember(): void
    {
        $premium = $this->video('Ranges 3-bet', true);
        $carol = $this->member('carol', '+1 month');
        self::assertContains('ROLE_PREMIUM', $carol->getRoles());
        $auth = $this->auth($carol);

        $detail = $this->jsonRequest('GET', '/api/videos/'.$premium->getId(), headers: $auth);
        self::assertFalse($detail['locked']);
        self::assertSame('Hmd7pvhNHls', $detail['youtubeId']);

        $me = $this->jsonRequest('GET', '/api/me', headers: $auth);
        self::assertTrue($me['premium']);
        self::assertNotNull($me['premiumUntil']);
        self::assertContains('ROLE_PREMIUM', $me['roles']);
    }

    public function testExpiredPremiumIsLockedAgain(): void
    {
        $premium = $this->video('Ranges 3-bet', true);
        $dave = $this->member('dave', '-1 day');
        self::assertNotContains('ROLE_PREMIUM', $dave->getRoles());
        $auth = $this->auth($dave);

        $detail = $this->jsonRequest('GET', '/api/videos/'.$premium->getId(), headers: $auth);
        self::assertTrue($detail['locked']);
        self::assertFalse($this->jsonRequest('GET', '/api/me', headers: $auth)['premium']);
    }

    public function testPlansExposeConfiguredPrices(): void
    {
        $data = $this->jsonRequest('GET', '/api/premium/plans');
        self::assertResponseIsSuccessful();
        self::assertSame('EUR', $data['currency']);
        self::assertFalse($data['paymentEnabled']);

        $plans = array_column($data['plans'], null, 'code');
        self::assertSame(499, $plans['mensuel']['priceCents']);
        self::assertSame(4900, $plans['annuel']['priceCents']);
        self::assertSame(12, $plans['annuel']['months']);
        self::assertSame(18, $plans['annuel']['savingPercent']);
    }

    public function testSubscribeRequiresLoginAndAnswers503WhilePaymentIsClosed(): void
    {
        $this->jsonRequest('POST', '/api/premium/subscribe', ['plan' => 'mensuel']);
        self::assertResponseStatusCodeSame(401);

        $auth = $this->auth($this->member());
        $this->jsonRequest('POST', '/api/premium/subscribe', ['plan' => 'hebdo'], $auth);
        self::assertResponseStatusCodeSame(422);

        $data = $this->jsonRequest('POST', '/api/premium/subscribe', ['plan' => 'annuel'], $auth);
        self::assertResponseStatusCodeSame(503);
        self::assertSame('Le paiement en ligne n\'est pas encore ouvert.', $data['message']);
        self::assertSame(0, $this->em->getRepository(PremiumSubscription::class)->count([]));
    }

    public function testFakeProviderActivatesWhenPaymentIsEnabled(): void
    {
        $alice = $this->member();
        $container = static::getContainer();
        $service = new PremiumService(
            $this->em,
            $container->get(PremiumSubscriptionRepository::class),
            $container->get(FakePremiumPaymentProvider::class),
            true,
            499,
            4900,
        );

        [$subscription] = $service->subscribe($alice, PremiumPlan::Annuel);
        self::assertSame(PremiumSubscriptionStatus::Active, $subscription->getStatus());
        self::assertSame(4900, $subscription->getPriceCents());
        self::assertStringStartsWith('fake_', (string) $subscription->getProviderReference());
        self::assertTrue($alice->isPremium());
    }

    public function testPremiumCommandActivatesAndRevokes(): void
    {
        $alice = $this->member();
        $tester = new CommandTester((new Application(static::$kernel))->find('app:user:premium'));

        self::assertSame(0, $tester->execute(['email' => 'ALICE@example.com', '--months' => '3']));
        $this->em->refresh($alice);
        self::assertTrue($alice->isPremium());
        self::assertGreaterThan(new \DateTimeImmutable('+2 months'), $alice->getPremiumUntil());
        $subscription = $this->em->getRepository(PremiumSubscription::class)->findOneBy(['user' => $alice]);
        self::assertSame(PremiumSubscriptionStatus::Active, $subscription->getStatus());

        self::assertSame(0, $tester->execute(['email' => 'alice@example.com', '--revoke' => true]));
        $this->em->refresh($alice);
        self::assertFalse($alice->isPremium());
        $this->em->refresh($subscription);
        self::assertSame(PremiumSubscriptionStatus::Annulee, $subscription->getStatus());

        self::assertSame(1, $tester->execute(['email' => 'alice@example.com', '--months' => '0']));
        self::assertSame(1, $tester->execute(['email' => 'inconnu@example.com']));
    }

    public function testGdprExportAndAnonymizationKeepSubscriptions(): void
    {
        $alice = $this->member();
        static::getContainer()->get(PremiumService::class)->activate($alice, 12);

        $this->client->request('GET', '/api/me/export', server: ['HTTP_AUTHORIZATION' => $this->auth($alice)['Authorization']]);
        self::assertResponseIsSuccessful();
        $data = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertNotNull($data['account']['premiumUntil']);
        self::assertSame('annuel', $data['premiumSubscriptions'][0]['plan']);
        self::assertSame('active', $data['premiumSubscriptions'][0]['status']);

        $gdpr = static::getContainer()->get(GdprService::class);
        $gdpr->anonymize($this->em->getRepository(User::class)->find($alice->getId()));
        $this->em->clear();
        $subscriptions = $this->em->getRepository(PremiumSubscription::class)->findAll();
        self::assertCount(1, $subscriptions);
        self::assertNull($subscriptions[0]->getUser()?->getEmail());
        self::assertFalse($subscriptions[0]->getUser()?->isPremium());
    }
}
