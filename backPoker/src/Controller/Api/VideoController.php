<?php

namespace App\Controller\Api;

use App\Enum\VideoLevel;
use App\Repository\VideoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

/**
 * UC2 — Consulter les vidéos (public, lecture seule)
 */
#[Route('/api/videos')]
class VideoController extends AbstractController
{
    public function __construct(private readonly VideoRepository $videos)
    {
    }

    /**
     * Filtres : ?level=debutant|intermediaire|avance&category=…
     */
    #[Route('', name: 'api_videos', methods: ['GET'])]
    public function list(
        #[MapQueryParameter] int $page = 1,
        #[MapQueryParameter] int $limit = 12,
        #[MapQueryParameter] ?string $category = null,
        #[MapQueryParameter] ?string $level = null,
    ): JsonResponse {
        $page = Paginated::clampPage($page);
        $limit = Paginated::clampLimit($limit);
        $levelEnum = $level ? VideoLevel::tryFrom($level) : null;

        if ($level && !$levelEnum) {
            return $this->json(['message' => 'Niveau inconnu.'], Response::HTTP_BAD_REQUEST);
        }

        $result = $this->videos->findPublishedPage($page, $limit, $category, $levelEnum);

        return $this->json(Paginated::from($result, $page, $limit) + [
            'filters' => [
                'categories' => $this->videos->findPublishedCategories(),
                'levels' => array_map(static fn (VideoLevel $l) => ['value' => $l->value, 'label' => $l->label()], VideoLevel::cases()),
            ],
        ], context: ['groups' => ['video:list']]);
    }

    #[Route('/{id}', name: 'api_video_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $video = $this->videos->findOnePublished($id);
        if (!$video) {
            return $this->json(['message' => 'Vidéo introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($video, context: ['groups' => ['video:read']]);
    }
}
