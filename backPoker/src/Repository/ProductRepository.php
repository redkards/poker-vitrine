<?php

namespace App\Repository;

use App\Entity\Product;
use App\Enum\ProductCategory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    /**
     * Catalogue public : produits publiés, par catégorie puis nom.
     *
     * @return list<Product>
     */
    public function findPublished(?ProductCategory $category = null): array
    {
        $qb = $this->createQueryBuilder('p')
            ->where('p.isPublished = true')
            ->orderBy('p.category', 'ASC')
            ->addOrderBy('p.name', 'ASC');

        if ($category) {
            $qb->andWhere('p.category = :category')->setParameter('category', $category);
        }

        return $qb->getQuery()->getResult();
    }

    public function findOnePublishedBySlug(string $slug): ?Product
    {
        return $this->findOneBy(['slug' => $slug, 'isPublished' => true]);
    }

    /**
     * @param list<string> $slugs
     *
     * @return array<string, Product> indexés par slug
     */
    public function findPublishedBySlugs(array $slugs): array
    {
        if (!$slugs) {
            return [];
        }

        $products = $this->createQueryBuilder('p')
            ->where('p.isPublished = true')
            ->andWhere('p.slug IN (:slugs)')
            ->setParameter('slugs', $slugs)
            ->getQuery()
            ->getResult();

        $indexed = [];
        foreach ($products as $product) {
            $indexed[(string) $product->getSlug()] = $product;
        }

        return $indexed;
    }

    /**
     * Décrément atomique : échoue (0 ligne modifiée) si le stock ne suffit pas,
     * même si deux commandes arrivent en même temps.
     */
    public function decrementStock(Product $product, int $quantity): bool
    {
        return 1 === $this->createQueryBuilder('p')
            ->update()
            ->set('p.stock', 'p.stock - :quantity')
            ->where('p.id = :id')
            ->andWhere('p.stock >= :quantity')
            ->setParameter('quantity', $quantity)
            ->setParameter('id', $product->getId())
            ->getQuery()
            ->execute();
    }

    public function incrementStock(Product $product, int $quantity): void
    {
        $this->createQueryBuilder('p')
            ->update()
            ->set('p.stock', 'p.stock + :quantity')
            ->where('p.id = :id')
            ->setParameter('quantity', $quantity)
            ->setParameter('id', $product->getId())
            ->getQuery()
            ->execute();
    }
}
