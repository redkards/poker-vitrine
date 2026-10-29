<?php

namespace App\Controller\Api;

use App\Dto\OrderRequest;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Product;
use App\Entity\User;
use App\Enum\ProductCategory;
use App\Exception\ShopException;
use App\Repository\OrderRepository;
use App\Repository\ProductRepository;
use App\Service\ShopService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Boutique (v2.0, derrière le drapeau SHOP_ENABLED — voir ShopFeatureListener) :
 * catalogue public, commande par un membre vérifié, historique des commandes.
 */
class ShopController extends AbstractController
{
    public function __construct(
        private readonly ProductRepository $products,
    ) {
    }

    #[Route('/api/shop/products', name: 'api_shop_products', methods: ['GET'])]
    public function products(#[MapQueryParameter] ?string $category = null): JsonResponse
    {
        $categoryEnum = $category ? ProductCategory::tryFrom($category) : null;
        if ($category && !$categoryEnum) {
            return $this->json(['message' => 'Catégorie inconnue (livre ou accessoire).'], Response::HTTP_BAD_REQUEST);
        }

        $all = $this->products->findPublished();
        $counts = array_fill_keys(array_map(static fn (ProductCategory $c) => $c->value, ProductCategory::cases()), 0);
        foreach ($all as $product) {
            ++$counts[$product->getCategory()->value];
        }
        $items = $categoryEnum ? array_values(array_filter($all, static fn (Product $p) => $p->getCategory() === $categoryEnum)) : $all;

        return $this->json([
            'items' => array_map(fn (Product $p) => $this->productData($p), $items),
            'categories' => array_map(static fn (ProductCategory $c) => ['value' => $c->value, 'label' => $c->label(), 'count' => $counts[$c->value]], ProductCategory::cases()),
        ]);
    }

    #[Route('/api/shop/products/{slug}', name: 'api_shop_product', requirements: ['slug' => '[a-z0-9-]+'], methods: ['GET'])]
    public function product(string $slug): JsonResponse
    {
        $product = $this->products->findOnePublishedBySlug($slug);
        if (!$product) {
            return $this->json(['message' => 'Produit introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->productData($product, true));
    }

    #[Route('/api/shop/orders', name: 'api_shop_order_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createOrder(
        #[MapRequestPayload] OrderRequest $payload,
        #[CurrentUser] User $user,
        ShopService $shop,
        RateLimiterFactoryInterface $shopOrderLimiter,
    ): JsonResponse {
        if (!$user->isVerified()) {
            return $this->json(['message' => 'Confirmez votre adresse email avant de commander.'], Response::HTTP_FORBIDDEN);
        }
        if (!$shopOrderLimiter->create('user-'.$user->getId())->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de commandes en peu de temps : patientez quelques minutes.'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        try {
            ['order' => $order, 'checkout' => $checkout] = $shop->placeOrder($user, $payload);
        } catch (ShopException $e) {
            return $this->json(['message' => $e->getMessage()], $e->statusCode);
        }

        return $this->json($this->orderData($order) + [
            'payment' => ['redirectUrl' => $checkout->redirectUrl],
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/me/orders', name: 'api_me_orders', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function myOrders(#[CurrentUser] User $user, OrderRepository $orders): JsonResponse
    {
        $response = $this->json(array_map(fn (Order $o) => $this->orderData($o), $orders->findByUser($user)));
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }

    /**
     * @return array<string, mixed>
     */
    private function productData(Product $product, bool $withDescription = false): array
    {
        $data = [
            'id' => $product->getId(),
            'name' => $product->getName(),
            'slug' => $product->getSlug(),
            'category' => $product->getCategory()?->value,
            'categoryLabel' => $product->getCategory()?->label(),
            'priceCents' => $product->getPriceCents(),
            'vatRate' => $product->getVatRate()?->value,
            // Quantité commandable (le stock exact n'est pas exposé au-delà du plafond par commande)
            'available' => min($product->getStock(), OrderRequest::MAX_QUANTITY),
            'imageUrl' => $product->getImageUrl(),
            'excerpt' => mb_strimwidth(strip_tags((string) $product->getDescription()), 0, 160, '…'),
        ];

        if ($withDescription) {
            $data['description'] = $product->getDescription();
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function orderData(Order $order): array
    {
        return [
            'reference' => $order->getReference(),
            'status' => $order->getStatus()->value,
            'statusLabel' => $order->getStatus()->label(),
            'createdAt' => $order->getCreatedAt()?->format(\DATE_ATOM),
            'totalExclTaxCents' => $order->getTotalExclTaxCents(),
            'totalVatCents' => $order->getTotalVatCents(),
            'totalInclTaxCents' => $order->getTotalInclTaxCents(),
            'shippingAddress' => [
                'fullName' => $order->getShippingName(),
                'addressLine1' => $order->getShippingLine1(),
                'addressLine2' => $order->getShippingLine2(),
                'postalCode' => $order->getShippingPostalCode(),
                'city' => $order->getShippingCity(),
                'country' => $order->getShippingCountry(),
            ],
            'items' => array_map(static fn (OrderItem $i) => [
                'productName' => $i->getProductName(),
                'productSlug' => $i->getProduct()?->getSlug(),
                'quantity' => $i->getQuantity(),
                'unitPriceInclTaxCents' => $i->getUnitPriceInclTaxCents(),
                'vatRate' => $i->getVatRate()->value,
                'lineInclTaxCents' => $i->getLineInclTaxCents(),
            ], $order->getItems()->toArray()),
        ];
    }
}
