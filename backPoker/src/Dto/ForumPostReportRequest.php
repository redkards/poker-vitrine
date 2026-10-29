<?php

namespace App\Dto;

use App\Entity\ForumPostReport;
use App\Enum\ReportReason;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Corps de POST /api/forum/posts/{id}/report
 */
final class ForumPostReportRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le motif est obligatoire.')]
        #[Assert\Choice(callback: [ReportReason::class, 'values'], message: 'Motif inconnu (spam, insulte, hors_sujet ou autre).')]
        public readonly string $reason = '',

        #[Assert\Length(max: ForumPostReport::COMMENT_MAX_LENGTH, maxMessage: 'Le commentaire ne peut dépasser {{ limit }} caractères.')]
        public readonly ?string $comment = null,
    ) {
    }
}
