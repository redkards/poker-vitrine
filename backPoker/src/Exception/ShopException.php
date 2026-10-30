<?php

namespace App\Exception;

use Symfony\Component\HttpFoundation\Response;

/**
 * Commande refusée pour une raison métier (message affichable au client).
 */
final class ShopException extends \DomainException
{
    private function __construct(string $message, public readonly int $statusCode)
    {
        parent::__construct($message);
    }

    public static function unknownProduct(string $slug): self
    {
        return new self(sprintf('Le produit « %s » n’est plus disponible.', $slug), Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public static function insufficientStock(string $productName, int $available): self
    {
        return new self(
            0 === $available
                ? sprintf('« %s » est en rupture de stock.', $productName)
                : sprintf('Stock insuffisant pour « %s » : %d exemplaire(s) disponible(s).', $productName, $available),
            Response::HTTP_CONFLICT,
        );
    }

    public static function invalidTransition(string $message): self
    {
        return new self($message, Response::HTTP_CONFLICT);
    }
}
