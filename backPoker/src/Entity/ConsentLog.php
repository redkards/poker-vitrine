<?php

namespace App\Entity;

use App\Repository\ConsentLogRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Preuve de consentement RGPD (une ligne par acceptation des CGU).
 * L'adresse IP est conservée 90 jours maximum, puis purgée.
 */
#[ORM\Entity(repositoryClass: ConsentLogRepository::class)]
#[ORM\Index(name: 'IDX_CONSENT_LOG_CREATED_AT', columns: ['created_at'])]
class ConsentLog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'consentLogs')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column(length: 20)]
    private ?string $cguVersion = null;

    /**
     * Nullable : effacée par la purge des 90 jours
     */
    #[ORM\Column(length: 45, nullable: true)]
    private ?string $ipAddress = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
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

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getCguVersion(): ?string
    {
        return $this->cguVersion;
    }

    public function setCguVersion(string $cguVersion): static
    {
        $this->cguVersion = $cguVersion;

        return $this;
    }

    public function getIpAddress(): ?string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(?string $ipAddress): static
    {
        $this->ipAddress = $ipAddress;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
