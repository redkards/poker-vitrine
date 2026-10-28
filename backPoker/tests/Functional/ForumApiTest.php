<?php

namespace App\Tests\Functional;

use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumTopic;
use App\Entity\User;
use Symfony\Component\Mime\Email;

/**
 * Sprint 3 — Forum : lecture publique, écriture membres, verrouillage, modération, notifications.
 */
class ForumApiTest extends ApiTestCase
{
    private const PASSWORD = 'Brelan-d-As-2026!';

    private function member(string $pseudo, array $roles = []): User
    {
        $user = (new User())
            ->setEmail($pseudo.'@example.com')
            ->setPseudo($pseudo)
            ->setRoles($roles)
            ->setIsVerified(true)
            ->setConsentVersion('1.0')
            ->setConsentAt(new \DateTimeImmutable());
        $user->setPassword(static::getContainer()->get('security.user_password_hasher')->hashPassword($user, self::PASSWORD));
        $this->em->persist($user);

        return $user;
    }

    private function category(string $slug = 'debutants'): ForumCategory
    {
        $category = (new ForumCategory())->setSlug($slug)->setName(ucfirst($slug));
        $this->em->persist($category);

        return $category;
    }

    private function token(User $user): string
    {
        $data = $this->jsonRequest('POST', '/api/login', ['email' => $user->getEmail(), 'password' => self::PASSWORD]);

        return $data['token'];
    }

    private function auth(User $user): array
    {
        return ['Authorization' => 'Bearer '.$this->token($user)];
    }

    public function testCategoriesWithCounters(): void
    {
        $author = $this->member('alice');
        $category = $this->category();
        $this->category('tournois');
        $topic = (new ForumTopic())->setCategory($category)->setAuthor($author)->setTitle('Premier sujet');
        $topic->addPost((new ForumPost())->setAuthor($author)->setContent('Bonjour'));
        $topic->addPost((new ForumPost())->setAuthor($author)->setContent('Masqué')->setIsModerated(true));
        $this->em->persist($topic);
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/forum/categories');

        self::assertResponseIsSuccessful();
        self::assertCount(2, $data);
        $debutants = $data[array_search('debutants', array_column($data, 'slug'), true)];
        self::assertSame(1, $debutants['topicCount']);
        self::assertSame(1, $debutants['postCount'], 'les messages masqués ne sont pas comptés');
        self::assertNotNull($debutants['lastPostAt']);
    }

    public function testGuestCanReadButNotWrite(): void
    {
        $this->category();
        $this->em->flush();

        $this->jsonRequest('GET', '/api/forum/categories/debutants/topics');
        self::assertResponseIsSuccessful();

        $this->jsonRequest('POST', '/api/forum/categories/debutants/topics', ['title' => 'Un sujet', 'content' => 'Texte']);
        self::assertResponseStatusCodeSame(401);
    }

    public function testMemberCreatesTopicAndRepliesWithNotification(): void
    {
        $alice = $this->member('alice');
        $bob = $this->member('bob');
        $this->category();
        $this->em->flush();

        $topic = $this->jsonRequest('POST', '/api/forum/categories/debutants/topics', [
            'title' => 'Comment calculer ses outs ?',
            'content' => "Je ne comprends pas\nla règle du 2 et 4.",
        ], $this->auth($alice));
        self::assertResponseStatusCodeSame(201);
        self::assertSame('alice', $topic['author']['pseudo']);

        $thread = $this->jsonRequest('GET', '/api/forum/topics/'.$topic['id'], [], $this->auth($alice));
        self::assertTrue($thread['topic']['isSubscribed'], 'l’auteur est abonné automatiquement');
        self::assertSame("Je ne comprends pas\nla règle du 2 et 4.", $thread['items'][0]['content']);

        $this->jsonRequest('POST', '/api/forum/topics/'.$topic['id'].'/posts', ['content' => 'Multiplie tes outs par 2 ou 4.'], $this->auth($bob));
        self::assertResponseStatusCodeSame(201);

        // Alice (abonnée) est prévenue, pas Bob (auteur de la réponse)
        self::assertEmailCount(1);
        $email = $this->getMailerMessage();
        self::assertInstanceOf(Email::class, $email);
        self::assertSame('alice@example.com', $email->getTo()[0]->getAddress());
        self::assertStringContainsString('/forum/sujet/'.$topic['id'], (string) $email->getTextBody());

        $list = $this->jsonRequest('GET', '/api/forum/categories/debutants/topics');
        self::assertSame(1, $list['items'][0]['replyCount']);
    }

    public function testValidationOnTopicCreation(): void
    {
        $alice = $this->member('alice');
        $this->category();
        $this->em->flush();

        $data = $this->jsonRequest('POST', '/api/forum/categories/debutants/topics', ['title' => 'Bof', 'content' => ''], $this->auth($alice));
        self::assertResponseStatusCodeSame(422);
        self::assertContains('title', array_column($data['violations'], 'propertyPath'));
        self::assertContains('content', array_column($data['violations'], 'propertyPath'));
    }

    public function testLockedTopicRefusesReplies(): void
    {
        $alice = $this->member('alice');
        $topic = (new ForumTopic())->setCategory($this->category())->setAuthor($alice)->setTitle('Sujet clos')->setIsLocked(true);
        $topic->addPost((new ForumPost())->setAuthor($alice)->setContent('Fin'));
        $this->em->persist($topic);
        $this->em->flush();

        $this->jsonRequest('POST', '/api/forum/topics/'.$topic->getId().'/posts', ['content' => 'Encore un mot'], $this->auth($alice));
        self::assertResponseStatusCodeSame(403);
    }

    public function testModeratedPostContentIsNeverServedAndRolesAreShown(): void
    {
        $mod = $this->member('arbitre', ['ROLE_MODERATOR']);
        $alice = $this->member('alice');
        $topic = (new ForumTopic())->setCategory($this->category())->setAuthor($mod)->setTitle('Règles du forum');
        $topic->addPost((new ForumPost())->setAuthor($mod)->setContent('Soyez courtois.'));
        $topic->addPost((new ForumPost())->setAuthor($alice)->setContent('Propos injurieux')->setIsModerated(true));
        $this->em->persist($topic);
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/forum/topics/'.$topic->getId());

        self::assertSame('Modérateur', $data['items'][0]['author']['role']);
        self::assertTrue($data['items'][1]['isModerated']);
        self::assertNull($data['items'][1]['content']);
        self::assertStringNotContainsString('injurieux', (string) $this->client->getResponse()->getContent());
        self::assertStringNotContainsString('@example.com', (string) $this->client->getResponse()->getContent());
    }

    public function testSubscriptionToggle(): void
    {
        $alice = $this->member('alice');
        $bob = $this->member('bob');
        $topic = (new ForumTopic())->setCategory($this->category())->setAuthor($alice)->setTitle('Un sujet suivi');
        $topic->addPost((new ForumPost())->setAuthor($alice)->setContent('Hello'));
        $this->em->persist($topic);
        $this->em->flush();

        $headers = $this->auth($bob);
        self::assertTrue($this->jsonRequest('POST', '/api/forum/topics/'.$topic->getId().'/subscription', [], $headers)['isSubscribed']);
        self::assertFalse($this->jsonRequest('DELETE', '/api/forum/topics/'.$topic->getId().'/subscription', [], $headers)['isSubscribed']);
    }

    public function testPostingIsRateLimited(): void
    {
        $alice = $this->member('alice');
        $topic = (new ForumTopic())->setCategory($this->category())->setAuthor($alice)->setTitle('Sujet très actif');
        $topic->addPost((new ForumPost())->setAuthor($alice)->setContent('Départ'));
        $this->em->persist($topic);
        $this->em->flush();

        $headers = $this->auth($alice);
        for ($i = 1; $i <= 5; ++$i) {
            $this->jsonRequest('POST', '/api/forum/topics/'.$topic->getId().'/posts', ['content' => 'Message '.$i], $headers);
            self::assertResponseStatusCodeSame(201);
        }

        $this->jsonRequest('POST', '/api/forum/topics/'.$topic->getId().'/posts', ['content' => 'Un de trop'], $headers);
        self::assertResponseStatusCodeSame(429);
    }

    public function testModeratorAccessesForumModerationButNotContent(): void
    {
        $mod = $this->member('arbitre', ['ROLE_MODERATOR']);
        $this->em->flush();
        $this->client->loginUser($mod);

        $this->client->request('GET', '/admin/forum-post');
        self::assertResponseIsSuccessful();

        $this->client->request('GET', '/admin/article');
        self::assertResponseStatusCodeSame(403);

        $this->client->request('GET', '/admin/forum-category');
        self::assertResponseStatusCodeSame(403);
    }
}
