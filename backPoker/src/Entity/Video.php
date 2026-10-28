<?php

namespace App\Entity;

use App\Enum\VideoLevel;
use App\Repository\VideoRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: VideoRepository::class)]
#[ORM\Index(name: 'IDX_VIDEO_PUBLISHED_AT', columns: ['published_at'])]
class Video
{
    private const YOUTUBE_PATTERN = '~^(?:https?://)?(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/)|youtu\.be/)([\w-]{11})~';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['video:list', 'video:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 180)]
    #[Groups(['video:list', 'video:read'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['video:list', 'video:read'])]
    private ?string $description = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Regex(pattern: self::YOUTUBE_PATTERN, message: 'Saisissez une URL YouTube valide (youtube.com/watch?v=… ou youtu.be/…).')]
    private ?string $youtubeUrl = null;

    /**
     * Ex. « Cash game », « Tournoi », « Mental »
     */
    #[ORM\Column(length: 50)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 50)]
    #[Groups(['video:list', 'video:read'])]
    private ?string $category = null;

    #[ORM\Column(length: 20, enumType: VideoLevel::class)]
    #[Assert\NotNull]
    private ?VideoLevel $level = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['video:list', 'video:read'])]
    private ?\DateTimeImmutable $publishedAt = null;

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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getYoutubeUrl(): ?string
    {
        return $this->youtubeUrl;
    }

    public function setYoutubeUrl(string $youtubeUrl): static
    {
        $this->youtubeUrl = trim($youtubeUrl);

        return $this;
    }

    /**
     * Identifiant à 11 caractères : le front l'intègre via youtube-nocookie.com
     */
    #[Groups(['video:list', 'video:read'])]
    public function getYoutubeId(): ?string
    {
        return preg_match(self::YOUTUBE_PATTERN, (string) $this->youtubeUrl, $m) ? $m[1] : null;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getLevel(): ?VideoLevel
    {
        return $this->level;
    }

    public function setLevel(VideoLevel $level): static
    {
        $this->level = $level;

        return $this;
    }

    #[Groups(['video:list', 'video:read'])]
    public function getLevelValue(): ?string
    {
        return $this->level?->value;
    }

    #[Groups(['video:list', 'video:read'])]
    public function getLevelLabel(): ?string
    {
        return $this->level?->label();
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

    public function __toString(): string
    {
        return (string) $this->title;
    }
}
