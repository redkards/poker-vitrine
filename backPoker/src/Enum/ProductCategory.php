<?php

namespace App\Enum;

/**
 * Rayon de la boutique (v2.0). La catégorie détermine le taux de TVA par défaut.
 */
enum ProductCategory: string
{
    case Livre = 'livre';
    case Accessoire = 'accessoire';

    public function label(): string
    {
        return match ($this) {
            self::Livre => 'Livres',
            self::Accessoire => 'Accessoires',
        };
    }

    /**
     * Livres : taux réduit (CGI art. 278-0 bis) ; accessoires : taux normal.
     */
    public function defaultVatRate(): VatRate
    {
        return match ($this) {
            self::Livre => VatRate::Reduit,
            self::Accessoire => VatRate::Normal,
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
