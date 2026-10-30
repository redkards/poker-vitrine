<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Contenus Premium (niveau Expert) : ils ne sont pas embarqués dans le front, ils sont servis aux seuls membres Premium.
 * Sources (hors du dossier public) : resources/lessons/expert.json (type TypeScript `Lesson`) et
 * resources/lessons/ranges-expert.json (type TypeScript `RangeChart`).
 */
#[Route('/api/lessons')]
class LessonController extends AbstractController
{
    public function __construct(
        #[Autowire('%kernel.project_dir%/resources/lessons/expert.json')]
        private readonly string $expertLessonsFile,
        #[Autowire('%kernel.project_dir%/resources/lessons/ranges-expert.json')]
        private readonly string $expertRangesFile,
    ) {
    }

    #[Route('/expert/{slug}', name: 'api_lessons_expert', requirements: ['slug' => '[a-z0-9-]+'], methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function expert(string $slug): JsonResponse
    {
        if (!$this->isGranted('ROLE_PREMIUM')) {
            return $this->premiumRequired('Cette leçon est réservée aux membres Premium.');
        }

        $lesson = array_column($this->readJson($this->expertLessonsFile), null, 'slug')[$slug] ?? null;
        if (null === $lesson) {
            return $this->noStore($this->json(['message' => 'Leçon introuvable.'], Response::HTTP_NOT_FOUND));
        }

        return $this->noStore($this->json($lesson));
    }

    /** Tableaux de ranges du niveau Expert (même forme que le type TypeScript `RangeChart`) */
    #[Route('/ranges/expert', name: 'api_lessons_ranges_expert', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function expertRanges(): JsonResponse
    {
        if (!$this->isGranted('ROLE_PREMIUM')) {
            return $this->premiumRequired('Ces tableaux de ranges sont réservés aux membres Premium.');
        }

        return $this->noStore($this->json($this->readJson($this->expertRangesFile)));
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function readJson(string $file): array
    {
        return json_decode((string) file_get_contents($file), true, flags: \JSON_THROW_ON_ERROR);
    }

    private function premiumRequired(string $message): JsonResponse
    {
        return $this->noStore($this->json(['code' => 'premium_required', 'message' => $message], Response::HTTP_FORBIDDEN));
    }

    /** Contenu payant : jamais mis en cache par un proxy ni par le navigateur */
    private function noStore(JsonResponse $response): JsonResponse
    {
        $response->headers->set('Cache-Control', 'private, no-store');

        return $response;
    }
}
