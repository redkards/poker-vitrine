<?php

namespace App\Dto;

use App\Enum\PremiumPlan;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Corps de POST /api/premium/subscribe
 */
final class PremiumSubscribeRequest
{
    public function __construct(
        #[Assert\NotBlank(message: 'Choisissez une formule.')]
        #[Assert\Choice(callback: [PremiumPlan::class, 'values'], message: 'Formule inconnue.')]
        public readonly string $plan = '',
    ) {
    }
}
