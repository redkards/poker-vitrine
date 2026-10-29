<?php

namespace App\Service\Payment;

/**
 * Résultat de la préparation d'un paiement.
 */
final class PaymentCheckout
{
    public function __construct(
        /** Identifiant chez le prestataire (stocké sur la commande) */
        public readonly string $providerReference,
        /** Page de paiement vers laquelle rediriger le client ; null = aucun paiement en ligne */
        public readonly ?string $redirectUrl = null,
    ) {
    }
}
