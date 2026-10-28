<?php

namespace App\Controller\Api;

use App\Repository\ArticleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

/**
 * UC1 — Consulter les actualités (public, lecture seule)
 */
#[Route('/api/articles')]
class ArticleController extends AbstractController
{
    public function __construct(private readonly ArticleRepository $articles)
    {
    }

    #[Route('', name: 'api_articles', methods: ['GET'])]
    public function list(
        #[MapQueryParameter] int $page = 1,
        #[MapQueryParameter] int $limit = 9,
        #[MapQueryParameter] ?string $category = null,
    ): JsonResponse {
        $page = Paginated::clampPage($page);
        $limit = Paginated::clampLimit($limit);

        $result = $this->articles->findPublishedPage($page, $limit, $category);

        return $this->json(Paginated::from($result, $page, $limit), context: ['groups' => ['article:list']]);
    }

    #[Route('/{slug}', name: 'api_article_show', requirements: ['slug' => '[a-z0-9-]+'], methods: ['GET'])]
    public function show(string $slug): JsonResponse
    {
        $article = $this->articles->findOnePublishedBySlug($slug);
        if (!$article) {
            return $this->json(['message' => 'Article introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($article, context: ['groups' => ['article:read']]);
    }
}
