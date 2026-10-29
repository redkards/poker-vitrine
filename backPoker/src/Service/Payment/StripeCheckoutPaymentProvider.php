<?php

namespace App\Service\Payment;

use App\Entity\Order;
use App\Entity\OrderItem;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Stripe Checkout — PRÉPARÉ MAIS NON BRANCHÉ (boutique v2.0 en attente).
 *
 * Ce qui est prêt : la construction des paramètres d'une session Checkout
 * (POST https://api.stripe.com/v1/checkout/sessions) à partir d'une commande déjà recalculée côté serveur.
 * Ce qui reste à faire avant d'activer (voir docs/boutique/README.md) :
 *  1. composer require stripe/stripe-php (ou symfony/http-client) ;
 *  2. remplacer l'exception de createCheckout() par l'appel réel ;
 *  3. poser STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET dans .env.local sur le serveur (jamais dans Git) ;
 *  4. ajouter le webhook /api/stripe/webhook (checkout.session.completed → commande « payée ») ;
 *  5. faire pointer l'alias PaymentProviderInterface vers cette classe dans config/services.yaml.
 *
 * Aucune clé n'est présente dans le dépôt et aucun appel réseau n'est effectué.
 */
final class StripeCheckoutPaymentProvider implements PaymentProviderInterface
{
    public function __construct(
        #[Autowire(env: 'STRIPE_SECRET_KEY')]
        private readonly string $secretKey,
        #[Autowire(env: 'FRONTEND_URL')]
        private readonly string $frontendUrl,
    ) {
    }

    public function createCheckout(Order $order): PaymentCheckout
    {
        if (!str_starts_with($this->secretKey, 'sk_') || str_ends_with($this->secretKey, 'changeme')) {
            throw new \LogicException('Stripe n\'est pas configuré : STRIPE_SECRET_KEY manquante (voir docs/boutique/README.md).');
        }

        // Appel volontairement absent : la boutique n'est pas encore ouverte.
        throw new \LogicException('Paiement Stripe non branché (boutique v2.0 en préparation).');
    }

    /**
     * Paramètres de la session Checkout. Les prix envoyés sont ceux de la commande
     * (recalculés côté serveur), jamais ceux reçus du navigateur.
     *
     * @return array<string, mixed>
     */
    public function buildSessionParameters(Order $order): array
    {
        $base = rtrim($this->frontendUrl, '/');

        return [
            'mode' => 'payment',
            'locale' => 'fr',
            'client_reference_id' => $order->getReference(),
            'metadata' => ['order_reference' => $order->getReference()],
            'success_url' => $base.'/mon-espace/commandes?paiement=ok&commande='.$order->getReference(),
            'cancel_url' => $base.'/boutique/panier?paiement=annule',
            'line_items' => array_map(static fn (OrderItem $item) => [
                'quantity' => $item->getQuantity(),
                'price_data' => [
                    'currency' => 'eur',
                    // Prix TTC : la TVA est déjà incluse (taux enregistré sur la ligne)
                    'unit_amount' => $item->getUnitPriceInclTaxCents(),
                    'product_data' => [
                        'name' => $item->getProductName(),
                        'metadata' => ['vat_rate' => $item->getVatRate()->value],
                    ],
                ],
            ], $order->getItems()->toArray()),
        ];
    }
}
