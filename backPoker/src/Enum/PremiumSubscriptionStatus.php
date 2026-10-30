<?php

namespace App\Enum;

/**
 * Cycle de vie d'un abonnement Premium.
 */
enum PremiumSubscriptionStatus: string
{
    case EnAttente = 'en_attente';
    case Active = 'active';
    case Annulee = 'annulee';
    case Expiree = 'expiree';

    public function label(): string
    {
        return match ($this) {
            self::EnAttente => 'En attente de paiement',
            self::Active => 'Active',
            self::Annulee => 'Annulée',
            self::Expiree => 'Expirée',
        };
    }
}
