<?php

namespace App\Controller\Admin;

use App\Entity\Article;
use App\Entity\User;
use App\Enum\ArticleScope;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\UrlField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\DateTimeFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\TextFilter;

/**
 * UC10 — Gérer les articles
 */
#[IsGranted('ROLE_ADMIN')]
class ArticleCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Article::class;
    }

    public function createEntity(string $entityFqcn): Article
    {
        $article = new Article();
        $user = $this->getUser();
        if ($user instanceof User) {
            $article->setAuthor($user);
        }

        return $article;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Article')
            ->setEntityLabelInPlural('Articles')
            ->setDefaultSort(['publishedAt' => 'DESC', 'id' => 'DESC'])
            ->setSearchFields(['title', 'excerpt', 'category']);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(TextFilter::new('category', 'Catégorie'))
            ->add(DateTimeFilter::new('publishedAt', 'Publication'));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield TextField::new('title', 'Titre');
        yield TextField::new('slug', 'Slug')
            ->setRequired(false)
            ->setHelp("Adresse de l'article. Laissez vide pour le générer depuis le titre.")
            ->hideOnIndex();
        yield ChoiceField::new('scope', 'Portée')
            ->setChoices(['Actu France' => ArticleScope::France, 'Actu internationale' => ArticleScope::International])
            ->renderAsBadges()
            ->setHelp("Colonne de l'accueil dans laquelle l'article apparaît.");
        yield TextField::new('category', 'Catégorie')->setHelp('Ex. Stratégie, Tournois, Débutant…');
        yield TextareaField::new('excerpt', 'Chapô')->setHelp('Résumé affiché sur les cartes (400 caractères max).')->hideOnIndex();
        yield TextEditorField::new('content', 'Contenu')->hideOnIndex();
        yield UrlField::new('imageUrl', 'Image (URL)')->hideOnIndex();
        yield DateTimeField::new('publishedAt', 'Publication')
            ->setHelp('Vide = brouillon. Une date future programme la publication.');
        yield AssociationField::new('author', 'Auteur')->hideOnForm();
    }
}
