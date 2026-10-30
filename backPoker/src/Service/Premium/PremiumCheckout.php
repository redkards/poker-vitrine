<?php

namespace App\Service\Premium;

/**
 * Résultat d'un démarrage de paiement : soit payé immédiatement (activated),
 * soit une page de paiement externe vers laquelle rediriger le membre (redirectUrl).
 */
final class PremiumCheckout
{
    public function __construct(
        public readonly bool $activated,
        public readonly ?string $providerReference = null,
        public readonly ?string $redirectUrl = null,
    ) {
    }
}
