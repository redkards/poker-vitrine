<?php

namespace App\Repository;

use App\Entity\Tournament;
use App\Enum\TournamentZone;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Tournament>
 */
class TournamentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Tournament::class);
    }

    /**
     * Tournois publiés pas encore terminés, du plus proche au plus lointain.
     *
     * @return list<Tournament>
     */
    public function findUpcoming(?TournamentZone $zone = null, ?\DateTimeImmutable $today = null): array
    {
        $qb = $this->createQueryBuilder('t')
            ->where('t.isPublished = true')
            ->andWhere('t.endDate >= :today')
            ->setParameter('today', ($today ?? new \DateTimeImmutable())->setTime(0, 0))
            ->orderBy('t.startDate', 'ASC')
            ->addOrderBy('t.name', 'ASC');

        if ($zone) {
            $qb->andWhere('t.zone = :zone')->setParameter('zone', $zone);
        }

        return $qb->getQuery()->getResult();
    }
}
