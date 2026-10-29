<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_USER_EMAIL', fields: ['email'])]
#[ORM\UniqueConstraint(name: 'UNIQ_USER_PSEUDO', fields: ['pseudo'])]
#[UniqueEntity(fields: ['email'], message: 'Un compte existe déjà avec cet email.')]
#[UniqueEntity(fields: ['pseudo'], message: 'Ce pseudo est déjà utilisé.')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * Null une fois le compte anonymisé (RGPD, droit à l'effacement)
     */
    #[ORM\Column(length: 180, nullable: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    private ?string $email = null;

    /**
     * Hash argon2id (voir security.yaml)
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 50)]
    #[Assert\Regex(pattern: '/^[\w\-.]+$/u', message: 'Le pseudo ne peut contenir que lettres, chiffres, tirets, points et underscores.')]
    private ?string $pseudo = null;

    /**
     * @var list<string>
     */
    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column(options: ['default' => false])]
    private bool $isVerified = false;

    /**
     * Empreinte SHA-256 du jeton envoyé par email (le jeton en clair n'est jamais stocké)
     */
    #[ORM\Column(length: 64, nullable: true)]
    private ?string $verificationToken = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $verificationTokenExpiresAt = null;

    /**
     * Version des CGU acceptée lors du dernier consentement
     */
    #[ORM\Column(length: 20)]
    private ?string $consentVersion = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $consentAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $lastLoginAt = null;

    /**
     * Empreinte SHA-256 du jeton de confirmation de suppression envoyé par email (1 h)
     */
    #[ORM\Column(length: 64, nullable: true)]
    private ?string $deletionToken = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $deletionTokenExpiresAt = null;

    /**
     * Date d'anonymisation : le compte n'est plus rattaché à une personne
     */
    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $anonymizedAt = null;

    /**
     * @var Collection<int, ConsentLog>
     */
    #[ORM\OneToMany(targetEntity: ConsentLog::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $consentLogs;

    public function __construct()
    {
        $this->consentLogs = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = null === $email ? null : mb_strtolower(trim($email));

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_values(array_unique($roles));
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPseudo(): ?string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): static
    {
        $this->pseudo = trim($pseudo);

        return $this;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function getVerificationToken(): ?string
    {
        return $this->verificationToken;
    }

    public function setVerificationToken(?string $verificationToken): static
    {
        $this->verificationToken = $verificationToken;

        return $this;
    }

    public function getVerificationTokenExpiresAt(): ?\DateTimeImmutable
    {
        return $this->verificationTokenExpiresAt;
    }

    public function setVerificationTokenExpiresAt(?\DateTimeImmutable $verificationTokenExpiresAt): static
    {
        $this->verificationTokenExpiresAt = $verificationTokenExpiresAt;

        return $this;
    }

    public function getConsentVersion(): ?string
    {
        return $this->consentVersion;
    }

    public function setConsentVersion(string $consentVersion): static
    {
        $this->consentVersion = $consentVersion;

        return $this;
    }

    public function getConsentAt(): ?\DateTimeImmutable
    {
        return $this->consentAt;
    }

    public function setConsentAt(\DateTimeImmutable $consentAt): static
    {
        $this->consentAt = $consentAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getLastLoginAt(): ?\DateTimeImmutable
    {
        return $this->lastLoginAt;
    }

    public function setLastLoginAt(?\DateTimeImmutable $lastLoginAt): static
    {
        $this->lastLoginAt = $lastLoginAt;

        return $this;
    }

    public function getDeletionToken(): ?string
    {
        return $this->deletionToken;
    }

    public function setDeletionToken(?string $deletionToken): static
    {
        $this->deletionToken = $deletionToken;

        return $this;
    }

    public function getDeletionTokenExpiresAt(): ?\DateTimeImmutable
    {
        return $this->deletionTokenExpiresAt;
    }

    public function setDeletionTokenExpiresAt(?\DateTimeImmutable $deletionTokenExpiresAt): static
    {
        $this->deletionTokenExpiresAt = $deletionTokenExpiresAt;

        return $this;
    }

    public function getAnonymizedAt(): ?\DateTimeImmutable
    {
        return $this->anonymizedAt;
    }

    public function isAnonymized(): bool
    {
        return null !== $this->anonymizedAt;
    }

    public function setAnonymizedAt(?\DateTimeImmutable $anonymizedAt): static
    {
        $this->anonymizedAt = $anonymizedAt;

        return $this;
    }

    /**
     * @return Collection<int, ConsentLog>
     */
    public function getConsentLogs(): Collection
    {
        return $this->consentLogs;
    }

    public function addConsentLog(ConsentLog $consentLog): static
    {
        if (!$this->consentLogs->contains($consentLog)) {
            $this->consentLogs->add($consentLog);
            $consentLog->setUser($this);
        }

        return $this;
    }

    public function removeConsentLog(ConsentLog $consentLog): static
    {
        $this->consentLogs->removeElement($consentLog);

        return $this;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
    }
}
