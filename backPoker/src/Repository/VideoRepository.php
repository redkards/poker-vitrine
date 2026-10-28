<?php

namespace App\Repository;

use App\Entity\Video;
use App\Enum\VideoLevel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Video>
 */
class VideoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Video::class);
    }

    /**
     * @return Paginator<Video>
     */
    public function findPublishedPage(int $page, int $limit, ?string $category = null, ?VideoLevel $level = null): Paginator
    {
        $qb = $this->published()
            ->orderBy('v.publishedAt', 'DESC')
            ->addOrderBy('v.id', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($category) {
            $qb->andWhere('v.category = :category')->setParameter('category', $category);
        }
        if ($level) {
            $qb->andWhere('v.level = :level')->setParameter('level', $level);
        }

        return new Paginator($qb);
    }

    public function findOnePublished(int $id): ?Video
    {
        return $this->published()
            ->andWhere('v.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return list<string>
     */
    public function findPublishedCategories(): array
    {
        return array_column(
            $this->published()->select('DISTINCT v.category')->orderBy('v.category')->getQuery()->getScalarResult(),
            'category'
        );
    }

    public function countPublished(): int
    {
        return (int) $this->published()->select('COUNT(v.id)')->getQuery()->getSingleScalarResult();
    }

    private function published(): QueryBuilder
    {
        return $this->createQueryBuilder('v')
            ->where('v.publishedAt IS NOT NULL')
            ->andWhere('v.publishedAt <= :now')
            ->setParameter('now', new \DateTimeImmutable());
    }
}
