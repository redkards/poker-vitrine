<?php

namespace App\Enum;

/**
 * Motif d'un signalement de message du forum.
 */
enum ReportReason: string
{
    case Spam = 'spam';
    case Insult = 'insulte';
    case OffTopic = 'hors_sujet';
    case Other = 'autre';

    public function label(): string
    {
        return match ($this) {
            self::Spam => 'Spam / publicité',
            self::Insult => 'Insulte / propos irrespectueux',
            self::OffTopic => 'Hors sujet',
            self::Other => 'Autre',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $r) => $r->value, self::cases());
    }

    /**
     * @return array<string, self> libellé => valeur (choix du back-office)
     */
    public static function choices(): array
    {
        $choices = [];
        foreach (self::cases() as $case) {
            $choices[$case->label()] = $case;
        }

        return $choices;
    }
}
