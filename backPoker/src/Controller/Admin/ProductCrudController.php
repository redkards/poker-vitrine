<?php

namespace App\Controller\Admin;

use App\Entity\Product;
use App\Enum\ProductCategory;
use App\Enum\VatRate;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\MoneyField;
use EasyCorp\Bundle\EasyAdminBundle\Field\SlugField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\UrlField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\BooleanFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Boutique (v2.0) — Catalogue : livres et accessoires.
 */
#[IsGranted('ROLE_ADMIN')]
class ProductCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Product::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Produit')
            ->setEntityLabelInPlural('Produits')
            ->setDefaultSort(['category' => 'ASC', 'name' => 'ASC'])
            ->setSearchFields(['name', 'slug', 'description']);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(ChoiceFilter::new('category', 'Catégorie')->setChoices(ProductCategory::choices()))
            ->add(BooleanFilter::new('isPublished', 'Publié'));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield TextField::new('name', 'Nom');
        yield SlugField::new('slug', 'Slug')->setTargetFieldName('name')->hideOnIndex();
        yield ChoiceField::new('category', 'Catégorie')->setChoices(ProductCategory::choices())->renderAsBadges();
        yield MoneyField::new('priceCents', 'Prix TTC')->setCurrency('EUR')->setStoredAsCents(true);
        yield ChoiceField::new('vatRate', 'TVA')
            ->setChoices(VatRate::choices())
            ->setHelp('Livres : 5,5 %. Accessoires : 20 %.');
        yield IntegerField::new('stock', 'Stock');
        yield UrlField::new('imageUrl', 'Image (URL)')->hideOnIndex()->setHelp('Photo dont vous détenez les droits.');
        yield TextareaField::new('description', 'Description')->hideOnIndex();
        yield BooleanField::new('isPublished', 'Publié');
    }
}
