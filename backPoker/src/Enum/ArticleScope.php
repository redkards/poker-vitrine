<?php

namespace App\Enum;

/**
 * Portée d'une actualité : affichée en deux colonnes sur l'accueil (France / International).
 */
enum ArticleScope: string
{
    case France = 'france';
    case International = 'international';

    public function label(): string
    {
        return match ($this) {
            self::France => 'Actu France',
            self::International => 'Actu internationale',
        };
    }
}
