<?php

namespace App\Repository;

use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumTopic;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ForumTopic>
 */
class ForumTopicRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ForumTopic::class);
    }

    /**
     * Sujets d'une catégorie : épinglés d'abord, puis par dernière activité.
     *
     * @return array{items: list<array{topic: ForumTopic, postCount: int}>, total: int}
     */
    public function findPageByCategory(ForumCategory $category, int $page, int $limit): array
    {
        $total = (int) $this->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->where('t.category = :category')
            ->setParameter('category', $category)
            ->getQuery()
            ->getSingleScalarResult();

        $rows = $this->createQueryBuilder('t')
            ->select('t AS topic', 'a')
            ->addSelect(sprintf('(SELECT COUNT(p.id) FROM %s p WHERE p.topic = t AND p.isModerated = false) AS postCount', ForumPost::class))
            ->leftJoin('t.author', 'a')
            ->where('t.category = :category')
            ->setParameter('category', $category)
            ->orderBy('t.isPinned', 'DESC')
            ->addOrderBy('t.lastPostAt', 'DESC')
            ->addOrderBy('t.id', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return [
            'items' => array_map(static fn (array $row) => ['topic' => $row['topic'], 'postCount' => (int) $row['postCount']], $rows),
            'total' => $total,
        ];
    }

    public function findOneWithCategory(int $id): ?ForumTopic
    {
        return $this->createQueryBuilder('t')
            ->addSelect('c', 'a')
            ->join('t.category', 'c')
            ->leftJoin('t.author', 'a')
            ->where('t.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Recherche (LIKE paramétré) dans les titres des sujets et le contenu des messages visibles.
     * Les messages masqués par la modération ne sont jamais pris en compte.
     *
     * @return list<ForumTopic>
     */
    public function search(string $term, int $limit): array
    {
        return $this->createQueryBuilder('t')
            ->addSelect('c', 'a')
            ->join('t.category', 'c')
            ->leftJoin('t.author', 'a')
            ->where("t.title LIKE :term ESCAPE '!'")
            ->orWhere(sprintf("EXISTS (SELECT p.id FROM %s p WHERE p.topic = t AND p.isModerated = false AND p.content LIKE :term ESCAPE '!')", ForumPost::class))
            ->setParameter('term', LikePattern::contains($term))
            ->orderBy('t.lastPostAt', 'DESC')
            ->addOrderBy('t.id', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
