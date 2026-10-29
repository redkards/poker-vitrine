<?php

namespace App\Tests\Functional;

use App\Entity\Article;
use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumPostReport;
use App\Entity\ForumTopic;
use App\Entity\User;
use App\Enum\ReportReason;

/**
 * v1.1 — Communauté : signalement des messages, recherche, profil public ; documentation de l'API.
 */
class CommunityApiTest extends ApiTestCase
{
    private const PASSWORD = 'Brelan-d-As-2026!';

    private function member(string $pseudo, array $roles = [], bool $verified = true): User
    {
        $user = (new User())
            ->setEmail($pseudo.'@example.com')
            ->setPseudo($pseudo)
            ->setRoles($roles)
            ->setIsVerified($verified)
            ->setConsentVersion('1.0')
            ->setConsentAt(new \DateTimeImmutable());
        $user->setPassword(static::getContainer()->get('security.user_password_hasher')->hashPassword($user, self::PASSWORD));
        $this->em->persist($user);

        return $user;
    }

    private function auth(User $user): array
    {
        $data = $this->jsonRequest('POST', '/api/login', ['email' => $user->getEmail(), 'password' => self::PASSWORD]);

        return ['Authorization' => 'Bearer '.$data['token']];
    }

    /**
     * Sujet d'alice avec un message d'alice puis un de bob.
     *
     * @return array{topic: ForumTopic, alicePost: ForumPost, bobPost: ForumPost}
     */
    private function thread(User $alice, User $bob, string $title = 'Gérer son tapis en fin de tournoi'): array
    {
        $category = (new ForumCategory())->setSlug('tournois')->setName('Tournois');
        $this->em->persist($category);
        $topic = (new ForumTopic())->setCategory($category)->setAuthor($alice)->setTitle($title);
        $topic->addPost($alicePost = (new ForumPost())->setAuthor($alice)->setContent('Push or fold à 10 blindes ?'));
        $topic->addPost($bobPost = (new ForumPost())->setAuthor($bob)->setContent('Achetez mes jetons sur ce site douteux'));
        $this->em->persist($topic);
        $this->em->flush();

        return ['topic' => $topic, 'alicePost' => $alicePost, 'bobPost' => $bobPost];
    }

    // --- Signalement -------------------------------------------------------------------------

    public function testMemberReportsAPostOnlyOnce(): void
    {
        $alice = $this->member('alice');
        $bob = $this->member('bob');
        $post = $this->thread($alice, $bob)['bobPost'];
        $headers = $this->auth($alice);

        $data = $this->jsonRequest('POST', '/api/forum/posts/'.$post->getId().'/report', ['reason' => 'spam', 'comment' => '  Lien publicitaire  '], $headers);
        self::assertResponseStatusCodeSame(201);
        self::assertSame($post->getId(), $data['postId']);
        self::assertSame('spam', $data['reason']);
        self::assertArrayHasKey('message', $data);

        $report = $this->em->getRepository(ForumPostReport::class)->findOneBy([]);
        self::assertSame('Lien publicitaire', $report->getComment());
        self::assertFalse($report->isResolved());

        $data = $this->jsonRequest('POST', '/api/forum/posts/'.$post->getId().'/report', ['reason' => 'insulte'], $headers);
        self::assertResponseStatusCodeSame(409);
        self::assertSame('Vous avez déjà signalé ce message.', $data['message']);
        self::assertSame(1, $this->em->getRepository(ForumPostReport::class)->count([]));
    }

    public function testReportRefusals(): void
    {
        $alice = $this->member('alice');
        $bob = $this->member('bob');
        $thread = $this->thread($alice, $bob);
        $uri = '/api/forum/posts/'.$thread['bobPost']->getId().'/report';

        // Anonyme
        $this->jsonRequest('POST', $uri, ['reason' => 'spam']);
        self::assertResponseStatusCodeSame(401);

        $headers = $this->auth($alice);

        // Son propre message
        $this->jsonRequest('POST', '/api/forum/posts/'.$thread['alicePost']->getId().'/report', ['reason' => 'spam'], $headers);
        self::assertResponseStatusCodeSame(403);

        // Motif inconnu et commentaire trop long
        $data = $this->jsonRequest('POST', $uri, ['reason' => 'nul', 'comment' => str_repeat('a', 501)], $headers);
        self::assertResponseStatusCodeSame(422);
        self::assertContains('reason', array_column($data['violations'], 'propertyPath'));
        self::assertContains('comment', array_column($data['violations'], 'propertyPath'));

        // Message inexistant
        $this->jsonRequest('POST', '/api/forum/posts/999999/report', ['reason' => 'spam'], $headers);
        self::assertResponseStatusCodeSame(404);

        self::assertSame(0, $this->em->getRepository(ForumPostReport::class)->count([]));
    }

    public function testModeratorResolvesReportFromBackOffice(): void
    {
        $alice = $this->member('alice');
        $bob = $this->member('bob');
        $mod = $this->member('arbitre', ['ROLE_MODERATOR']);
        $post = $this->thread($alice, $bob)['bobPost'];
        $this->em->persist($report = new ForumPostReport($post, $alice, ReportReason::Spam));
        $this->em->flush();
        $reportId = $report->getId();

        // Un simple membre n'accède pas à la file de modération
        $this->client->loginUser($alice);
        $this->client->request('GET', '/admin/forum-post-report');
        self::assertResponseStatusCodeSame(403);

        $this->client->loginUser($mod);
        $crawler = $this->client->request('GET', '/admin/forum-post-report');
        self::assertResponseIsSuccessful();

        // Sans jeton CSRF valide : refus
        $this->client->request('GET', '/admin/forum-post-report/'.$reportId.'/resolve?_token=faux');
        self::assertResponseStatusCodeSame(403);

        $link = $crawler->filter('a[href*="/resolve"]')->first()->attr('href');
        self::assertNotNull($link);
        $this->client->request('GET', $link);
        self::assertResponseRedirects();

        $this->em->clear();
        $report = $this->em->getRepository(ForumPostReport::class)->find($reportId);
        self::assertTrue($report->isResolved());
        self::assertSame('arbitre', $report->getResolvedBy()?->getPseudo());
    }

    // --- Recherche ---------------------------------------------------------------------------

    public function testSearchReturnsPublishedArticlesAndVisibleTopics(): void
    {
        $alice = $this->member('alice');
        $bob = $this->member('bob');
        $this->thread($alice, $bob, 'Le bluff en tournoi');

        $category = $this->em->getRepository(ForumCategory::class)->findOneBy([]);
        $other = (new ForumTopic())->setCategory($category)->setAuthor($bob)->setTitle('Question de cash game');
        $other->addPost((new ForumPost())->setAuthor($bob)->setContent('Un semi-bluff sur le flop ?'));
        $hidden = (new ForumTopic())->setCategory($category)->setAuthor($bob)->setTitle('Sujet sans rapport');
        $hidden->addPost((new ForumPost())->setAuthor($bob)->setContent('Bluff injurieux')->setIsModerated(true));
        $this->em->persist($other);
        $this->em->persist($hidden);

        foreach (['Bluffer moins, gagner plus' => '-1 day', 'Bluff : article à venir' => '+1 day'] as $title => $date) {
            $this->em->persist((new Article())->setTitle($title)->setSlug(substr(md5($title), 0, 10))->setExcerpt('Résumé')
                ->setContent('<p>Contenu</p>')->setPublishedAt(new \DateTimeImmutable($date)));
        }
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/search?q='.urlencode('  BLUFF '));

        self::assertResponseIsSuccessful();
        self::assertSame('BLUFF', $data['query']);
        self::assertSame(['Bluffer moins, gagner plus'], array_column($data['articles'], 'title'), 'articles non publiés exclus');
        $titles = array_column($data['topics'], 'title');
        sort($titles);
        self::assertSame(['Le bluff en tournoi', 'Question de cash game'], $titles, 'messages masqués ignorés');
        self::assertSame(['slug' => 'tournois', 'name' => 'Tournois'], $data['topics'][0]['category']);
        self::assertArrayHasKey('pseudo', $data['topics'][0]['author']);
        self::assertStringNotContainsString('@example.com', (string) $this->client->getResponse()->getContent());
    }

    public function testSearchValidatesQueryAndEscapesWildcards(): void
    {
        $this->thread($this->member('alice'), $this->member('bob'));

        $this->jsonRequest('GET', '/api/search?q=a');
        self::assertResponseStatusCodeSame(400);
        $this->jsonRequest('GET', '/api/search');
        self::assertResponseStatusCodeSame(400);
        $this->jsonRequest('GET', '/api/search?q='.str_repeat('x', 101));
        self::assertResponseStatusCodeSame(400);

        // « %% » ne doit pas devenir un joker qui renvoie tout
        $data = $this->jsonRequest('GET', '/api/search?q='.urlencode('%%'));
        self::assertResponseIsSuccessful();
        self::assertSame([], $data['topics']);
        self::assertSame([], $data['articles']);
    }

    // --- Profil public -----------------------------------------------------------------------

    public function testPublicProfileShowsOnlyPublicData(): void
    {
        $alice = $this->member('alice');
        $bob = $this->member('bob');
        $thread = $this->thread($alice, $bob);
        $thread['topic']->addPost((new ForumPost())->setAuthor($bob)->setContent('Message masqué')->setIsModerated(true));
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/members/bob');

        self::assertResponseIsSuccessful();
        self::assertSame(['pseudo', 'createdAt', 'postCount'], array_keys($data));
        self::assertSame('bob', $data['pseudo']);
        self::assertSame(1, $data['postCount'], 'les messages masqués ne sont pas comptés');
        self::assertNotFalse(\DateTimeImmutable::createFromFormat(\DATE_ATOM, $data['createdAt']));
        self::assertStringNotContainsString('@', (string) $this->client->getResponse()->getContent());
    }

    public function testPublicProfileHidesAnonymizedUnverifiedAndUnknownMembers(): void
    {
        $this->member('fantome')->setAnonymizedAt(new \DateTimeImmutable());
        $this->member('nouveau', verified: false);
        $this->em->flush();

        foreach (['fantome', 'nouveau', 'inconnu'] as $pseudo) {
            $data = $this->jsonRequest('GET', '/api/members/'.$pseudo);
            self::assertResponseStatusCodeSame(404);
            self::assertSame('Membre introuvable.', $data['message']);
        }
    }

    // --- Documentation de l'API --------------------------------------------------------------

    public function testApiDocIsNotExposedOutsideDev(): void
    {
        $this->client->request('GET', '/api/doc');
        self::assertResponseStatusCodeSame(404);
        $this->client->request('GET', '/api/doc.json');
        self::assertResponseStatusCodeSame(404);
    }
}
