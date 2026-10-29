<?php

namespace App\Enum;

/**
 * Cycle de vie d'une commande : en_attente → payee → expediee, ou annulee.
 */
enum OrderStatus: string
{
    case EnAttente = 'en_attente';
    case Payee = 'payee';
    case Expediee = 'expediee';
    case Annulee = 'annulee';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente de paiement',
            self::Payee => 'Payée',
            self::Expediee => 'Expédiée',
            self::Annulee => 'Annulée',
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
