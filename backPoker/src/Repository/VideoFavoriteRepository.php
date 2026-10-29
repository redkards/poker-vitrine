<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Video;
use App\Entity\VideoFavorite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<VideoFavorite>
 */
class VideoFavoriteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VideoFavorite::class);
    }

    public function findOneFor(User $user, Video $video): ?VideoFavorite
    {
        return $this->findOneBy(['user' => $user, 'video' => $video]);
    }

    /**
     * Vidéos favorites encore publiées, la plus récemment ajoutée d'abord.
     *
     * @return list<Video>
     */
    public function findPublishedVideosOf(User $user): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('v')
            ->from(Video::class, 'v')
            ->join(VideoFavorite::class, 'f', 'WITH', 'f.video = v')
            ->where('f.user = :user')
            ->andWhere('v.publishedAt IS NOT NULL')
            ->andWhere('v.publishedAt <= :now')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTimeImmutable())
            ->orderBy('f.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
