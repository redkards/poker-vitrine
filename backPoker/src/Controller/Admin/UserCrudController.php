<?php

namespace App\Controller\Admin;

use App\Entity\User;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

/**
 * UC12 — Gérer les utilisateurs.
 * Pas de création (inscription publique avec consentement) ni de suppression directe
 * (anonymisation RGPD au Sprint 4) : l'admin gère seulement les rôles et l'activation.
 */
#[IsGranted('ROLE_ADMIN')]
class UserCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return User::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Utilisateur')
            ->setEntityLabelInPlural('Utilisateurs')
            ->setDefaultSort(['createdAt' => 'DESC'])
            ->setSearchFields(['email', 'pseudo']);
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::DELETE)
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield TextField::new('pseudo', 'Pseudo')->setFormTypeOption('disabled', true);
        yield EmailField::new('email', 'Email')->setFormTypeOption('disabled', true);
        yield ChoiceField::new('roles', 'Rôles')
            ->setChoices([
                'Modérateur' => 'ROLE_MODERATOR',
                'Administrateur' => 'ROLE_ADMIN',
            ])
            ->allowMultipleChoices()
            ->renderExpanded()
            ->renderAsBadges();
        yield BooleanField::new('isVerified', 'Email vérifié')->renderAsSwitch(false);
        yield DateTimeField::new('premiumUntil', 'Premium jusqu\'au')
            ->setHelp('Activation manuelle (bêta). Vide = pas d\'accès Premium.');
        yield TextField::new('consentVersion', 'CGU acceptées')->hideOnForm();
        yield DateTimeField::new('createdAt', 'Inscription')->hideOnForm();
        yield DateTimeField::new('lastLoginAt', 'Dernière connexion')->hideOnForm();
    }
}
