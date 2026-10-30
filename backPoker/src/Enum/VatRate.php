<?php

namespace App\Enum;

/**
 * Taux de TVA applicables en France métropolitaine aux produits de la boutique.
 * Les calculs se font en points de base (1 % = 100) pour rester en entiers.
 */
enum VatRate: string
{
    case Reduit = '5.5';
    case Normal = '20';

    public function basisPoints(): int
    {
        return match ($this) {
            self::Reduit => 550,
            self::Normal => 2000,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Reduit => '5,5 % (livres)',
            self::Normal => '20 % (taux normal)',
        };
    }

    /**
     * Part hors taxes d'un montant TTC, arrondie au centime le plus proche.
     */
    public function excludingTax(int $amountIncludingTaxCents): int
    {
        return (int) round($amountIncludingTaxCents * 10000 / (10000 + $this->basisPoints()));
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
