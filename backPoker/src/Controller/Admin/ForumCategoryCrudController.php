<?php

namespace App\Controller\Admin;

use App\Entity\ForumCategory;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\SlugField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Structure du forum : réservée aux administrateurs.
 */
#[IsGranted('ROLE_ADMIN')]
class ForumCategoryCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ForumCategory::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Catégorie du forum')
            ->setEntityLabelInPlural('Catégories du forum')
            ->setDefaultSort(['position' => 'ASC', 'name' => 'ASC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield TextField::new('name', 'Nom');
        yield SlugField::new('slug', 'Slug')->setTargetFieldName('name')->hideOnIndex();
        yield TextField::new('description', 'Description');
        yield IntegerField::new('position', 'Ordre')->setHelp('Les plus petits nombres apparaissent en premier.');
    }
}
