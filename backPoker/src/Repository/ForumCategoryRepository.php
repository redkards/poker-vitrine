<?php

namespace App\Repository;

use App\Entity\ForumCategory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ForumCategory>
 */
class ForumCategoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ForumCategory::class);
    }

    /**
     * Catégories avec nombre de sujets, de messages visibles et date de dernière activité.
     *
     * @return list<array{category: ForumCategory, topicCount: int, postCount: int, lastPostAt: ?string}>
     */
    public function findAllWithStats(): array
    {
        $rows = $this->createQueryBuilder('c')
            ->select('c AS category')
            ->addSelect('COUNT(DISTINCT t.id) AS topicCount')
            ->addSelect('COUNT(p.id) AS postCount')
            ->addSelect('MAX(p.createdAt) AS lastPostAt')
            ->leftJoin('c.topics', 't')
            ->leftJoin('t.posts', 'p', 'WITH', 'p.isModerated = false')
            ->groupBy('c.id')
            ->orderBy('c.position', 'ASC')
            ->addOrderBy('c.name', 'ASC')
            ->getQuery()
            ->getResult();

        return array_map(static fn (array $row) => [
            'category' => $row['category'],
            'topicCount' => (int) $row['topicCount'],
            'postCount' => (int) $row['postCount'],
            'lastPostAt' => $row['lastPostAt'],
        ], $rows);
    }
}
