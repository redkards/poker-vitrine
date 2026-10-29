<?php

namespace App\Repository;

use App\Entity\Article;
use App\Enum\ArticleScope;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Article>
 */
class ArticleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Article::class);
    }

    /**
     * @return Paginator<Article>
     */
    public function findPublishedPage(int $page, int $limit, ?string $category = null, ?ArticleScope $scope = null): Paginator
    {
        $qb = $this->published()
            ->leftJoin('a.author', 'u')->addSelect('u')
            ->orderBy('a.publishedAt', 'DESC')
            ->addOrderBy('a.id', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($category) {
            $qb->andWhere('a.category = :category')->setParameter('category', $category);
        }
        if ($scope) {
            $qb->andWhere('a.scope = :scope')->setParameter('scope', $scope);
        }

        return new Paginator($qb);
    }

    public function findOnePublishedBySlug(string $slug): ?Article
    {
        return $this->published()
            ->andWhere('a.slug = :slug')
            ->setParameter('slug', $slug)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countPublished(): int
    {
        return (int) $this->published()->select('COUNT(a.id)')->getQuery()->getSingleScalarResult();
    }

    /**
     * Recherche simple (LIKE paramétré) dans les actualités publiées : titre, chapô, contenu.
     *
     * @return list<Article>
     */
    public function searchPublished(string $term, int $limit): array
    {
        return $this->published()
            ->andWhere("a.title LIKE :term ESCAPE '!' OR a.excerpt LIKE :term ESCAPE '!' OR a.content LIKE :term ESCAPE '!'")
            ->setParameter('term', LikePattern::contains($term))
            ->orderBy('a.publishedAt', 'DESC')
            ->addOrderBy('a.id', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function slugExists(string $slug, ?int $exceptId = null): bool
    {
        $qb = $this->createQueryBuilder('a')
            ->select('COUNT(a.id)')
            ->where('a.slug = :slug')
            ->setParameter('slug', $slug);

        if ($exceptId) {
            $qb->andWhere('a.id != :id')->setParameter('id', $exceptId);
        }

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }

    private function published(): QueryBuilder
    {
        return $this->createQueryBuilder('a')
            ->where('a.publishedAt IS NOT NULL')
            ->andWhere('a.publishedAt <= :now')
            ->setParameter('now', new \DateTimeImmutable());
    }
}
