<?php

namespace App\Repository;

use App\Entity\Article;
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
    public function findPublishedPage(int $page, int $limit, ?string $category = null): Paginator
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
