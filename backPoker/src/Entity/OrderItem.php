<?php

namespace App\Entity;

use App\Enum\VatRate;
use Doctrine\ORM\Mapping as ORM;

/**
 * Ligne de commande : copie (snapshot) du nom, du prix TTC et du taux de TVA au moment de l'achat.
 * Modifier ou supprimer le produit ensuite ne change pas la commande.
 */
#[ORM\Entity]
class OrderItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'items')]
    #[ORM\JoinColumn(name: 'order_id', nullable: false, onDelete: 'CASCADE')]
    private ?Order $order = null;

    /**
     * Lien informatif vers le catalogue (null si le produit a été supprimé)
     */
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Product $product = null;

    #[ORM\Column(length: 150)]
    private string $productName;

    #[ORM\Column]
    private int $unitPriceInclTaxCents;

    #[ORM\Column(length: 5, enumType: VatRate::class)]
    private VatRate $vatRate;

    #[ORM\Column]
    private int $quantity;

    #[ORM\Column]
    private int $lineInclTaxCents;

    #[ORM\Column]
    private int $lineExclTaxCents;

    #[ORM\Column]
    private int $lineVatCents;

    public function __construct(Product $product, int $quantity)
    {
        if ($quantity < 1) {
            throw new \InvalidArgumentException('La quantité doit être au moins égale à 1.');
        }

        $this->product = $product;
        $this->productName = (string) $product->getName();
        $this->unitPriceInclTaxCents = $product->getPriceCents();
        $this->vatRate = $product->getVatRate() ?? throw new \LogicException('Produit sans taux de TVA.');
        $this->quantity = $quantity;

        // TVA calculée sur le total de la ligne (une seule fois arrondie)
        $this->lineInclTaxCents = $this->unitPriceInclTaxCents * $quantity;
        $this->lineExclTaxCents = $this->vatRate->excludingTax($this->lineInclTaxCents);
        $this->lineVatCents = $this->lineInclTaxCents - $this->lineExclTaxCents;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getOrder(): ?Order
    {
        return $this->order;
    }

    public function setOrder(Order $order): static
    {
        $this->order = $order;

        return $this;
    }

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function getProductName(): string
    {
        return $this->productName;
    }

    public function getUnitPriceInclTaxCents(): int
    {
        return $this->unitPriceInclTaxCents;
    }

    public function getVatRate(): VatRate
    {
        return $this->vatRate;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function getLineInclTaxCents(): int
    {
        return $this->lineInclTaxCents;
    }

    public function getLineExclTaxCents(): int
    {
        return $this->lineExclTaxCents;
    }

    public function getLineVatCents(): int
    {
        return $this->lineVatCents;
    }

    public function __toString(): string
    {
        return sprintf('%d × %s (%s €)', $this->quantity, $this->productName, number_format($this->lineInclTaxCents / 100, 2, ',', ' '));
    }
}
