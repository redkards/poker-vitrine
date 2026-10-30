<?php

namespace App\Repository;

use App\Entity\PremiumSubscription;
use App\Entity\User;
use App\Enum\PremiumSubscriptionStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PremiumSubscription>
 */
class PremiumSubscriptionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PremiumSubscription::class);
    }

    /**
     * @return list<PremiumSubscription>
     */
    public function findForUser(User $user): array
    {
        return $this->findBy(['user' => $user], ['createdAt' => 'ASC']);
    }

    /**
     * @return list<PremiumSubscription>
     */
    public function findActiveForUser(User $user): array
    {
        return $this->findBy(['user' => $user, 'status' => PremiumSubscriptionStatus::Active]);
    }
}
