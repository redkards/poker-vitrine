<?php

namespace App\Dto;

use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Corps de POST /api/me/password
 */
final class PasswordChangeRequest
{
    public function __construct(
        #[UserPassword(message: 'Mot de passe actuel incorrect.')]
        public readonly string $currentPassword = '',

        #[Assert\NotBlank(message: 'Le nouveau mot de passe est obligatoire.')]
        #[Assert\Length(min: 8, max: 4096, minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caractères.')]
        #[Assert\PasswordStrength(minScore: Assert\PasswordStrength::STRENGTH_MEDIUM, message: 'Le mot de passe est trop faible : mélangez majuscules, minuscules, chiffres et symboles.')]
        #[Assert\NotEqualTo(propertyPath: 'currentPassword', message: 'Le nouveau mot de passe doit être différent de l’actuel.')]
        public readonly string $newPassword = '',
    ) {
    }
}
