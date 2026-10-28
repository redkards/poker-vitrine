<?php

namespace App\Controller\Admin;

use App\Repository\ArticleRepository;
use App\Repository\UserRepository;
use App\Repository\VideoRepository;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class DashboardController extends AbstractDashboardController
{
    public function __construct(
        private readonly ArticleRepository $articles,
        private readonly VideoRepository $videos,
        private readonly UserRepository $users,
        #[Autowire(env: 'FRONTEND_URL')]
        private readonly string $frontendUrl,
    ) {
    }

    public function index(): Response
    {
        return $this->render('admin/dashboard.html.twig', [
            'stats' => [
                'Articles publiés' => $this->articles->countPublished(),
                'Articles au total' => $this->articles->count(),
                'Vidéos publiées' => $this->videos->countPublished(),
                'Membres vérifiés' => $this->users->count(['isVerified' => true]),
            ],
        ]);
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('♠ PokerVitrine')
            ->setLocales(['fr'])
            ->setFaviconPath('favicon.ico');
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Tableau de bord', 'fa fa-gauge');

        yield MenuItem::section('Contenu');
        yield MenuItem::linkTo(ArticleCrudController::class, 'Articles', 'fa fa-newspaper');
        yield MenuItem::linkTo(VideoCrudController::class, 'Vidéos', 'fa fa-circle-play');

        yield MenuItem::section('Communauté');
        yield MenuItem::linkTo(UserCrudController::class, 'Utilisateurs', 'fa fa-users');

        yield MenuItem::section();
        yield MenuItem::linkToUrl('Voir le site', 'fa fa-arrow-up-right-from-square', $this->frontendUrl);
        yield MenuItem::linkToLogout('Déconnexion', 'fa fa-right-from-bracket');
    }
}
