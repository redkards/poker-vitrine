<?php

namespace App\Tests\Functional;

use App\Entity\Order;
use App\Entity\Product;
use App\Entity\User;
use App\Enum\OrderStatus;
use App\Enum\ProductCategory;
use App\Service\GdprService;
use App\Service\Payment\StripeCheckoutPaymentProvider;
use App\Service\ShopService;
use App\EventListener\ShopFeatureListener;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Boutique v2.0 : catalogue, drapeau SHOP_ENABLED, commandes (prix recalculés côté serveur), RGPD.
 */
class ShopApiTest extends ApiTestCase
{
    private const PASSWORD = 'Full-House-2026!';

    private function product(string $name, ProductCategory $category, int $priceCents, int $stock = 10, bool $published = true): Product
    {
        $product = (new Product())->setName($name)->setSlug(strtolower(str_replace(' ', '-', $name)))
            ->setCategory($category)->setPriceCents($priceCents)->setStock($stock)->setIsPublished($published);
        $this->em->persist($product);
        $this->em->flush();

        return $product;
    }

    /**
     * @return array{Authorization: string}
     */
    private function member(string $pseudo = 'alice'): array
    {
        $user = (new User())->setEmail($pseudo.'@example.com')->setPseudo($pseudo)->setIsVerified(true);
        $user->setPassword(static::getContainer()->get('security.user_password_hasher')->hashPassword($user, self::PASSWORD));
        static::getContainer()->get(GdprService::class)->recordConsent($user, '203.0.113.7');
        $this->em->persist($user);
        $this->em->flush();

        $data = $this->jsonRequest('POST', '/api/login', ['email' => $pseudo.'@example.com', 'password' => self::PASSWORD]);

        return ['Authorization' => 'Bearer '.$data['token']];
    }

    /**
     * @param list<array<string, mixed>> $items
     *
     * @return array<string, mixed>
     */
    private function orderBody(array $items): array
    {
        return [
            'items' => $items,
            'fullName' => 'Alice Martin',
            'addressLine1' => '12 rue des Cartes',
            'postalCode' => '75011',
            'city' => 'Paris',
            'country' => 'FR',
            'phone' => '06 12 34 56 78',
            'acceptCgv' => true,
        ];
    }

    public function testCatalogListsPublishedProductsWithCategoryFilter(): void
    {
        $this->product('Livre test', ProductCategory::Livre, 2490);
        $this->product('Jetons test', ProductCategory::Accessoire, 8900);
        $this->product('Brouillon', ProductCategory::Livre, 1000, published: false);

        $data = $this->jsonRequest('GET', '/api/shop/products');
        self::assertResponseIsSuccessful();
        // Tri par catégorie (accessoire, livre) puis par nom
        self::assertSame(['Jetons test', 'Livre test'], array_column($data['items'], 'name'));
        self::assertSame([1, 1], array_column($data['categories'], 'count'));

        $books = $this->jsonRequest('GET', '/api/shop/products?category=livre');
        self::assertSame(['Livre test'], array_column($books['items'], 'name'));
        self::assertSame('5.5', $books['items'][0]['vatRate'], 'TVA réduite par défaut pour un livre');

        $detail = $this->jsonRequest('GET', '/api/shop/products/jetons-test');
        self::assertSame(8900, $detail['priceCents']);
        self::assertSame('20', $detail['vatRate']);

        $this->jsonRequest('GET', '/api/shop/products/brouillon');
        self::assertResponseStatusCodeSame(404);
        $this->jsonRequest('GET', '/api/shop/products?category=inconnue');
        self::assertResponseStatusCodeSame(400);
    }

    public function testShopRoutesAre404WhenFlagIsOff(): void
    {
        // Valeur livrée : boutique fermée
        $env = (string) file_get_contents(static::getContainer()->getParameter('kernel.project_dir').'/.env');
        self::assertMatchesRegularExpression('/^SHOP_ENABLED=0\r?$/m', $env);

        $listener = new ShopFeatureListener(false);
        $kernel = static::getContainer()->get('kernel');
        foreach (['/api/shop/products', '/api/shop/products/x', '/api/shop/orders', '/api/me/orders'] as $uri) {
            $event = new RequestEvent($kernel, Request::create($uri), HttpKernelInterface::MAIN_REQUEST);
            $listener($event);
            self::assertSame(404, $event->getResponse()?->getStatusCode(), $uri);
        }
        // Le reste de l'API n'est pas concerné
        foreach (['/api/me', '/api/shopping', '/api/me/orders-x'] as $uri) {
            $event = new RequestEvent($kernel, Request::create($uri), HttpKernelInterface::MAIN_REQUEST);
            $listener($event);
            self::assertNull($event->getResponse(), $uri);
        }
    }

    public function testAnonymousCannotOrder(): void
    {
        $this->product('Livre test', ProductCategory::Livre, 2490);

        $this->jsonRequest('POST', '/api/shop/orders', $this->orderBody([['slug' => 'livre-test', 'quantity' => 1]]));
        self::assertResponseStatusCodeSame(401);
        self::assertSame(0, $this->em->getRepository(Order::class)->count([]));
    }

    public function testOrderUsesServerPricesAndReservesStock(): void
    {
        $book = $this->product('Livre test', ProductCategory::Livre, 2490, stock: 5);
        $this->product('Jetons test', ProductCategory::Accessoire, 8900, stock: 3);
        $headers = $this->member();

        // Prix, TVA et total envoyés par le client : ignorés
        $body = $this->orderBody([
            ['slug' => 'livre-test', 'quantity' => 1, 'priceCents' => 1, 'vatRate' => '0'],
            ['slug' => 'jetons-test', 'quantity' => 1],
            ['slug' => 'livre-test', 'quantity' => 1],
        ]) + ['totalInclTaxCents' => 100];

        $data = $this->jsonRequest('POST', '/api/shop/orders', $body, $headers);
        self::assertResponseStatusCodeSame(201);
        self::assertSame('en_attente', $data['status']);
        self::assertNull($data['payment']['redirectUrl'], 'prestataire factice : aucun paiement réel');
        self::assertMatchesRegularExpression('/^PW-\d{8}-[0-9A-F]{6}$/', $data['reference']);

        // 2 × 24,90 (TVA 5,5 %) + 89,00 (TVA 20 %)
        self::assertSame(2 * 2490 + 8900, $data['totalInclTaxCents']);
        $expectedHt = (int) round(4980 / 1.055) + (int) round(8900 / 1.2);
        self::assertSame($expectedHt, $data['totalExclTaxCents']);
        self::assertSame(13880 - $expectedHt, $data['totalVatCents']);
        self::assertCount(2, $data['items'], 'doublons fusionnés');
        self::assertSame(2, $data['items'][0]['quantity']);

        $this->em->clear();
        self::assertSame(3, $this->em->getRepository(Product::class)->find($book->getId())->getStock());

        $orders = $this->jsonRequest('GET', '/api/me/orders', [], $headers);
        self::assertSame([$data['reference']], array_column($orders, 'reference'));
        self::assertSame([], $this->jsonRequest('GET', '/api/me/orders', [], $this->member('bob')), 'commandes privées');
    }

    public function testInsufficientStockRejectsWholeOrder(): void
    {
        $book = $this->product('Livre test', ProductCategory::Livre, 2490, stock: 5);
        $this->product('Jetons test', ProductCategory::Accessoire, 8900, stock: 1);
        $headers = $this->member();

        $data = $this->jsonRequest('POST', '/api/shop/orders', $this->orderBody([
            ['slug' => 'livre-test', 'quantity' => 2],
            ['slug' => 'jetons-test', 'quantity' => 2],
        ]), $headers);
        self::assertResponseStatusCodeSame(409);
        self::assertStringContainsString('1 exemplaire(s) disponible(s)', $data['message']);

        $this->em->clear();
        self::assertSame(0, $this->em->getRepository(Order::class)->count([]));
        self::assertSame(5, $this->em->getRepository(Product::class)->find($book->getId())->getStock(), 'réservation annulée');

        $this->jsonRequest('POST', '/api/shop/orders', $this->orderBody([['slug' => 'inexistant', 'quantity' => 1]]), $headers);
        self::assertResponseStatusCodeSame(422);
    }

    public function testOrderValidation(): void
    {
        $this->product('Livre test', ProductCategory::Livre, 2490);
        $headers = $this->member();

        $body = $this->orderBody([['slug' => 'livre-test', 'quantity' => 0]]);
        $body['acceptCgv'] = false;
        $body['country'] = 'US';
        $data = $this->jsonRequest('POST', '/api/shop/orders', $body, $headers);
        self::assertResponseStatusCodeSame(422);
        $paths = array_column($data['violations'], 'propertyPath');
        self::assertContains('acceptCgv', $paths);
        self::assertContains('country', $paths);
        self::assertContains('items[0][quantity]', $paths);
    }

    public function testCancelRestocksAndAnonymizationKeepsOrderWithoutUser(): void
    {
        $book = $this->product('Livre test', ProductCategory::Livre, 2490, stock: 5);
        $headers = $this->member();
        $reference = $this->jsonRequest('POST', '/api/shop/orders', $this->orderBody([['slug' => 'livre-test', 'quantity' => 2]]), $headers)['reference'];

        $this->client->request('GET', '/api/me/export', server: ['HTTP_AUTHORIZATION' => $headers['Authorization']]);
        $export = json_decode((string) $this->client->getResponse()->getContent(), true);
        self::assertSame($reference, $export['orders'][0]['reference']);

        $order = $this->em->getRepository(Order::class)->findOneBy(['reference' => $reference]);
        $shop = static::getContainer()->get(ShopService::class);
        $shop->cancel($order);
        $this->em->clear();
        self::assertSame(5, $this->em->getRepository(Product::class)->find($book->getId())->getStock());
        $order = $this->em->getRepository(Order::class)->findOneBy(['reference' => $reference]);
        self::assertSame(OrderStatus::Annulee, $order->getStatus());

        // Paramètres Stripe préparés à partir de la commande (aucun appel réseau)
        $stripe = new StripeCheckoutPaymentProvider('sk_test_changeme', 'http://localhost:4200');
        $params = $stripe->buildSessionParameters($order);
        self::assertStringContainsString($reference, $params['success_url']);
        try {
            $stripe->createCheckout($order);
            self::fail('Stripe ne doit pas être appelé tant qu\'il n\'est pas branché');
        } catch (\LogicException) {
        }
        self::assertSame(2490, $params['line_items'][0]['price_data']['unit_amount']);
        self::assertSame(2, $params['line_items'][0]['quantity']);

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => 'alice@example.com']);
        static::getContainer()->get(GdprService::class)->anonymize($user);
        $this->em->clear();
        $kept = $this->em->getRepository(Order::class)->findOneBy(['reference' => $reference]);
        self::assertNotNull($kept, 'commande conservée (obligation comptable)');
        self::assertNull($kept->getUser());
        self::assertNull($kept->getShippingPhone());
        self::assertSame('Alice Martin', $kept->getShippingName(), 'adresse de facturation conservée');
    }
}
