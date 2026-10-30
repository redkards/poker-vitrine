<?php

namespace App\Service\Premium;

use App\Entity\PremiumSubscription;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Paiement factice (dev / test) : l'abonnement est considéré payé immédiatement.
 * Refuse de fonctionner en production pour ne jamais offrir d'accès gratuit par erreur.
 */
class FakePremiumPaymentProvider implements PremiumPaymentProvider
{
    public function __construct(
        #[Autowire('%kernel.environment%')]
        private readonly string $environment,
    ) {
    }

    public function checkout(PremiumSubscription $subscription): PremiumCheckout
    {
        if ('prod' === $this->environment) {
            throw new PaymentUnavailableException('Aucun prestataire de paiement configuré.');
        }

        return new PremiumCheckout(true, 'fake_'.bin2hex(random_bytes(8)));
    }
}
