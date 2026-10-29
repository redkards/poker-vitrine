<?php

namespace App\Dto;

use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;

/**
 * Corps de DELETE /api/me : le mot de passe protège contre une suppression depuis une session volée.
 */
final class AccountDeletionRequest
{
    public function __construct(
        #[UserPassword(message: 'Mot de passe incorrect.')]
        public readonly string $password = '',
    ) {
    }
}
