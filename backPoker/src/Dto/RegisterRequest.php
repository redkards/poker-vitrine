<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Corps de POST /api/register.
 * Minimisation RGPD : seuls pseudo, email et mot de passe sont collectés.
 */
final class RegisterRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le pseudo est obligatoire.')]
        #[Assert\Length(min: 3, max: 50, minMessage: 'Le pseudo doit contenir au moins {{ limit }} caractères.', maxMessage: 'Le pseudo ne peut dépasser {{ limit }} caractères.')]
        #[Assert\Regex(pattern: '/^[\w\-.]+$/u', message: 'Le pseudo ne peut contenir que lettres, chiffres, tirets, points et underscores.')]
        public readonly string $pseudo = '',

        #[Assert\NotBlank(message: "L'email est obligatoire.")]
        #[Assert\Email(message: "L'adresse email n'est pas valide.")]
        #[Assert\Length(max: 180)]
        public readonly string $email = '',

        #[Assert\NotBlank(message: 'Le mot de passe est obligatoire.')]
        #[Assert\Length(min: 8, max: 4096, minMessage: 'Le mot de passe doit contenir au moins {{ limit }} caractères.')]
        #[Assert\PasswordStrength(minScore: Assert\PasswordStrength::STRENGTH_MEDIUM, message: 'Le mot de passe est trop faible : mélangez majuscules, minuscules, chiffres et symboles.')]
        public readonly string $password = '',

        /**
         * Case non pré-cochée côté front : doit être explicitement true
         */
        #[Assert\IsTrue(message: 'Vous devez accepter les CGU et la Politique de Confidentialité.')]
        public readonly bool $acceptCgu = false,
    ) {
    }
}
