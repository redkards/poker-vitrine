<?php

namespace App\Controller\Admin;

use App\Entity\ForumPostReport;
use App\Entity\User;
use App\Enum\ReportReason;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminRoute;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\NullFilter;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * v1.1 — File de modération : signalements des membres. Le modérateur masque le message
 * depuis « Messages du forum » si besoin, puis marque le signalement comme résolu.
 */
#[IsGranted('ROLE_MODERATOR')]
class ForumPostReportCrudController extends AbstractCrudController
{
    private const CSRF_ID = 'resolve-forum-report';

    public function __construct(private readonly UrlGeneratorInterface $urlGenerator)
    {
    }

    public static function getEntityFqcn(): string
    {
        return ForumPostReport::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Signalement')
            ->setEntityLabelInPlural('Signalements')
            ->setDefaultSort(['resolvedAt' => 'ASC', 'createdAt' => 'DESC'])
            ->setSearchFields(['comment', 'post.content', 'reporter.pseudo']);
    }

    public function configureActions(Actions $actions): Actions
    {
        $resolve = Action::new('resolve', 'Marquer résolu', 'fa fa-check')
            ->linkToUrl(fn (ForumPostReport $report) => $this->urlGenerator->generate('admin_forum_post_report_resolve', [
                'id' => $report->getId(),
                '_token' => $this->container->get('security.csrf.token_manager')->getToken(self::CSRF_ID)->getValue(),
            ]))
            ->displayIf(static fn (ForumPostReport $report) => !$report->isResolved());

        return $actions
            ->disable(Action::NEW, Action::EDIT)
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->add(Crud::PAGE_INDEX, $resolve)
            ->add(Crud::PAGE_DETAIL, $resolve);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(NullFilter::new('resolvedAt', 'État')->setChoiceLabels('À traiter', 'Résolu'))
            ->add(ChoiceFilter::new('reason', 'Motif')->setChoices(ReportReason::choices()));
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->onlyOnIndex();
        yield AssociationField::new('post', 'Message signalé');
        yield TextField::new('post.topic.title', 'Sujet')->hideOnIndex();
        yield AssociationField::new('reporter', 'Signalé par');
        yield ChoiceField::new('reason', 'Motif')->setChoices(ReportReason::choices());
        yield TextareaField::new('comment', 'Commentaire')->setMaxLength(Crud::PAGE_INDEX === $pageName ? 60 : ForumPostReport::COMMENT_MAX_LENGTH);
        yield DateTimeField::new('createdAt', 'Signalé le');
        yield DateTimeField::new('resolvedAt', 'Résolu le');
        yield AssociationField::new('resolvedBy', 'Résolu par')->hideOnIndex();
    }

    #[AdminRoute('/{id}/resolve', name: 'resolve')]
    public function resolve(#[MapEntity] ForumPostReport $report, Request $request, #[CurrentUser] User $moderator, EntityManagerInterface $em): RedirectResponse
    {
        if (!$this->isCsrfTokenValid(self::CSRF_ID, (string) $request->query->get('_token'))) {
            throw $this->createAccessDeniedException('Jeton CSRF invalide.');
        }

        if (!$report->isResolved()) {
            $report->resolve($moderator);
            $em->flush();
        }
        $this->addFlash('success', 'Signalement marqué comme résolu.');

        return $this->redirect($this->urlGenerator->generate('admin_forum_post_report_index'));
    }
}
