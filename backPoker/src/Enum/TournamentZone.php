<?php

namespace App\Enum;

/**
 * Zones du calendrier des tournois (live et grandes séries en ligne).
 */
enum TournamentZone: string
{
    case France = 'france';
    case Belgique = 'belgique';
    case International = 'international';
    case EnLigne = 'en-ligne';

    public function label(): string
    {
        return match ($this) {
            self::France => 'France',
            self::Belgique => 'Belgique',
            self::International => 'International',
            self::EnLigne => 'En ligne',
        };
    }

    /**
     * @return array<string, self>
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
