<?php

namespace App\Controller\Admin;

use App\Entity\Tournament;
use App\Enum\TournamentZone;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\UrlField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Calendrier des tournois live : réservé aux administrateurs.
 */
#[IsGranted('ROLE_ADMIN')]
class TournamentCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Tournament::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Tournoi')
            ->setEntityLabelInPlural('Calendrier des tournois')
            ->setDefaultSort(['startDate' => 'ASC'])
            ->setSearchFields(['name', 'circuit', 'city', 'venue']);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters->add(ChoiceFilter::new('zone', 'Zone')->setChoices(TournamentZone::choices()));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield TextField::new('name', 'Nom');
        yield TextField::new('circuit', 'Circuit')->hideOnIndex();
        yield ChoiceField::new('zone', 'Zone')->setChoices(TournamentZone::choices())->renderAsBadges();
        yield TextField::new('city', 'Ville');
        yield TextField::new('country', 'Pays')->hideOnIndex();
        yield TextField::new('venue', 'Lieu')->hideOnIndex();
        yield DateField::new('startDate', 'Début');
        yield DateField::new('endDate', 'Fin');
        yield TextField::new('mainEventBuyIn', 'Buy-in Main Event')->hideOnIndex();
        yield TextField::new('guarantee', 'Garantie')->hideOnIndex();
        yield UrlField::new('url', 'Site officiel')->hideOnIndex();
        yield ChoiceField::new('status', 'Statut')->setChoices(['Confirmé' => Tournament::STATUS_CONFIRMED, 'À confirmer' => Tournament::STATUS_TO_CONFIRM]);
        yield TextareaField::new('note', 'Note')->hideOnIndex();
        yield BooleanField::new('isPublished', 'Publié');
    }
}
