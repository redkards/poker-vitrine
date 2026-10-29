<?php

namespace App\Entity;

use App\Enum\ReportReason;
use App\Repository\ForumPostReportRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Signalement d'un message du forum par un membre (file de modération, v1.1).
 * Un membre ne signale qu'une fois un même message.
 */
#[ORM\Entity(repositoryClass: ForumPostReportRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_FORUM_POST_REPORT', fields: ['post', 'reporter'])]
#[ORM\Index(name: 'IDX_FORUM_POST_REPORT_RESOLVED_AT', columns: ['resolved_at'])]
class ForumPostReport
{
    public const COMMENT_MAX_LENGTH = 500;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?ForumPost $post = null;

    /**
     * Le signalement disparaît avec le compte (CASCADE)
     */
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $reporter = null;

    #[ORM\Column(length: 20, enumType: ReportReason::class)]
    private ReportReason $reason = ReportReason::Other;

    #[ORM\Column(length: self::COMMENT_MAX_LENGTH, nullable: true)]
    private ?string $comment = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $resolvedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $resolvedBy = null;

    public function __construct(ForumPost $post, User $reporter, ReportReason $reason, ?string $comment = null)
    {
        $this->post = $post;
        $this->reporter = $reporter;
        $this->reason = $reason;
        $comment = null !== $comment ? trim($comment) : null;
        $this->comment = '' === $comment ? null : $comment;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPost(): ?ForumPost
    {
        return $this->post;
    }

    public function getReporter(): ?User
    {
        return $this->reporter;
    }

    public function getReason(): ReportReason
    {
        return $this->reason;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getResolvedAt(): ?\DateTimeImmutable
    {
        return $this->resolvedAt;
    }

    public function getResolvedBy(): ?User
    {
        return $this->resolvedBy;
    }

    public function isResolved(): bool
    {
        return null !== $this->resolvedAt;
    }

    public function resolve(User $moderator): static
    {
        $this->resolvedAt = new \DateTimeImmutable();
        $this->resolvedBy = $moderator;

        return $this;
    }
}
