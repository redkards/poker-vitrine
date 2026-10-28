<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\TooManyLoginAttemptsAuthenticationException;

/**
 * Lexik répond 401 à tout échec : on renvoie 429 quand le login est bloqué par le rate limiter.
 */
#[AsEventListener(event: Events::AUTHENTICATION_FAILURE)]
class LoginThrottledListener
{
    public function __invoke(AuthenticationFailureEvent $event): void
    {
        if (!$event->getException() instanceof TooManyLoginAttemptsAuthenticationException) {
            return;
        }

        $event->setResponse(new JsonResponse([
            'code' => Response::HTTP_TOO_MANY_REQUESTS,
            'message' => 'Trop de tentatives de connexion. Réessayez dans une minute.',
        ], Response::HTTP_TOO_MANY_REQUESTS));
    }
}
