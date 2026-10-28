import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'PokerVitrine — La communauté poker francophone',
  },
  {
    path: 'connexion',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Connexion — PokerVitrine',
  },
  {
    path: 'inscription',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Inscription — PokerVitrine',
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent),
    title: 'Vérification de votre email — PokerVitrine',
  },
  {
    path: 'mon-espace',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    title: 'Mon espace — PokerVitrine',
  },
  {
    path: 'actualites',
    loadComponent: () => import('./features/articles/article-list/article-list.component').then((m) => m.ArticleListComponent),
    title: 'Actualités — PokerVitrine',
  },
  {
    path: 'actualites/:slug',
    loadComponent: () => import('./features/articles/article-detail/article-detail.component').then((m) => m.ArticleDetailComponent),
  },
  {
    path: 'videos',
    loadComponent: () => import('./features/videos/video-list/video-list.component').then((m) => m.VideoListComponent),
    title: 'Vidéos pédagogiques — PokerVitrine',
  },
  {
    path: 'videos/:id',
    loadComponent: () => import('./features/videos/video-detail/video-detail.component').then((m) => m.VideoDetailComponent),
  },
  {
    path: 'forum',
    loadComponent: () => import('./features/forum/forum-home/forum-home.component').then((m) => m.ForumHomeComponent),
    title: 'Forum — PokerVitrine',
  },
  // Avant forum/:slug : « sujet » ne doit pas être pris pour une catégorie
  {
    path: 'forum/sujet/:id',
    loadComponent: () => import('./features/forum/forum-topic/forum-topic.component').then((m) => m.ForumTopicComponent),
    title: 'Sujet — Forum — PokerVitrine',
  },
  {
    path: 'forum/:slug',
    loadComponent: () => import('./features/forum/forum-category/forum-category.component').then((m) => m.ForumCategoryComponent),
    title: 'Forum — PokerVitrine',
  },
  // Contenus livrés aux sprints suivants
  ...(
    [
      ['cgu', "Conditions générales d'utilisation", 'Sprint 4'],
      ['confidentialite', 'Politique de confidentialité', 'Sprint 4'],
      ['mentions-legales', 'Mentions légales', 'Sprint 4'],
    ] as const
  ).map(([path, heading, sprint]) => ({
    path,
    loadComponent: () => import('./shared/components/coming-soon/coming-soon.component').then((m) => m.ComingSoonComponent),
    data: { heading, sprint },
    title: `${heading} — PokerVitrine`,
  })),
  { path: '**', redirectTo: '' },
];
