<?php

namespace App\Service\Payment;

use App\Entity\Order;

/**
 * Prestataire de paiement de la boutique.
 *
 * L'implémentation active est choisie dans config/services.yaml :
 * FakePaymentProvider tant que la boutique n'est pas ouverte (aucun paiement réel),
 * StripeCheckoutPaymentProvider une fois les clés posées sur le serveur (voir docs/boutique/README.md).
 */
interface PaymentProviderInterface
{
    /**
     * Prépare le paiement d'une commande en attente.
     * La commande ne passe « payée » qu'après confirmation du prestataire (webhook), jamais ici.
     */
    public function createCheckout(Order $order): PaymentCheckout;
}
