<?php

namespace App\Service\Premium;

use App\Entity\PremiumSubscription;
use App\Entity\User;
use App\Enum\PremiumPlan;
use App\Enum\PremiumSubscriptionStatus;
use App\Repository\PremiumSubscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Abonnement Premium : formules et prix, souscription, activation (paiement ou manuelle), retrait.
 */
class PremiumService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly PremiumSubscriptionRepository $subscriptions,
        private readonly PremiumPaymentProvider $paymentProvider,
        #[Autowire(env: 'bool:PREMIUM_PAYMENT_ENABLED')]
        private readonly bool $paymentEnabled,
        #[Autowire(env: 'int:PREMIUM_PRICE_MONTHLY_CENTS')]
        private readonly int $monthlyPriceCents,
        #[Autowire(env: 'int:PREMIUM_PRICE_YEARLY_CENTS')]
        private readonly int $yearlyPriceCents,
    ) {
    }

    public function isPaymentEnabled(): bool
    {
        return $this->paymentEnabled;
    }

    public function priceCents(PremiumPlan $plan): int
    {
        return match ($plan) {
            PremiumPlan::Mensuel => $this->monthlyPriceCents,
            PremiumPlan::Annuel => $this->yearlyPriceCents,
        };
    }

    /**
     * @return list<array{code: string, label: string, months: int, priceCents: int, monthlyEquivalentCents: int, savingPercent: int}>
     */
    public function plans(): array
    {
        return array_map(function (PremiumPlan $plan) {
            $price = $this->priceCents($plan);
            $fullPrice = $this->monthlyPriceCents * $plan->months();

            return [
                'code' => $plan->value,
                'label' => $plan->label(),
                'months' => $plan->months(),
                'priceCents' => $price,
                'monthlyEquivalentCents' => (int) round($price / $plan->months()),
                // Économie par rapport au paiement mois par mois
                'savingPercent' => $fullPrice > 0 ? max(0, (int) floor(100 * (1 - $price / $fullPrice))) : 0,
            ];
        }, PremiumPlan::cases());
    }

    /**
     * Crée l'abonnement « en attente » puis passe la main au prestataire de paiement.
     *
     * @return array{0: PremiumSubscription, 1: PremiumCheckout}
     *
     * @throws PaymentUnavailableException
     */
    public function subscribe(User $user, PremiumPlan $plan): array
    {
        if (!$this->paymentEnabled) {
            throw new PaymentUnavailableException('Le paiement en ligne n\'est pas encore ouvert.');
        }

        $subscription = new PremiumSubscription($user, $plan, $this->priceCents($plan));
        $checkout = $this->paymentProvider->checkout($subscription);
        $subscription->setProviderReference($checkout->providerReference);
        $this->em->persist($subscription);

        if ($checkout->activated) {
            $this->start($subscription, $user, $plan->months());
        }
        $this->em->flush();

        return [$subscription, $checkout];
    }

    /**
     * Activation manuelle (bêta, back-office ou commande) : prolonge l'accès de N mois.
     */
    public function activate(User $user, int $months): PremiumSubscription
    {
        $plan = $months >= 12 ? PremiumPlan::Annuel : PremiumPlan::Mensuel;
        $subscription = new PremiumSubscription($user, $plan, 0);
        $this->em->persist($subscription);
        $this->start($subscription, $user, $months);
        $this->em->flush();

        return $subscription;
    }

    /**
     * Retire l'accès immédiatement ; les abonnements actifs passent à « annulée ».
     */
    public function revoke(User $user): void
    {
        $now = new \DateTimeImmutable();
        foreach ($this->subscriptions->findActiveForUser($user) as $subscription) {
            $subscription->setStatus(PremiumSubscriptionStatus::Annulee)->setEndsAt($now);
        }
        $user->setPremiumUntil(null);
        $this->em->flush();
    }

    /**
     * L'accès s'ajoute à la période restante (renouvellement anticipé sans perte).
     */
    private function start(PremiumSubscription $subscription, User $user, int $months): void
    {
        $now = new \DateTimeImmutable();
        $from = $user->isPremium() ? $user->getPremiumUntil() : $now;
        $endsAt = $from->modify(sprintf('+%d months', $months));

        $subscription->setStatus(PremiumSubscriptionStatus::Active)->setStartedAt($now)->setEndsAt($endsAt);
        $user->setPremiumUntil($endsAt);
    }
}
