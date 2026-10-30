<?php

namespace App\Enum;

/**
 * Formules de l'abonnement Premium (prix configurés dans .env).
 */
enum PremiumPlan: string
{
    case Mensuel = 'mensuel';
    case Annuel = 'annuel';

    public function label(): string
    {
        return match ($this) {
            self::Mensuel => 'Mensuel',
            self::Annuel => 'Annuel',
        };
    }

    public function months(): int
    {
        return match ($this) {
            self::Mensuel => 1,
            self::Annuel => 12,
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $p) => $p->value, self::cases());
    }
}
