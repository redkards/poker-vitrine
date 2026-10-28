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
  // Contenus livrés aux sprints suivants
  ...(
    [
      ['actualites', 'Actualités', 'Sprint 2'],
      ['videos', 'Vidéos', 'Sprint 2'],
      ['forum', 'Forum', 'Sprint 3'],
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
