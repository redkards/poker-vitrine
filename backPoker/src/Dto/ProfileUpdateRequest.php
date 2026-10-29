<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Corps de PATCH /api/me
 */
final class ProfileUpdateRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le pseudo est obligatoire.')]
        #[Assert\Length(min: 3, max: 50, minMessage: 'Le pseudo doit contenir au moins {{ limit }} caractères.', maxMessage: 'Le pseudo ne peut dépasser {{ limit }} caractères.')]
        #[Assert\Regex(pattern: '/^[\w\-.]+$/u', message: 'Le pseudo ne peut contenir que lettres, chiffres, tirets, points et underscores.')]
        public readonly string $pseudo = '',
    ) {
    }
}
