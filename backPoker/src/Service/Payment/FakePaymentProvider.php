<?php

namespace App\Service\Payment;

use App\Entity\Order;

/**
 * Prestataire factice (développement, tests, boutique en préparation) :
 * aucun appel réseau, aucune page de paiement. La commande reste « en attente ».
 */
final class FakePaymentProvider implements PaymentProviderInterface
{
    public function createCheckout(Order $order): PaymentCheckout
    {
        return new PaymentCheckout('fake_'.$order->getReference());
    }
}
