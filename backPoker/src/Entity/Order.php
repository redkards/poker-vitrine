<?php

namespace App\Entity;

use App\Enum\OrderStatus;
use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Commande de la boutique (v2.0). Les montants sont figés à la création (centimes) :
 * une commande est une pièce comptable, elle ne dépend plus du catalogue ensuite.
 *
 * Table « shop_order » : ORDER est un mot réservé SQL.
 */
#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: 'shop_order')]
#[ORM\UniqueConstraint(name: 'UNIQ_SHOP_ORDER_REFERENCE', fields: ['reference'])]
#[ORM\Index(name: 'IDX_SHOP_ORDER_CREATED_AT', columns: ['created_at'])]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Référence lisible communiquée au client (ex. PW-20261030-3FA9C1)
     */
    #[ORM\Column(length: 24)]
    private ?string $reference = null;

    /**
     * Null après anonymisation du compte (RGPD) : la commande est conservée, sans lien nominatif.
     */
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    #[ORM\Column(length: 20, enumType: OrderStatus::class)]
    private OrderStatus $status = OrderStatus::EnAttente;

    // Adresse de livraison, qui sert aussi d'adresse de facturation
    #[ORM\Column(length: 120)]
    private ?string $shippingName = null;

    #[ORM\Column(length: 180)]
    private ?string $shippingLine1 = null;

    #[ORM\Column(length: 180, nullable: true)]
    private ?string $shippingLine2 = null;

    #[ORM\Column(length: 10)]
    private ?string $shippingPostalCode = null;

    #[ORM\Column(length: 120)]
    private ?string $shippingCity = null;

    /**
     * Code pays ISO 3166-1 alpha-2
     */
    #[ORM\Column(length: 2)]
    private ?string $shippingCountry = null;

    /**
     * Facultatif (transporteur) ; effacé à l'anonymisation car non requis pour la facture
     */
    #[ORM\Column(length: 30, nullable: true)]
    private ?string $shippingPhone = null;

    #[ORM\Column]
    private int $totalExclTaxCents = 0;

    #[ORM\Column]
    private int $totalVatCents = 0;

    #[ORM\Column]
    private int $totalInclTaxCents = 0;

    /**
     * Identifiant chez le prestataire de paiement (ex. session Stripe Checkout)
     */
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $paymentReference = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $paidAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $shippedAt = null;

    /**
     * @var Collection<int, OrderItem>
     */
    #[ORM\OneToMany(targetEntity: OrderItem::class, mappedBy: 'order', cascade: ['persist'], orphanRemoval: true)]
    #[ORM\OrderBy(['id' => 'ASC'])]
    private Collection $items;

    public function __construct()
    {
        $this->items = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->reference = sprintf('PW-%s-%s', $this->createdAt->format('Ymd'), strtoupper(bin2hex(random_bytes(3))));
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReference(): ?string
    {
        return $this->reference;
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

    public function getStatus(): OrderStatus
    {
        return $this->status;
    }

    public function setStatus(OrderStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getShippingName(): ?string
    {
        return $this->shippingName;
    }

    public function setShippingName(string $shippingName): static
    {
        $this->shippingName = trim($shippingName);

        return $this;
    }

    public function getShippingLine1(): ?string
    {
        return $this->shippingLine1;
    }

    public function setShippingLine1(string $shippingLine1): static
    {
        $this->shippingLine1 = trim($shippingLine1);

        return $this;
    }

    public function getShippingLine2(): ?string
    {
        return $this->shippingLine2;
    }

    public function setShippingLine2(?string $shippingLine2): static
    {
        $this->shippingLine2 = $shippingLine2 && '' !== trim($shippingLine2) ? trim($shippingLine2) : null;

        return $this;
    }

    public function getShippingPostalCode(): ?string
    {
        return $this->shippingPostalCode;
    }

    public function setShippingPostalCode(string $shippingPostalCode): static
    {
        $this->shippingPostalCode = trim($shippingPostalCode);

        return $this;
    }

    public function getShippingCity(): ?string
    {
        return $this->shippingCity;
    }

    public function setShippingCity(string $shippingCity): static
    {
        $this->shippingCity = trim($shippingCity);

        return $this;
    }

    public function getShippingCountry(): ?string
    {
        return $this->shippingCountry;
    }

    public function setShippingCountry(string $shippingCountry): static
    {
        $this->shippingCountry = strtoupper(trim($shippingCountry));

        return $this;
    }

    public function getShippingPhone(): ?string
    {
        return $this->shippingPhone;
    }

    public function setShippingPhone(?string $shippingPhone): static
    {
        $this->shippingPhone = $shippingPhone && '' !== trim($shippingPhone) ? trim($shippingPhone) : null;

        return $this;
    }

    /**
     * Adresse sur une ligne (back-office, export)
     */
    public function getShippingAddress(): string
    {
        return implode(', ', array_filter([
            $this->shippingName,
            $this->shippingLine1,
            $this->shippingLine2,
            trim($this->shippingPostalCode.' '.$this->shippingCity),
            $this->shippingCountry,
        ]));
    }

    public function getTotalExclTaxCents(): int
    {
        return $this->totalExclTaxCents;
    }

    public function getTotalVatCents(): int
    {
        return $this->totalVatCents;
    }

    public function getTotalInclTaxCents(): int
    {
        return $this->totalInclTaxCents;
    }

    public function getPaymentReference(): ?string
    {
        return $this->paymentReference;
    }

    public function setPaymentReference(?string $paymentReference): static
    {
        $this->paymentReference = $paymentReference;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getPaidAt(): ?\DateTimeImmutable
    {
        return $this->paidAt;
    }

    public function setPaidAt(?\DateTimeImmutable $paidAt): static
    {
        $this->paidAt = $paidAt;

        return $this;
    }

    public function getShippedAt(): ?\DateTimeImmutable
    {
        return $this->shippedAt;
    }

    public function setShippedAt(?\DateTimeImmutable $shippedAt): static
    {
        $this->shippedAt = $shippedAt;

        return $this;
    }

    /**
     * @return Collection<int, OrderItem>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    /**
     * Ajoute une ligne et recalcule les totaux (somme des lignes, déjà arrondies au centime).
     */
    public function addItem(OrderItem $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setOrder($this);
            $this->totalExclTaxCents += $item->getLineExclTaxCents();
            $this->totalVatCents += $item->getLineVatCents();
            $this->totalInclTaxCents += $item->getLineInclTaxCents();
        }

        return $this;
    }

    public function __toString(): string
    {
        return (string) $this->reference;
    }
}
