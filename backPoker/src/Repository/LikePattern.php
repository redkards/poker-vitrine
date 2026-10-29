<?php

namespace App\Repository;

/**
 * Motif LIKE « contient » à partir d'une saisie utilisateur : les jokers (% et _) sont neutralisés.
 * À utiliser avec ESCAPE '!' (caractère d'échappement portable MariaDB / SQLite).
 */
final class LikePattern
{
    public const ESCAPE = '!';

    public static function contains(string $term): string
    {
        return '%'.strtr($term, ['!' => '!!', '%' => '!%', '_' => '!_']).'%';
    }
}
