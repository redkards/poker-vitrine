<?php

namespace App\Dto;

use App\Entity\ForumPost;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Corps de POST /api/forum/categories/{slug}/topics
 */
final class ForumTopicRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le titre est obligatoire.')]
        #[Assert\Length(min: 5, max: 150, minMessage: 'Le titre doit contenir au moins {{ limit }} caractères.', maxMessage: 'Le titre ne peut dépasser {{ limit }} caractères.')]
        public readonly string $title = '',

        #[Assert\NotBlank(message: 'Le message est obligatoire.')]
        #[Assert\Length(min: ForumPost::MIN_LENGTH, max: ForumPost::MAX_LENGTH, maxMessage: 'Le message ne peut dépasser {{ limit }} caractères.')]
        public readonly string $content = '',
    ) {
    }
}
