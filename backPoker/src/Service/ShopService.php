<?php

namespace App\Service;

use App\Dto\OrderRequest;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\User;
use App\Enum\OrderStatus;
use App\Exception\ShopException;
use App\Repository\ProductRepository;
use App\Service\Payment\PaymentCheckout;
use App\Service\Payment\PaymentProviderInterface;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Boutique (v2.0) : création des commandes et transitions de statut.
 * Les prix, la TVA et le stock sont toujours relus en base : rien n'est repris du navigateur.
 */
class ShopService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProductRepository $products,
        private readonly PaymentProviderInterface $payment,
    ) {
    }

    /**
     * @return array{order: Order, checkout: PaymentCheckout}
     *
     * @throws ShopException produit indisponible ou stock insuffisant (rien n'est enregistré)
     */
    public function placeOrder(User $user, OrderRequest $request): array
    {
        $quantities = $request->quantitiesBySlug();
        $catalog = $this->products->findPublishedBySlugs(array_map('strval', array_keys($quantities)));

        $order = (new Order())
            ->setUser($user)
            ->setShippingName($request->fullName)
            ->setShippingLine1($request->addressLine1)
            ->setShippingLine2($request->addressLine2)
            ->setShippingPostalCode($request->postalCode)
            ->setShippingCity($request->city)
            ->setShippingCountry($request->country)
            ->setShippingPhone($request->phone);

        foreach ($quantities as $slug => $quantity) {
            $product = $catalog[(string) $slug] ?? throw ShopException::unknownProduct((string) $slug);
            if ($quantity > OrderRequest::MAX_QUANTITY) {
                throw ShopException::insufficientStock((string) $product->getName(), min($product->getStock(), OrderRequest::MAX_QUANTITY));
            }
            $order->addItem(new OrderItem($product, $quantity));
        }

        $this->transactional(function () use ($order): void {
            foreach ($order->getItems() as $item) {
                $product = $item->getProduct();
                // Réservation du stock : annulée avec la transaction si une ligne échoue
                if (!$product || !$this->products->decrementStock($product, $item->getQuantity())) {
                    throw ShopException::insufficientStock($item->getProductName(), $product ? $this->currentStock($product->getId()) : 0);
                }
            }
            $this->em->persist($order);
            $this->em->flush();
        });

        $checkout = $this->payment->createCheckout($order);
        $order->setPaymentReference($checkout->providerReference);
        $this->em->flush();

        return ['order' => $order, 'checkout' => $checkout];
    }

    /**
     * Confirmation du prestataire (futur webhook Stripe).
     */
    public function markPaid(Order $order): void
    {
        if (OrderStatus::EnAttente !== $order->getStatus()) {
            throw ShopException::invalidTransition('Seule une commande en attente peut être marquée payée.');
        }
        $order->setStatus(OrderStatus::Payee)->setPaidAt(new \DateTimeImmutable());
        $this->em->flush();
    }

    public function markShipped(Order $order): void
    {
        if (OrderStatus::Payee !== $order->getStatus()) {
            throw ShopException::invalidTransition('Seule une commande payée peut être expédiée.');
        }
        $order->setStatus(OrderStatus::Expediee)->setShippedAt(new \DateTimeImmutable());
        $this->em->flush();
    }

    /**
     * Annulation : les quantités réservées retournent en stock.
     * (Un remboursement éventuel se fait chez le prestataire de paiement.)
     */
    public function cancel(Order $order): void
    {
        if (!\in_array($order->getStatus(), [OrderStatus::EnAttente, OrderStatus::Payee], true)) {
            throw ShopException::invalidTransition('Une commande expédiée ou déjà annulée ne peut pas être annulée.');
        }

        $this->transactional(function () use ($order): void {
            foreach ($order->getItems() as $item) {
                if ($product = $item->getProduct()) {
                    $this->products->incrementStock($product, $item->getQuantity());
                }
            }
            $order->setStatus(OrderStatus::Annulee);
            $this->em->flush();
        });
    }

    /**
     * Transaction au niveau de la connexion : contrairement à EntityManager::wrapInTransaction(),
     * un refus métier (stock insuffisant) ne ferme pas l'EntityManager.
     */
    private function transactional(callable $operation): void
    {
        $connection = $this->em->getConnection();
        $connection->beginTransaction();
        try {
            $operation();
            $connection->commit();
        } catch (\Throwable $e) {
            $connection->rollBack();
            throw $e;
        }
    }

    private function currentStock(?int $productId): int
    {
        return (int) $this->em->getConnection()->fetchOne('SELECT stock FROM product WHERE id = ?', [$productId]);
    }
}
