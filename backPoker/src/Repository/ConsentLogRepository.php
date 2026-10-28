<?php

namespace App\Repository;

use App\Entity\ConsentLog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ConsentLog>
 */
class ConsentLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ConsentLog::class);
    }

    /**
     * RGPD : efface les adresses IP plus anciennes que $before (90 jours).
     *
     * @return int nombre de lignes anonymisées
     */
    public function purgeIpAddressesOlderThan(\DateTimeImmutable $before): int
    {
        return $this->createQueryBuilder('c')
            ->update()
            ->set('c.ipAddress', ':null')
            ->where('c.createdAt < :before')
            ->andWhere('c.ipAddress IS NOT NULL')
            ->setParameter('null', null)
            ->setParameter('before', $before)
            ->getQuery()
            ->execute();
    }
}
