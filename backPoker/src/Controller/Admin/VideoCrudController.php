<?php

namespace App\Controller\Admin;

use App\Entity\Video;
use App\Enum\VideoLevel;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\UrlField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\TextFilter;

/**
 * UC11 — Gérer les vidéos
 */
#[IsGranted('ROLE_ADMIN')]
class VideoCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Video::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Vidéo')
            ->setEntityLabelInPlural('Vidéos')
            ->setDefaultSort(['publishedAt' => 'DESC', 'id' => 'DESC'])
            ->setSearchFields(['title', 'description', 'category']);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(TextFilter::new('category', 'Catégorie'))
            ->add(ChoiceFilter::new('level', 'Niveau')->setChoices(self::levelChoices()));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield TextField::new('title', 'Titre');
        yield UrlField::new('youtubeUrl', 'URL YouTube')->setHelp('youtube.com/watch?v=… ou youtu.be/…');
        yield TextField::new('category', 'Catégorie')->setHelp('Ex. Cash game, Tournoi, Mental…');
        yield ChoiceField::new('level', 'Niveau')->setChoices(self::levelChoices())->renderAsBadges();
        yield TextareaField::new('description', 'Description')->hideOnIndex();
        yield DateTimeField::new('publishedAt', 'Publication')->setHelp('Vide = brouillon.');
    }

    /**
     * @return array<string, VideoLevel>
     */
    private static function levelChoices(): array
    {
        $choices = [];
        foreach (VideoLevel::cases() as $level) {
            $choices[$level->label()] = $level;
        }

        return $choices;
    }
}
