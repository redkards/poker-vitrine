<?php

namespace App\Entity;

use App\Enum\TournamentZone;
use App\Repository\TournamentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Tournoi live du calendrier (France, Belgique, international).
 * Les informations viennent de sources vérifiées (organisateur ou médias poker), citées dans `sources`.
 */
#[ORM\Entity(repositoryClass: TournamentRepository::class)]
#[ORM\Index(name: 'IDX_TOURNAMENT_DATES', columns: ['end_date', 'start_date'])]
#[ORM\UniqueConstraint(name: 'UNIQ_TOURNAMENT_NAME_START', fields: ['name', 'startDate'])]
class Tournament
{
    public const STATUS_CONFIRMED = 'confirme';
    public const STATUS_TO_CONFIRM = 'a-confirmer';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 180)]
    private ?string $name = null;

    #[ORM\Column(length: 120, nullable: true)]
    #[Assert\Length(max: 120)]
    private ?string $circuit = null;

    #[ORM\Column(length: 20, enumType: TournamentZone::class)]
    #[Assert\NotNull]
    private ?TournamentZone $zone = null;

    #[ORM\Column(length: 80)]
    #[Assert\NotBlank]
    private ?string $country = null;

    #[ORM\Column(length: 120)]
    #[Assert\NotBlank]
    private ?string $city = null;

    #[ORM\Column(length: 180, nullable: true)]
    private ?string $venue = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $startDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Assert\NotNull]
    #[Assert\GreaterThanOrEqual(propertyPath: 'startDate', message: 'La date de fin doit suivre la date de début.')]
    private ?\DateTimeImmutable $endDate = null;

    #[ORM\Column(length: 60, nullable: true)]
    private ?string $mainEventBuyIn = null;

    #[ORM\Column(length: 120, nullable: true)]
    private ?string $guarantee = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Assert\Url(requireTld: true)]
    private ?string $url = null;

    #[ORM\Column(length: 20, options: ['default' => self::STATUS_CONFIRMED])]
    #[Assert\Choice(choices: [self::STATUS_CONFIRMED, self::STATUS_TO_CONFIRM])]
    private string $status = self::STATUS_CONFIRMED;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $note = null;

    /**
     * @var list<array{name: string, url: string}>
     */
    #[ORM\Column(type: Types::JSON)]
    private array $sources = [];

    #[ORM\Column(options: ['default' => true])]
    private bool $isPublished = true;

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

    public function getCircuit(): ?string
    {
        return $this->circuit;
    }

    public function setCircuit(?string $circuit): static
    {
        $this->circuit = $circuit;

        return $this;
    }

    public function getZone(): ?TournamentZone
    {
        return $this->zone;
    }

    public function setZone(TournamentZone $zone): static
    {
        $this->zone = $zone;

        return $this;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function setCountry(string $country): static
    {
        $this->country = $country;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getVenue(): ?string
    {
        return $this->venue;
    }

    public function setVenue(?string $venue): static
    {
        $this->venue = $venue;

        return $this;
    }

    public function getStartDate(): ?\DateTimeImmutable
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeImmutable $startDate): static
    {
        $this->startDate = $startDate;

        return $this;
    }

    public function getEndDate(): ?\DateTimeImmutable
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeImmutable $endDate): static
    {
        $this->endDate = $endDate;

        return $this;
    }

    public function getMainEventBuyIn(): ?string
    {
        return $this->mainEventBuyIn;
    }

    public function setMainEventBuyIn(?string $mainEventBuyIn): static
    {
        $this->mainEventBuyIn = $mainEventBuyIn;

        return $this;
    }

    public function getGuarantee(): ?string
    {
        return $this->guarantee;
    }

    public function setGuarantee(?string $guarantee): static
    {
        $this->guarantee = $guarantee;

        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(?string $url): static
    {
        $this->url = $url;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(?string $note): static
    {
        $this->note = $note;

        return $this;
    }

    /**
     * @return list<array{name: string, url: string}>
     */
    public function getSources(): array
    {
        return $this->sources;
    }

    /**
     * @param list<array{name: string, url: string}> $sources
     */
    public function setSources(array $sources): static
    {
        $this->sources = $sources;

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

    public function __toString(): string
    {
        return (string) $this->name;
    }
}
