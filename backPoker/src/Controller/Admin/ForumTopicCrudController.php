<?php

namespace App\Controller\Admin;

use App\Entity\ForumTopic;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\BooleanFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\EntityFilter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * UC9 — Modérer le forum : épingler, verrouiller, renommer ou supprimer un sujet.
 */
#[IsGranted('ROLE_MODERATOR')]
class ForumTopicCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ForumTopic::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Sujet')
            ->setEntityLabelInPlural('Sujets du forum')
            ->setDefaultSort(['lastPostAt' => 'DESC'])
            ->setSearchFields(['title', 'author.pseudo']);
    }

    public function configureActions(Actions $actions): Actions
    {
        // Les sujets se créent depuis le site, par les membres
        return $actions->disable(Action::NEW);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(EntityFilter::new('category', 'Catégorie'))
            ->add(BooleanFilter::new('isPinned', 'Épinglé'))
            ->add(BooleanFilter::new('isLocked', 'Verrouillé'));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield TextField::new('title', 'Titre');
        yield AssociationField::new('category', 'Catégorie');
        yield AssociationField::new('author', 'Auteur')->hideOnForm();
        yield BooleanField::new('isPinned', 'Épinglé');
        yield BooleanField::new('isLocked', 'Verrouillé');
        yield DateTimeField::new('createdAt', 'Créé le')->hideOnForm();
        yield DateTimeField::new('lastPostAt', 'Dernier message')->hideOnForm();
    }
}
