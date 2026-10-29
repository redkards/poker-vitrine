<?php

namespace App\Controller\Api;

use App\Dto\ForumPostReportRequest;
use App\Dto\ForumPostRequest;
use App\Dto\ForumTopicRequest;
use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumTopic;
use App\Entity\User;
use App\Enum\ReportReason;
use App\Repository\ForumCategoryRepository;
use App\Repository\ForumPostRepository;
use App\Repository\ForumTopicRepository;
use App\Service\ForumService;
use App\Service\GdprService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * UC3 — Lire le forum (public) et UC7 — Poster un message (membres connectés, donc email vérifié).
 */
#[Route('/api/forum')]
class ForumController extends AbstractController
{
    private const TOPICS_PER_PAGE = 20;
    private const POSTS_PER_PAGE = 20;

    public function __construct(
        private readonly ForumCategoryRepository $categories,
        private readonly ForumTopicRepository $topics,
        private readonly ForumPostRepository $posts,
        private readonly ForumService $forum,
    ) {
    }

    #[Route('/categories', name: 'api_forum_categories', methods: ['GET'])]
    public function categories(): JsonResponse
    {
        return $this->json(array_map(fn (array $row) => $this->categoryData($row['category']) + [
            'topicCount' => $row['topicCount'],
            'postCount' => $row['postCount'],
            'lastPostAt' => $this->formatDbDate($row['lastPostAt']),
        ], $this->categories->findAllWithStats()));
    }

    #[Route('/categories/{slug}/topics', name: 'api_forum_category_topics', requirements: ['slug' => '[a-z0-9-]+'], methods: ['GET'])]
    public function categoryTopics(string $slug, #[MapQueryParameter] int $page = 1): JsonResponse
    {
        $category = $this->categories->findOneBy(['slug' => $slug]);
        if (!$category) {
            return $this->json(['message' => 'Catégorie introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $page = Paginated::clampPage($page);
        $result = $this->topics->findPageByCategory($category, $page, self::TOPICS_PER_PAGE);

        return $this->json([
            'category' => $this->categoryData($category),
            'items' => array_map(fn (array $row) => $this->topicData($row['topic']) + [
                // Le premier message est le sujet lui-même
                'replyCount' => max(0, $row['postCount'] - 1),
            ], $result['items']),
            'page' => $page,
            'limit' => self::TOPICS_PER_PAGE,
            'total' => $result['total'],
            'pages' => (int) max(1, ceil($result['total'] / self::TOPICS_PER_PAGE)),
        ]);
    }

    #[Route('/categories/{slug}/topics', name: 'api_forum_topic_create', requirements: ['slug' => '[a-z0-9-]+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createTopic(
        string $slug,
        #[MapRequestPayload] ForumTopicRequest $payload,
        #[CurrentUser] User $user,
        RateLimiterFactoryInterface $forumPostLimiter,
    ): JsonResponse {
        $category = $this->categories->findOneBy(['slug' => $slug]);
        if (!$category) {
            return $this->json(['message' => 'Catégorie introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if ($tooFast = $this->throttle($forumPostLimiter, $user)) {
            return $tooFast;
        }

        $topic = $this->forum->createTopic($category, $user, $payload->title, $payload->content);

        return $this->json($this->topicData($topic), Response::HTTP_CREATED);
    }

    #[Route('/topics/{id}', name: 'api_forum_topic', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function topic(int $id, #[MapQueryParameter] int $page = 1, #[CurrentUser] ?User $user = null): JsonResponse
    {
        $topic = $this->topics->findOneWithCategory($id);
        if (!$topic) {
            return $this->json(['message' => 'Sujet introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $page = Paginated::clampPage($page);
        $posts = $this->posts->findPageByTopic($topic, $page, self::POSTS_PER_PAGE);
        $total = \count($posts);

        return $this->json([
            'topic' => $this->topicData($topic) + [
                'category' => $this->categoryData($topic->getCategory()),
                'isSubscribed' => $user ? $this->forum->isSubscribed($user, $topic) : false,
            ],
            'items' => array_map(fn (ForumPost $p) => $this->postData($p), iterator_to_array($posts, false)),
            'page' => $page,
            'limit' => self::POSTS_PER_PAGE,
            'total' => $total,
            'pages' => (int) max(1, ceil($total / self::POSTS_PER_PAGE)),
        ]);
    }

    #[Route('/topics/{id}/posts', name: 'api_forum_reply', requirements: ['id' => '\d+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function reply(
        int $id,
        #[MapRequestPayload] ForumPostRequest $payload,
        #[CurrentUser] User $user,
        RateLimiterFactoryInterface $forumPostLimiter,
    ): JsonResponse {
        $topic = $this->topics->find($id);
        if (!$topic) {
            return $this->json(['message' => 'Sujet introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if ($topic->isLocked()) {
            return $this->json(['message' => 'Ce sujet est verrouillé : il n’accepte plus de réponses.'], Response::HTTP_FORBIDDEN);
        }
        if ($tooFast = $this->throttle($forumPostLimiter, $user)) {
            return $tooFast;
        }

        $post = $this->forum->reply($topic, $user, $payload->content);

        return $this->json($this->postData($post), Response::HTTP_CREATED);
    }

    #[Route('/topics/{id}/subscription', name: 'api_forum_subscribe', requirements: ['id' => '\d+'], methods: ['POST', 'DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function subscription(int $id, #[CurrentUser] User $user, Request $request): JsonResponse
    {
        $topic = $this->topics->find($id);
        if (!$topic) {
            return $this->json(['message' => 'Sujet introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $request->isMethod('POST') ? $this->forum->subscribe($user, $topic) : $this->forum->unsubscribe($user, $topic);

        return $this->json(['isSubscribed' => $this->forum->isSubscribed($user, $topic)]);
    }

    /**
     * v1.1 — Signaler un message à la modération. Corps : {"reason": "spam|insulte|hors_sujet|autre", "comment": "…"}.
     */
    #[Route('/posts/{id}/report', name: 'api_forum_post_report', requirements: ['id' => '\d+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function report(
        int $id,
        #[MapRequestPayload] ForumPostReportRequest $payload,
        #[CurrentUser] User $user,
        RateLimiterFactoryInterface $forumReportLimiter,
    ): JsonResponse {
        $post = $this->posts->find($id);
        if (!$post) {
            return $this->json(['message' => 'Message introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if ($post->getAuthor()?->getId() === $user->getId()) {
            return $this->json(['message' => 'Vous ne pouvez pas signaler votre propre message.'], Response::HTTP_FORBIDDEN);
        }
        if ($post->isModerated()) {
            return $this->json(['message' => 'Ce message a déjà été masqué par la modération.'], Response::HTTP_CONFLICT);
        }
        if ($this->forum->hasReported($user, $post)) {
            return $this->json(['message' => 'Vous avez déjà signalé ce message.'], Response::HTTP_CONFLICT);
        }
        if ($tooFast = $this->throttle($forumReportLimiter, $user, 'Trop de signalements : réessayez plus tard.')) {
            return $tooFast;
        }

        $report = $this->forum->report($post, $user, ReportReason::from($payload->reason), $payload->comment);
        if (!$report) {
            return $this->json(['message' => 'Vous avez déjà signalé ce message.'], Response::HTTP_CONFLICT);
        }

        return $this->json([
            'id' => $report->getId(),
            'postId' => $post->getId(),
            'reason' => $report->getReason()->value,
            'createdAt' => $report->getCreatedAt()?->format(\DATE_ATOM),
            'message' => 'Merci, le message a été signalé à l’équipe de modération.',
        ], Response::HTTP_CREATED);
    }

    private function throttle(RateLimiterFactoryInterface $limiter, User $user, string $message = 'Vous publiez trop vite : patientez une minute.'): ?JsonResponse
    {
        if ($limiter->create('user-'.$user->getId())->consume()->isAccepted()) {
            return null;
        }

        return $this->json(['message' => $message], Response::HTTP_TOO_MANY_REQUESTS);
    }

    /**
     * @return array<string, mixed>
     */
    private function categoryData(ForumCategory $category): array
    {
        return [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'slug' => $category->getSlug(),
            'description' => $category->getDescription(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function topicData(ForumTopic $topic): array
    {
        return [
            'id' => $topic->getId(),
            'title' => $topic->getTitle(),
            'author' => $this->authorData($topic->getAuthor()),
            'createdAt' => $topic->getCreatedAt()?->format(\DATE_ATOM),
            'lastPostAt' => $topic->getLastPostAt()?->format(\DATE_ATOM),
            'isPinned' => $topic->isPinned(),
            'isLocked' => $topic->isLocked(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function postData(ForumPost $post): array
    {
        return [
            'id' => $post->getId(),
            'author' => $this->authorData($post->getAuthor()),
            // Message masqué : son contenu n'est jamais servi
            'content' => $post->isModerated() ? null : $post->getContent(),
            'isModerated' => $post->isModerated(),
            'createdAt' => $post->getCreatedAt()?->format(\DATE_ATOM),
        ];
    }

    /**
     * Identité publique d'un auteur : pseudo et rôle uniquement (jamais l'email).
     *
     * @return array{pseudo: string, role: ?string}
     */
    private function authorData(?User $user): array
    {
        if (!$user || $user->isAnonymized()) {
            return ['pseudo' => GdprService::ANONYMOUS_LABEL, 'role' => null];
        }

        $roles = $user->getRoles();

        return [
            'pseudo' => (string) $user->getPseudo(),
            'role' => match (true) {
                \in_array('ROLE_ADMIN', $roles, true) => 'Administrateur',
                \in_array('ROLE_MODERATOR', $roles, true) => 'Modérateur',
                default => null,
            },
        ];
    }

    private function formatDbDate(mixed $value): ?string
    {
        if (null === $value || '' === $value) {
            return null;
        }

        return ($value instanceof \DateTimeInterface ? $value : new \DateTimeImmutable((string) $value))->format(\DATE_ATOM);
    }
}
