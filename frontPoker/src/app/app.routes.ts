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
    // Lien reçu par email pour confirmer la suppression du compte (RGPD)
    path: 'suppression-compte',
    loadComponent: () => import('./features/profile/account-deletion/account-deletion.component').then((m) => m.AccountDeletionComponent),
    title: 'Suppression du compte — PokerVitrine',
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
    path: 'lecons',
    loadComponent: () => import('./features/lessons/lesson-list/lesson-list.component').then((m) => m.LessonListComponent),
    title: 'Apprendre et se perfectionner — PokerVitrine',
  },
  {
    path: 'lecons/:slug',
    loadComponent: () => import('./features/lessons/lesson-detail/lesson-detail.component').then((m) => m.LessonDetailComponent),
    title: 'Leçon — PokerVitrine',
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
  // Pages légales
  {
    path: 'cgu',
    loadComponent: () => import('./features/legal/cgu/cgu.component').then((m) => m.CguComponent),
    title: "Conditions générales d'utilisation — PokerVitrine",
  },
  {
    path: 'confidentialite',
    loadComponent: () => import('./features/legal/confidentialite/confidentialite.component').then((m) => m.ConfidentialiteComponent),
    title: 'Politique de confidentialité — PokerVitrine',
  },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./features/legal/mentions-legales/mentions-legales.component').then((m) => m.MentionsLegalesComponent),
    title: 'Mentions légales — PokerVitrine',
  },
  { path: '**', redirectTo: '' },
];
