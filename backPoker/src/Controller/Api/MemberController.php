<?php

namespace App\Controller\Api;

use App\Repository\ForumPostRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * v1.1 — Profil public d'un membre : pseudo, date d'inscription, nombre de messages visibles.
 * Jamais d'email ni d'autre donnée privée ; les comptes anonymisés ou non vérifiés n'existent pas publiquement.
 */
class MemberController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly ForumPostRepository $posts,
    ) {
    }

    #[Route('/api/members/{pseudo}', name: 'api_member_show', requirements: ['pseudo' => '[\w\-.]{3,50}'], methods: ['GET'])]
    public function show(string $pseudo): JsonResponse
    {
        $user = $this->users->findOneBy(['pseudo' => $pseudo]);
        if (!$user || !$user->isVerified() || $user->isAnonymized()) {
            return $this->json(['message' => 'Membre introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'pseudo' => $user->getPseudo(),
            'createdAt' => $user->getCreatedAt()?->format(\DATE_ATOM),
            'postCount' => $this->posts->count(['author' => $user, 'isModerated' => false]),
        ]);
    }
}
