<?php

namespace App\Entity;

use App\Repository\ForumSubscriptionRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Abonnement d'un membre à un sujet : email à chaque nouvelle réponse (UC7, postcondition).
 */
#[ORM\Entity(repositoryClass: ForumSubscriptionRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_FORUM_SUBSCRIPTION', fields: ['user', 'topic'])]
class ForumSubscription
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
    private ?ForumTopic $topic = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct(User $user, ForumTopic $topic)
    {
        $this->user = $user;
        $this->topic = $topic;
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

    public function getTopic(): ?ForumTopic
    {
        return $this->topic;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
