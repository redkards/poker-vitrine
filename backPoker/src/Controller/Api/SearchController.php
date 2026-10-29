<?php

namespace App\Controller\Api;

use App\Entity\Article;
use App\Entity\ForumTopic;
use App\Repository\ArticleRepository;
use App\Repository\ForumTopicRepository;
use App\Service\GdprService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * v1.1 — Recherche dans les actualités publiées et le forum (public).
 * Aucune donnée personnelle servie, hormis le pseudo de l'auteur d'un sujet.
 */
class SearchController extends AbstractController
{
    public const MIN_LENGTH = 2;
    public const MAX_LENGTH = 100;
    private const MAX_RESULTS = 10;

    public function __construct(
        private readonly ArticleRepository $articles,
        private readonly ForumTopicRepository $topics,
    ) {
    }

    #[Route('/api/search', name: 'api_search', methods: ['GET'])]
    public function search(Request $request, RateLimiterFactoryInterface $searchLimiter, #[MapQueryParameter] string $q = ''): JsonResponse
    {
        $q = trim(preg_replace('/\s+/u', ' ', $q) ?? '');
        $length = mb_strlen($q);

        if ($length < self::MIN_LENGTH || $length > self::MAX_LENGTH) {
            return $this->json(
                ['message' => sprintf('La recherche doit contenir entre %d et %d caractères.', self::MIN_LENGTH, self::MAX_LENGTH)],
                Response::HTTP_BAD_REQUEST,
            );
        }
        if (!$searchLimiter->create((string) $request->getClientIp())->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de recherches : patientez une minute.'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        return $this->json([
            'query' => $q,
            'articles' => array_map(fn (Article $a) => $this->articleData($a), $this->articles->searchPublished($q, self::MAX_RESULTS)),
            'topics' => array_map(fn (ForumTopic $t) => $this->topicData($t), $this->topics->search($q, self::MAX_RESULTS)),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function articleData(Article $article): array
    {
        return [
            'id' => $article->getId(),
            'title' => $article->getTitle(),
            'slug' => $article->getSlug(),
            'excerpt' => $article->getExcerpt(),
            'category' => $article->getCategory(),
            'imageUrl' => $article->getImageUrl(),
            'publishedAt' => $article->getPublishedAt()?->format(\DATE_ATOM),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function topicData(ForumTopic $topic): array
    {
        $author = $topic->getAuthor();

        return [
            'id' => $topic->getId(),
            'title' => $topic->getTitle(),
            'category' => ['slug' => $topic->getCategory()?->getSlug(), 'name' => $topic->getCategory()?->getName()],
            'author' => ['pseudo' => !$author || $author->isAnonymized() ? GdprService::ANONYMOUS_LABEL : (string) $author->getPseudo()],
            'lastPostAt' => $topic->getLastPostAt()?->format(\DATE_ATOM),
        ];
    }
}
