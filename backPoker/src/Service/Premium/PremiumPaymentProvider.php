<?php

namespace App\Service\Premium;

use App\Entity\PremiumSubscription;

/**
 * Prestataire de paiement de l'abonnement Premium.
 * Implémentation active choisie dans config/services.yaml (factice en dev/test, Stripe à brancher).
 */
interface PremiumPaymentProvider
{
    /**
     * Démarre le paiement d'un abonnement « en attente ».
     *
     * @throws PaymentUnavailableException si le paiement ne peut pas être lancé
     */
    public function checkout(PremiumSubscription $subscription): PremiumCheckout;
}
