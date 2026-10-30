<?php

namespace App\EventListener;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Drapeau de la boutique (v2.0) : tant que SHOP_ENABLED=0, ses routes répondent 404,
 * comme si elles n'existaient pas (avant le pare-feu : pas de 401 révélateur).
 */
#[AsEventListener(event: KernelEvents::REQUEST, priority: 64)]
final class ShopFeatureListener
{
    private const PATTERN = '#^/api/(shop(/|$)|me/orders$)#';

    public function __construct(
        #[Autowire(env: 'bool:SHOP_ENABLED')]
        private readonly bool $shopEnabled,
    ) {
    }

    public function __invoke(RequestEvent $event): void
    {
        if ($this->shopEnabled || !$event->isMainRequest() || !preg_match(self::PATTERN, $event->getRequest()->getPathInfo())) {
            return;
        }

        $event->setResponse(new JsonResponse(['message' => 'Ressource introuvable.'], Response::HTTP_NOT_FOUND));
    }
}
