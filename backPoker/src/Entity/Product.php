<?php

namespace App\Entity;

use App\Enum\ProductCategory;
use App\Enum\VatRate;
use App\Repository\ProductRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Article de la boutique (v2.0) : livre de formation ou accessoire.
 * Le prix est saisi TTC, en centimes (aucun calcul en flottants).
 */
#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_PRODUCT_SLUG', fields: ['slug'])]
#[ORM\Index(name: 'IDX_PRODUCT_PUBLISHED_CATEGORY', columns: ['is_published', 'category'])]
#[UniqueEntity(fields: ['slug'], message: 'Cette adresse est déjà utilisée par un autre produit.')]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 150)]
    private ?string $name = null;

    #[ORM\Column(length: 160)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 160)]
    #[Assert\Regex(pattern: '/^[a-z0-9]+(?:-[a-z0-9]+)*$/', message: 'Le slug ne contient que des minuscules, chiffres et tirets.')]
    private ?string $slug = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 20, enumType: ProductCategory::class)]
    #[Assert\NotNull]
    private ?ProductCategory $category = null;

    /**
     * Prix unitaire TTC en centimes (ex. 2490 = 24,90 €)
     */
    #[ORM\Column]
    #[Assert\Positive(message: 'Le prix doit être supérieur à zéro.')]
    private int $priceCents = 0;

    #[ORM\Column(length: 5, enumType: VatRate::class)]
    #[Assert\NotNull]
    private ?VatRate $vatRate = null;

    #[ORM\Column(options: ['default' => 0])]
    #[Assert\PositiveOrZero]
    private int $stock = 0;

    #[ORM\Column(length: 500, nullable: true)]
    #[Assert\Url(requireTld: true)]
    #[Assert\Length(max: 500)]
    private ?string $imageUrl = null;

    #[ORM\Column(options: ['default' => false])]
    private bool $isPublished = false;

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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = trim($name);

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = trim($slug);

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getCategory(): ?ProductCategory
    {
        return $this->category;
    }

    /**
     * Le taux de TVA suit la catégorie s'il n'a pas été choisi.
     */
    public function setCategory(ProductCategory $category): static
    {
        $this->category = $category;
        $this->vatRate ??= $category->defaultVatRate();

        return $this;
    }

    public function getPriceCents(): int
    {
        return $this->priceCents;
    }

    public function setPriceCents(int $priceCents): static
    {
        $this->priceCents = $priceCents;

        return $this;
    }

    public function getVatRate(): ?VatRate
    {
        return $this->vatRate;
    }

    public function setVatRate(VatRate $vatRate): static
    {
        $this->vatRate = $vatRate;

        return $this;
    }

    public function getStock(): int
    {
        return $this->stock;
    }

    public function setStock(int $stock): static
    {
        $this->stock = $stock;

        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): static
    {
        $this->imageUrl = $imageUrl ? trim($imageUrl) : null;

        return $this;
    }

    public function isPublished(): bool
    {
        return $this->isPublished;
    }

    public function setIsPublished(bool $isPublished): static
    {
        $this->isPublished = $isPublished;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function __toString(): string
    {
        return (string) $this->name;
    }
}
