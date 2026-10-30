<?php

namespace App\Controller\Admin;

use App\Entity\PremiumSubscription;
use App\Enum\PremiumSubscriptionStatus;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Abonnements Premium : consultation seule (activation manuelle via la fiche utilisateur
 * ou `php bin/console app:user:premium`).
 */
#[IsGranted('ROLE_ADMIN')]
class PremiumSubscriptionCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return PremiumSubscription::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Abonnement Premium')
            ->setEntityLabelInPlural('Abonnements Premium')
            ->setDefaultSort(['createdAt' => 'DESC']);
    }

    public function configureActions(Actions $actions): Actions
    {
        return $actions
            ->disable(Action::NEW, Action::EDIT, Action::DELETE)
            ->add(Crud::PAGE_INDEX, Action::DETAIL);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters->add(ChoiceFilter::new('status', 'Statut')->setChoices(self::statusChoices()));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id');
        yield TextField::new('userLabel', 'Membre');
        yield TextField::new('planLabel', 'Formule');
        yield ChoiceField::new('status', 'Statut')->setChoices(self::statusChoices())->renderAsBadges([
            PremiumSubscriptionStatus::Active->value => 'success',
            PremiumSubscriptionStatus::EnAttente->value => 'warning',
            PremiumSubscriptionStatus::Annulee->value => 'secondary',
            PremiumSubscriptionStatus::Expiree->value => 'secondary',
        ]);
        yield IntegerField::new('priceCents', 'Prix TTC (centimes)');
        yield DateTimeField::new('startedAt', 'Début');
        yield DateTimeField::new('endsAt', 'Fin');
        yield TextField::new('providerReference', 'Référence paiement')->hideOnIndex();
        yield DateTimeField::new('createdAt', 'Créé le');
    }

    /**
     * @return array<string, PremiumSubscriptionStatus>
     */
    private static function statusChoices(): array
    {
        $choices = [];
        foreach (PremiumSubscriptionStatus::cases() as $status) {
            $choices[$status->label()] = $status;
        }

        return $choices;
    }
}
