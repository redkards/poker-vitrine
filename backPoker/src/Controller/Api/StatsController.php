<?php

namespace App\Controller\Api;

use App\Repository\ArticleRepository;
use App\Repository\ForumPostRepository;
use App\Repository\UserRepository;
use App\Repository\VideoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Chiffres clés de la page d'accueil (le compteur de messages du forum arrive au Sprint 3).
 */
class StatsController extends AbstractController
{
    #[Route('/api/stats', name: 'api_stats', methods: ['GET'])]
    public function __invoke(ArticleRepository $articles, VideoRepository $videos, UserRepository $users, ForumPostRepository $posts): JsonResponse
    {
        $response = $this->json([
            'articles' => $articles->countPublished(),
            'videos' => $videos->countPublished(),
            'members' => $users->count(['isVerified' => true]),
            'forumPosts' => $posts->countVisible(),
        ]);

        // Cache HTTP court : chiffres indicatifs
        return $response->setPublic()->setMaxAge(300);
    }
}
