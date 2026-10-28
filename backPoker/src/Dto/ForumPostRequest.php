<?php

namespace App\Dto;

use App\Entity\ForumPost;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Corps de POST /api/forum/topics/{id}/posts
 */
final class ForumPostRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le message est obligatoire.')]
        #[Assert\Length(min: ForumPost::MIN_LENGTH, max: ForumPost::MAX_LENGTH, maxMessage: 'Le message ne peut dépasser {{ limit }} caractères.')]
        public readonly string $content = '',
    ) {
    }
}
