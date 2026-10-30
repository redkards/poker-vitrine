<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\VideoFavorite;
use App\Enum\VideoLevel;
use App\Repository\VideoFavoriteRepository;
use App\Repository\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

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

        $result = Paginated::from($this->videos->findPublishedPage($page, $limit, $category, $levelEnum), $page, $limit);
        $viewerIsPremium = $this->isGranted('ROLE_PREMIUM');
        foreach ($result['items'] as $video) {
            $video->applyAccess($viewerIsPremium);
        }

        return $this->json($result + [
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

        // Vidéo premium sans abonnement : fiche visible, lien YouTube masqué (youtubeId = null)
        return $this->json($video->applyAccess($this->isGranted('ROLE_PREMIUM')), context: ['groups' => ['video:read']]);
    }

    /**
     * UC8 — Ajouter (POST) ou retirer (DELETE) une vidéo de ses favoris
     */
    #[Route('/{id}/favorite', name: 'api_video_favorite', requirements: ['id' => '\d+'], methods: ['POST', 'DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function favorite(int $id, Request $request, #[CurrentUser] User $user, VideoFavoriteRepository $favorites, EntityManagerInterface $em): JsonResponse
    {
        $video = $this->videos->findOnePublished($id);
        if (!$video) {
            return $this->json(['message' => 'Vidéo introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $favorite = $favorites->findOneFor($user, $video);
        if ($request->isMethod('POST') && !$favorite) {
            $em->persist(new VideoFavorite($user, $video));
        } elseif ($request->isMethod('DELETE') && $favorite) {
            $em->remove($favorite);
        }
        $em->flush();

        return $this->json(['isFavorite' => $request->isMethod('POST')]);
    }
}
