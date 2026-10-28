<?php

namespace App\Tests\Functional;

use App\Entity\Article;
use App\Entity\User;
use App\Entity\Video;
use App\Enum\VideoLevel;

/**
 * Sprint 2 — API de contenu public et accès au back-office.
 */
class ContentApiTest extends ApiTestCase
{
    private function article(string $title, ?string $publishedAt = '-1 day', ?string $slug = null): Article
    {
        $article = (new Article())
            ->setTitle($title)
            ->setSlug($slug)
            ->setCategory('Stratégie')
            ->setExcerpt('Résumé')
            ->setContent('<p>Contenu</p>')
            ->setPublishedAt($publishedAt ? new \DateTimeImmutable($publishedAt) : null);
        $this->em->persist($article);

        return $article;
    }

    private function video(string $title, VideoLevel $level, ?string $publishedAt = '-1 day'): Video
    {
        $video = (new Video())
            ->setTitle($title)
            ->setYoutubeUrl('https://youtu.be/Hmd7pvhNHls')
            ->setCategory('Règles')
            ->setLevel($level)
            ->setPublishedAt($publishedAt ? new \DateTimeImmutable($publishedAt) : null);
        $this->em->persist($video);

        return $video;
    }

    public function testArticlesListOnlyPublishedNewestFirstWithoutContent(): void
    {
        $this->article('Ancien', '-10 days');
        $this->article('Récent', '-1 hour');
        $this->article('Brouillon', null);
        $this->article('Programmé', '+2 days');
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/articles');

        self::assertResponseIsSuccessful();
        self::assertSame(2, $data['total']);
        self::assertSame(['Récent', 'Ancien'], array_column($data['items'], 'title'));
        self::assertArrayNotHasKey('content', $data['items'][0], 'le contenu complet n’est servi que par le détail');
        self::assertArrayHasKey('slug', $data['items'][0]);
    }

    public function testArticlesPagination(): void
    {
        for ($i = 1; $i <= 5; ++$i) {
            $this->article('Article '.$i, sprintf('-%d hours', $i));
        }
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/articles?page=2&limit=2');

        self::assertSame(5, $data['total']);
        self::assertSame(3, $data['pages']);
        self::assertSame(['Article 3', 'Article 4'], array_column($data['items'], 'title'));
    }

    public function testSlugIsGeneratedAndDeduplicated(): void
    {
        $first = $this->article('Gérer son tapis en tournoi !');
        $second = $this->article('Gérer son tapis en tournoi !');
        $this->em->flush();

        self::assertSame('gerer-son-tapis-en-tournoi', $first->getSlug());
        self::assertSame('gerer-son-tapis-en-tournoi-2', $second->getSlug());
    }

    public function testArticleDetailBySlugExposesAuthorPseudoNotEmail(): void
    {
        $author = (new User())->setEmail('redac@example.com')->setPseudo('redacteur')->setPassword('x')
            ->setConsentVersion('1.0')->setConsentAt(new \DateTimeImmutable());
        $this->em->persist($author);
        $this->article('Le tilt', '-1 day', 'le-tilt')->setAuthor($author);
        $this->article('Secret', null, 'secret');
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/articles/le-tilt');
        self::assertResponseIsSuccessful();
        self::assertSame('<p>Contenu</p>', $data['content']);
        self::assertSame('redacteur', $data['authorPseudo']);
        self::assertStringNotContainsString('redac@example.com', (string) $this->client->getResponse()->getContent());

        $this->jsonRequest('GET', '/api/articles/secret');
        self::assertResponseStatusCodeSame(404, 'un brouillon n’est pas accessible');
    }

    public function testVideosListFiltersAndYoutubeId(): void
    {
        $this->video('Les règles', VideoLevel::Debutant);
        $this->video('Ranges avancées', VideoLevel::Avance);
        $this->video('Pas encore en ligne', VideoLevel::Debutant, null);
        $this->em->flush();

        $all = $this->jsonRequest('GET', '/api/videos');
        self::assertSame(2, $all['total']);
        self::assertSame('Hmd7pvhNHls', $all['items'][0]['youtubeId']);
        self::assertArrayNotHasKey('youtubeUrl', $all['items'][0]);
        self::assertSame(['Règles'], $all['filters']['categories']);

        $beginner = $this->jsonRequest('GET', '/api/videos?level=debutant');
        self::assertSame(['Les règles'], array_column($beginner['items'], 'title'));
        self::assertSame('Débutant', $beginner['items'][0]['levelLabel']);

        $this->jsonRequest('GET', '/api/videos?level=expert');
        self::assertResponseStatusCodeSame(400);
    }

    public function testVideoDetail(): void
    {
        $video = $this->video('Les règles', VideoLevel::Debutant);
        $draft = $this->video('Brouillon', VideoLevel::Debutant, null);
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/videos/'.$video->getId());
        self::assertResponseIsSuccessful();
        self::assertSame('debutant', $data['levelValue']);

        $this->jsonRequest('GET', '/api/videos/'.$draft->getId());
        self::assertResponseStatusCodeSame(404);
    }

    public function testStats(): void
    {
        $this->article('A');
        $this->article('B', null);
        $this->video('V', VideoLevel::Debutant);
        $this->em->flush();

        $data = $this->jsonRequest('GET', '/api/stats');
        self::assertSame(['articles' => 1, 'videos' => 1, 'members' => 0], $data);
    }

    public function testAdminRequiresAdminRole(): void
    {
        $this->client->request('GET', '/admin');
        self::assertResponseRedirects('/admin/login');

        $member = (new User())->setEmail('m@example.com')->setPseudo('membre')->setPassword('x')
            ->setIsVerified(true)->setConsentVersion('1.0')->setConsentAt(new \DateTimeImmutable());
        $admin = (new User())->setEmail('a@example.com')->setPseudo('chef')->setPassword('x')->setRoles(['ROLE_ADMIN'])
            ->setIsVerified(true)->setConsentVersion('1.0')->setConsentAt(new \DateTimeImmutable());
        $this->em->persist($member);
        $this->em->persist($admin);
        $this->em->flush();

        $this->client->loginUser($member);
        $this->client->request('GET', '/admin');
        self::assertResponseStatusCodeSame(403);

        $this->client->loginUser($admin);
        $this->client->request('GET', '/admin');
        self::assertResponseIsSuccessful();
        self::assertSelectorTextContains('body', 'Articles publiés');

        $this->client->request('GET', '/admin/article/new');
        self::assertResponseIsSuccessful();
    }

    public function testAdminLoginPageRenders(): void
    {
        $this->client->request('GET', '/admin/login');
        self::assertResponseIsSuccessful();
        self::assertSelectorExists('input[name="_username"]');
    }
}
