<?php

namespace App\Controller\Api;

use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * Format commun des listes paginées de l'API.
 */
final class Paginated
{
    public const MAX_LIMIT = 50;

    /**
     * @param Paginator<object> $paginator
     *
     * @return array{items: list<object>, page: int, limit: int, total: int, pages: int}
     */
    public static function from(Paginator $paginator, int $page, int $limit): array
    {
        $total = \count($paginator);

        return [
            'items' => iterator_to_array($paginator, false),
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => (int) max(1, ceil($total / $limit)),
        ];
    }

    public static function clampPage(int $page): int
    {
        return max(1, $page);
    }

    public static function clampLimit(int $limit): int
    {
        return max(1, min(self::MAX_LIMIT, $limit));
    }
}
