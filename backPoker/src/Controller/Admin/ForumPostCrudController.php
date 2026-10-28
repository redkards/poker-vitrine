<?php

namespace App\Controller\Admin;

use App\Entity\ForumPost;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\BooleanFilter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * UC9 — Modérer les messages : les masquer (recommandé, réversible) ou les supprimer.
 * Le contenu n'est pas modifiable : un modérateur ne réécrit pas les propos d'un membre.
 */
#[IsGranted('ROLE_MODERATOR')]
class ForumPostCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ForumPost::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Message')
            ->setEntityLabelInPlural('Messages du forum')
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setSearchFields(['content', 'author.pseudo', 'topic.title']);
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW)
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters->add(BooleanFilter::new('isModerated', 'Masqué'));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield AssociationField::new('topic', 'Sujet')->setFormTypeOption('disabled', true);
        yield AssociationField::new('author', 'Auteur')->setFormTypeOption('disabled', true);
        yield TextareaField::new('content', 'Message')
            ->setFormTypeOption('disabled', true)
            ->setMaxLength(Crud::PAGE_INDEX === $pageName ? 80 : 10000);
        yield BooleanField::new('isModerated', 'Masqué')->setHelp('Un message masqué n’est plus visible sur le site.');
        yield DateTimeField::new('createdAt', 'Publié le')->hideOnForm();
    }
}
