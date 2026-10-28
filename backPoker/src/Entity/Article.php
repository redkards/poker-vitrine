<?php

namespace App\Entity;

use App\Enum\ArticleScope;
use App\Repository\ArticleRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Actualité. Non publiée tant que publishedAt est vide ou dans le futur.
 */
#[ORM\Entity(repositoryClass: ArticleRepository::class)]
#[ORM\Index(name: 'IDX_ARTICLE_PUBLISHED_AT', columns: ['published_at'])]
#[UniqueEntity(fields: ['slug'], message: 'Ce slug est déjà utilisé.')]
class Article
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['article:list', 'article:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 180)]
    #[Groups(['article:list', 'article:read'])]
    private ?string $title = null;

    /**
     * Généré depuis le titre s'il est laissé vide (voir SlugListener)
     */
    #[ORM\Column(length: 200, unique: true)]
    #[Assert\Length(max: 200)]
    #[Assert\Regex(pattern: '/^[a-z0-9]+(?:-[a-z0-9]+)*$/', message: 'Minuscules, chiffres et tirets uniquement.')]
    #[Groups(['article:list', 'article:read'])]
    private ?string $slug = null;

    /**
     * Ajout par rapport au dossier de conception : affiché sur les cartes (Stratégie, Tournois…)
     */
    #[ORM\Column(length: 50, nullable: true)]
    #[Assert\Length(max: 50)]
    #[Groups(['article:list', 'article:read'])]
    private ?string $category = null;

    /**
     * France ou International : deux colonnes « actualités » sur l'accueil
     */
    #[ORM\Column(length: 20, enumType: ArticleScope::class, options: ['default' => 'france'])]
    #[Assert\NotNull]
    private ArticleScope $scope = ArticleScope::France;

    #[ORM\Column(length: 400)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 400)]
    #[Groups(['article:list', 'article:read'])]
    private ?string $excerpt = null;

    /**
     * HTML saisi dans le back-office (rédacteurs de confiance)
     */
    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank]
    #[Groups(['article:read'])]
    private ?string $content = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Assert\Url(requireTld: true)]
    #[Groups(['article:list', 'article:read'])]
    private ?string $imageUrl = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['article:list', 'article:read'])]
    private ?\DateTimeImmutable $publishedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $author = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(?string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getScope(): ArticleScope
    {
        return $this->scope;
    }

    public function setScope(ArticleScope $scope): static
    {
        $this->scope = $scope;

        return $this;
    }

    #[Groups(['article:list', 'article:read'])]
    public function getScopeValue(): string
    {
        return $this->scope->value;
    }

    #[Groups(['article:list', 'article:read'])]
    public function getScopeLabel(): string
    {
        return $this->scope->label();
    }

    public function getExcerpt(): ?string
    {
        return $this->excerpt;
    }

    public function setExcerpt(string $excerpt): static
    {
        $this->excerpt = $excerpt;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): static
    {
        $this->imageUrl = $imageUrl;

        return $this;
    }

    public function getPublishedAt(): ?\DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(?\DateTimeImmutable $publishedAt): static
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    /**
     * Pseudo public de l'auteur (jamais son email)
     */
    #[Groups(['article:list', 'article:read'])]
    public function getAuthorPseudo(): ?string
    {
        return $this->author?->getPseudo();
    }

    public function __toString(): string
    {
        return (string) $this->title;
    }
}
