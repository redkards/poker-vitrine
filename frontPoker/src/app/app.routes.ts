import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Poker Winners — La communauté poker francophone',
  },
  {
    path: 'connexion',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Connexion — Poker Winners',
  },
  {
    path: 'inscription',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Inscription — Poker Winners',
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent),
    title: 'Vérification de votre email — Poker Winners',
  },
  {
    path: 'mon-espace',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    title: 'Mon espace — Poker Winners',
  },
  {
    // Lien reçu par email pour confirmer la suppression du compte (RGPD)
    path: 'suppression-compte',
    loadComponent: () => import('./features/profile/account-deletion/account-deletion.component').then((m) => m.AccountDeletionComponent),
    title: 'Suppression du compte — Poker Winners',
  },
  {
    path: 'actualites',
    loadComponent: () => import('./features/articles/article-list/article-list.component').then((m) => m.ArticleListComponent),
    title: 'Actualités — Poker Winners',
  },
  {
    path: 'actualites/:slug',
    loadComponent: () => import('./features/articles/article-detail/article-detail.component').then((m) => m.ArticleDetailComponent),
  },
  {
    path: 'videos',
    loadComponent: () => import('./features/videos/video-list/video-list.component').then((m) => m.VideoListComponent),
    title: 'Vidéos pédagogiques — Poker Winners',
  },
  {
    path: 'videos/:id',
    loadComponent: () => import('./features/videos/video-detail/video-detail.component').then((m) => m.VideoDetailComponent),
  },
  {
    path: 'lecons',
    loadComponent: () => import('./features/lessons/lesson-list/lesson-list.component').then((m) => m.LessonListComponent),
    title: 'Apprendre et se perfectionner — Poker Winners',
  },
  {
    path: 'lecons/:slug',
    loadComponent: () => import('./features/lessons/lesson-detail/lesson-detail.component').then((m) => m.LessonDetailComponent),
    title: 'Leçon — Poker Winners',
  },
  {
    path: 'calendrier',
    loadComponent: () => import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
    title: 'Calendrier des tournois — Poker Winners',
  },
  {
    path: 'forum',
    loadComponent: () => import('./features/forum/forum-home/forum-home.component').then((m) => m.ForumHomeComponent),
    title: 'Forum — Poker Winners',
  },
  // Avant forum/:slug : « sujet » ne doit pas être pris pour une catégorie
  {
    path: 'forum/sujet/:id',
    loadComponent: () => import('./features/forum/forum-topic/forum-topic.component').then((m) => m.ForumTopicComponent),
    title: 'Sujet — Forum — Poker Winners',
  },
  {
    path: 'forum/:slug',
    loadComponent: () => import('./features/forum/forum-category/forum-category.component').then((m) => m.ForumCategoryComponent),
    title: 'Forum — Poker Winners',
  },
  // Pages légales
  {
    path: 'cgu',
    loadComponent: () => import('./features/legal/cgu/cgu.component').then((m) => m.CguComponent),
    title: "Conditions générales d'utilisation — Poker Winners",
  },
  {
    path: 'confidentialite',
    loadComponent: () => import('./features/legal/confidentialite/confidentialite.component').then((m) => m.ConfidentialiteComponent),
    title: 'Politique de confidentialité — Poker Winners',
  },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./features/legal/mentions-legales/mentions-legales.component').then((m) => m.MentionsLegalesComponent),
    title: 'Mentions légales — Poker Winners',
  },
  { path: '**', redirectTo: '' },
];
