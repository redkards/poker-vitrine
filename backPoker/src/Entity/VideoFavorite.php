<?php

namespace App\Entity;

use App\Repository\VideoFavoriteRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * UC8 — Vidéo mise en favori par un membre (privé).
 */
#[ORM\Entity(repositoryClass: VideoFavoriteRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_VIDEO_FAVORITE', fields: ['user', 'video'])]
class VideoFavorite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Video $video = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct(User $user, Video $video)
    {
        $this->user = $user;
        $this->video = $video;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function getVideo(): ?Video
    {
        return $this->video;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
