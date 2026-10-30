<?php

namespace App\Controller\Api;

use App\Dto\PremiumSubscribeRequest;
use App\Entity\User;
use App\Enum\PremiumPlan;
use App\Service\Premium\PaymentUnavailableException;
use App\Service\Premium\PremiumService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\RateLimiter\RateLimiterFactoryInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Abonnement Premium : formules (public) et souscription (membre connecté).
 */
#[Route('/api/premium')]
class PremiumController extends AbstractController
{
    public function __construct(private readonly PremiumService $premium)
    {
    }

    #[Route('/plans', name: 'api_premium_plans', methods: ['GET'])]
    public function plans(): JsonResponse
    {
        return $this->json([
            'currency' => 'EUR',
            'paymentEnabled' => $this->premium->isPaymentEnabled(),
            'plans' => $this->premium->plans(),
        ]);
    }

    #[Route('/subscribe', name: 'api_premium_subscribe', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function subscribe(
        #[MapRequestPayload] PremiumSubscribeRequest $payload,
        #[CurrentUser] User $user,
        RateLimiterFactoryInterface $premiumSubscribeLimiter,
    ): JsonResponse {
        if (!$premiumSubscribeLimiter->create('user-'.$user->getId())->consume()->isAccepted()) {
            return $this->json(['message' => 'Trop de tentatives, réessayez dans quelques minutes.'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        try {
            [$subscription, $checkout] = $this->premium->subscribe($user, PremiumPlan::from($payload->plan));
        } catch (PaymentUnavailableException) {
            return $this->json([
                'code' => 'payment_unavailable',
                'message' => 'Le paiement en ligne n\'est pas encore ouvert.',
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        return $this->json([
            'message' => $checkout->activated ? 'Abonnement Premium activé, bon jeu !' : 'Redirection vers le paiement…',
            'status' => $subscription->getStatus()->value,
            'redirectUrl' => $checkout->redirectUrl,
            'premium' => $user->isPremium(),
            'premiumUntil' => $user->getPremiumUntil()?->format(\DATE_ATOM),
        ], Response::HTTP_CREATED);
    }
}
