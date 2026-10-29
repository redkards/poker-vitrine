<?php

namespace App\Enum;

/**
 * Rubrique d'une actualité, affichée en fenêtres sur l'accueil :
 * bloc « Actualités » (France / International) et bloc « Tournois » (live / en ligne).
 */
enum ArticleScope: string
{
    case France = 'france';
    case International = 'international';
    case Live = 'live';
    case Online = 'online';

    public function label(): string
    {
        return match ($this) {
            self::France => 'Actu France',
            self::International => 'Actu internationale',
            self::Live => 'Tournois live',
            self::Online => 'Tournois en ligne',
        };
    }

    /**
     * @return array<string, self> libellé => valeur (choix du back-office)
     */
    public static function choices(): array
    {
        $choices = [];
        foreach (self::cases() as $case) {
            $choices[$case->label()] = $case;
        }

        return $choices;
    }
}
