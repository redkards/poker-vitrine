<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Leçons Premium (niveau Expert) : le contenu n'est pas embarqué dans le front, il est servi aux seuls membres Premium.
 * Source : resources/lessons/expert.json (hors du dossier public), même forme que le type TypeScript `Lesson`.
 */
#[Route('/api/lessons')]
class LessonController extends AbstractController
{
    public function __construct(
        #[Autowire('%kernel.project_dir%/resources/lessons/expert.json')]
        private readonly string $expertLessonsFile,
    ) {
    }

    #[Route('/expert/{slug}', name: 'api_lessons_expert', requirements: ['slug' => '[a-z0-9-]+'], methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function expert(string $slug): JsonResponse
    {
        if (!$this->isGranted('ROLE_PREMIUM')) {
            return $this->noStore($this->json([
                'code' => 'premium_required',
                'message' => 'Cette leçon est réservée aux membres Premium.',
            ], Response::HTTP_FORBIDDEN));
        }

        $lesson = array_column($this->expertLessons(), null, 'slug')[$slug] ?? null;
        if (null === $lesson) {
            return $this->noStore($this->json(['message' => 'Leçon introuvable.'], Response::HTTP_NOT_FOUND));
        }

        return $this->noStore($this->json($lesson));
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function expertLessons(): array
    {
        return json_decode((string) file_get_contents($this->expertLessonsFile), true, flags: \JSON_THROW_ON_ERROR);
    }

    /** Contenu payant : jamais mis en cache par un proxy ni par le navigateur */
    private function noStore(JsonResponse $response): JsonResponse
    {
        $response->headers->set('Cache-Control', 'private, no-store');

        return $response;
    }
}
