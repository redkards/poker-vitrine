<?php

namespace App\Repository;

use App\Entity\ForumSubscription;
use App\Entity\ForumTopic;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ForumSubscription>
 */
class ForumSubscriptionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ForumSubscription::class);
    }

    public function findOneFor(User $user, ForumTopic $topic): ?ForumSubscription
    {
        return $this->findOneBy(['user' => $user, 'topic' => $topic]);
    }

    /**
     * Abonnés vérifiés à prévenir d'une nouvelle réponse, hors auteur de la réponse.
     *
     * @return list<User>
     */
    public function findSubscribersToNotify(ForumTopic $topic, User $except): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('u')
            ->from(User::class, 'u')
            ->join(ForumSubscription::class, 's', 'WITH', 's.user = u')
            ->where('s.topic = :topic')
            ->andWhere('u != :except')
            ->andWhere('u.isVerified = true')
            ->setParameter('topic', $topic)
            ->setParameter('except', $except)
            ->getQuery()
            ->getResult();
    }
}
