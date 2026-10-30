<?php

namespace App\Entity;

use App\Enum\PremiumPlan;
use App\Enum\PremiumSubscriptionStatus;
use App\Repository\PremiumSubscriptionRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Abonnement Premium (historique conservé pour la comptabilité, y compris après anonymisation du compte).
 */
#[ORM\Entity(repositoryClass: PremiumSubscriptionRepository::class)]
#[ORM\Index(name: 'IDX_PREMIUM_SUBSCRIPTION_STATUS', columns: ['status'])]
class PremiumSubscription
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Compte abonné. Après anonymisation, le lien pointe vers un compte sans email ni pseudo réel.
     */
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    #[ORM\Column(length: 20, enumType: PremiumPlan::class)]
    private PremiumPlan $plan;

    #[ORM\Column(length: 20, enumType: PremiumSubscriptionStatus::class)]
    private PremiumSubscriptionStatus $status = PremiumSubscriptionStatus::EnAttente;

    /**
     * Prix TTC payé, en centimes (figé au moment de la souscription)
     */
    #[ORM\Column]
    private int $priceCents = 0;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $startedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $endsAt = null;

    /**
     * Référence chez le prestataire de paiement (ex. identifiant Stripe), null pour une activation manuelle
     */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $providerReference = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct(User $user, PremiumPlan $plan, int $priceCents = 0)
    {
        $this->user = $user;
        $this->plan = $plan;
        $this->priceCents = $priceCents;
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

    public function getPlan(): PremiumPlan
    {
        return $this->plan;
    }

    public function getStatus(): PremiumSubscriptionStatus
    {
        return $this->status;
    }

    public function setStatus(PremiumSubscriptionStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getPriceCents(): int
    {
        return $this->priceCents;
    }

    public function getStartedAt(): ?\DateTimeImmutable
    {
        return $this->startedAt;
    }

    public function setStartedAt(?\DateTimeImmutable $startedAt): static
    {
        $this->startedAt = $startedAt;

        return $this;
    }

    public function getEndsAt(): ?\DateTimeImmutable
    {
        return $this->endsAt;
    }

    public function setEndsAt(?\DateTimeImmutable $endsAt): static
    {
        $this->endsAt = $endsAt;

        return $this;
    }

    public function getProviderReference(): ?string
    {
        return $this->providerReference;
    }

    public function setProviderReference(?string $providerReference): static
    {
        $this->providerReference = $providerReference;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getPlanLabel(): string
    {
        return $this->plan->label();
    }

    public function getStatusLabel(): string
    {
        return $this->status->label();
    }

    public function getUserLabel(): string
    {
        return (string) $this->user?->getPseudo();
    }
}
