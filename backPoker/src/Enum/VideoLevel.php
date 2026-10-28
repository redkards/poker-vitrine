<?php

namespace App\Enum;

enum VideoLevel: string
{
    case Debutant = 'debutant';
    case Intermediaire = 'intermediaire';
    case Avance = 'avance';

    public function label(): string
    {
        return match ($this) {
            self::Debutant => 'Débutant',
            self::Intermediaire => 'Intermédiaire',
            self::Avance => 'Avancé',
        };
    }
}
