<?php

namespace App\Service\Premium;

use App\Entity\PremiumSubscription;

/**
 * Préparation Stripe (NON branchée, aucune clé) :
 * 1. composer require stripe/stripe-php, STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET dans .env.local ;
 * 2. créer une Checkout Session (mode « subscription », prix Stripe par formule) et renvoyer son URL ;
 * 3. webhook « checkout.session.completed » / « invoice.paid » → PremiumService::activate().
 * Puis faire pointer l'alias PremiumPaymentProvider vers cette classe dans config/services.yaml.
 */
class StripePremiumPaymentProvider implements PremiumPaymentProvider
{
    public function checkout(PremiumSubscription $subscription): PremiumCheckout
    {
        throw new PaymentUnavailableException('Le paiement Stripe n\'est pas encore branché.');
    }
}
