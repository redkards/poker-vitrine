<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Corps de POST /api/shop/orders.
 * Seuls les slugs et les quantités sont lus : le prix et la TVA sont toujours ceux du catalogue.
 */
final class OrderRequest
{
    public const MAX_QUANTITY = 10;
    public const COUNTRIES = ['FR', 'BE', 'LU', 'MC'];

    /**
     * @param list<array{slug?: mixed, quantity?: mixed}> $items
     */
    public function __construct(
        #[Assert\Count(min: 1, max: 20, minMessage: 'Votre panier est vide.', maxMessage: 'Votre panier contient trop d\'articles différents.')]
        #[Assert\All([
            new Assert\Collection(
                fields: [
                    'slug' => [new Assert\NotBlank(), new Assert\Type('string'), new Assert\Length(max: 160)],
                    'quantity' => [new Assert\NotNull(), new Assert\Type('integer'), new Assert\Range(min: 1, max: self::MAX_QUANTITY, notInRangeMessage: 'La quantité doit être comprise entre {{ min }} et {{ max }}.')],
                ],
                allowExtraFields: true,
            ),
        ])]
        public readonly array $items = [],

        #[Assert\NotBlank(message: 'Le nom du destinataire est obligatoire.')]
        #[Assert\Length(max: 120)]
        public readonly string $fullName = '',

        #[Assert\NotBlank(message: 'L\'adresse est obligatoire.')]
        #[Assert\Length(max: 180)]
        public readonly string $addressLine1 = '',

        #[Assert\Length(max: 180)]
        public readonly ?string $addressLine2 = null,

        #[Assert\NotBlank(message: 'Le code postal est obligatoire.')]
        #[Assert\Regex(pattern: '/^[0-9A-Za-z \-]{4,10}$/', message: 'Code postal invalide.')]
        public readonly string $postalCode = '',

        #[Assert\NotBlank(message: 'La ville est obligatoire.')]
        #[Assert\Length(max: 120)]
        public readonly string $city = '',

        #[Assert\Choice(choices: self::COUNTRIES, message: 'Livraison possible en France, Belgique, Luxembourg et Monaco uniquement.')]
        public readonly string $country = 'FR',

        #[Assert\Length(max: 30)]
        #[Assert\Regex(pattern: '/^\+?[0-9 .\-()]{6,30}$/', message: 'Numéro de téléphone invalide.')]
        public readonly ?string $phone = null,

        #[Assert\IsTrue(message: 'Vous devez accepter les conditions générales de vente.')]
        public readonly bool $acceptCgv = false,
    ) {
    }

    /**
     * Quantités par slug, doublons fusionnés.
     *
     * @return array<string, int>
     */
    public function quantitiesBySlug(): array
    {
        $quantities = [];
        foreach ($this->items as $item) {
            $slug = (string) $item['slug'];
            $quantities[$slug] = ($quantities[$slug] ?? 0) + (int) $item['quantity'];
        }

        return $quantities;
    }
}
