import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { shopGuard } from './features/shop/shop.guard';

/**
 * `title` + `data.description` (+ `data.ogType`) alimentent la meta description et l'Open Graph
 * via SeoTitleStrategy. Les pages dynamiques complètent une fois leur contenu chargé (SeoService).
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Poker Winners — La communauté poker francophone',
    data: {
      description:
        "Poker Winners, la communauté poker francophone : actualités, forum d'entraide, vidéos pédagogiques, leçons et calendrier des tournois.",
    },
  },
  {
    path: 'connexion',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Connexion — Poker Winners',
    data: { description: 'Connectez-vous à votre compte Poker Winners pour participer au forum et retrouver vos vidéos favorites.' },
  },
  {
    path: 'inscription',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Inscription — Poker Winners',
    data: { description: 'Créez gratuitement votre compte Poker Winners : échangez sur le forum, suivez des sujets et progressez au poker.' },
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent),
    title: 'Vérification de votre email — Poker Winners',
    data: { description: 'Confirmez votre adresse email pour activer votre compte Poker Winners.' },
  },
  {
    path: 'mon-espace',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    title: 'Mon espace — Poker Winners',
    data: { description: 'Gérez votre compte Poker Winners : pseudo, mot de passe, vidéos favorites et données personnelles.' },
  },
  {
    // Lien reçu par email pour confirmer la suppression du compte (RGPD)
    path: 'suppression-compte',
    loadComponent: () => import('./features/profile/account-deletion/account-deletion.component').then((m) => m.AccountDeletionComponent),
    title: 'Suppression du compte — Poker Winners',
    data: { description: 'Confirmez la suppression de votre compte Poker Winners et l’anonymisation de vos données.' },
  },
  {
    path: 'recherche',
    loadComponent: () => import('./features/search/search.component').then((m) => m.SearchComponent),
    title: 'Recherche — Poker Winners',
    data: { description: 'Recherchez dans les actualités poker et les discussions du forum Poker Winners.' },
  },
  {
    path: 'membres/:pseudo',
    loadComponent: () => import('./features/members/member-profile/member-profile.component').then((m) => m.MemberProfileComponent),
    title: 'Profil membre — Poker Winners',
    data: { description: 'Profil public d’un membre de la communauté Poker Winners.', ogType: 'profile' },
  },
  {
    path: 'actualites',
    loadComponent: () => import('./features/articles/article-list/article-list.component').then((m) => m.ArticleListComponent),
    title: 'Actualités — Poker Winners',
    data: {
      description: "Actualités du poker : stratégie, tournois live et en ligne, mental et vie de la communauté, par l'équipe Poker Winners.",
    },
  },
  {
    path: 'actualites/:slug',
    loadComponent: () => import('./features/articles/article-detail/article-detail.component').then((m) => m.ArticleDetailComponent),
    title: 'Actualité — Poker Winners',
    data: { description: 'Article de l’actualité poker sur Poker Winners.', ogType: 'article' },
  },
  {
    path: 'videos',
    loadComponent: () => import('./features/videos/video-list/video-list.component').then((m) => m.VideoListComponent),
    title: 'Vidéos pédagogiques — Poker Winners',
    data: {
      description: 'Vidéos pédagogiques de poker classées par niveau : bases, ranges, lecture du board, gestion de bankroll et tournois.',
    },
  },
  {
    path: 'premium',
    loadComponent: () => import('./features/premium/premium.component').then((m) => m.PremiumComponent),
    title: 'Premium — Poker Winners',
    data: { description: 'Abonnement Premium Poker Winners : vidéos expert, contenus avancés et nouveautés en avant-première.' },
  },
  {
    path: 'videos/:id',
    loadComponent: () => import('./features/videos/video-detail/video-detail.component').then((m) => m.VideoDetailComponent),
    title: 'Vidéo — Poker Winners',
    data: { description: 'Vidéo pédagogique de poker sur Poker Winners.', ogType: 'video.other' },
  },
  {
    path: 'lecons',
    loadComponent: () => import('./features/lessons/lesson-list/lesson-list.component').then((m) => m.LessonListComponent),
    title: 'Apprendre et se perfectionner — Poker Winners',
    data: {
      description: 'Leçons de poker interactives : mains de départ, position, cotes du pot, continuation bet et quiz pour vérifier vos acquis.',
    },
  },
  {
    path: 'lecons/:slug',
    loadComponent: () => import('./features/lessons/lesson-detail/lesson-detail.component').then((m) => m.LessonDetailComponent),
    title: 'Leçon — Poker Winners',
    data: { description: 'Leçon de poker interactive pas à pas, avec quiz final, sur Poker Winners.', ogType: 'article' },
  },
  {
    path: 'calendrier',
    loadComponent: () => import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
    title: 'Calendrier des tournois — Poker Winners',
    data: { description: 'Calendrier des tournois de poker : dates, lieux, buy-in et structures des prochains événements live.' },
  },
  {
    path: 'forum',
    loadComponent: () => import('./features/forum/forum-home/forum-home.component').then((m) => m.ForumHomeComponent),
    title: 'Forum — Poker Winners',
    data: {
      description: "Forum d'entraide poker : analyses de mains, stratégie cash game et tournois, bankroll et mental, entre joueurs francophones.",
    },
  },
  // Avant forum/:slug : « sujet » ne doit pas être pris pour une catégorie
  {
    path: 'forum/sujet/:id',
    loadComponent: () => import('./features/forum/forum-topic/forum-topic.component').then((m) => m.ForumTopicComponent),
    title: 'Sujet — Forum — Poker Winners',
    data: { description: 'Discussion du forum poker Poker Winners.', ogType: 'article' },
  },
  {
    path: 'forum/:slug',
    loadComponent: () => import('./features/forum/forum-category/forum-category.component').then((m) => m.ForumCategoryComponent),
    title: 'Forum — Poker Winners',
    data: { description: 'Les sujets de discussion de cette catégorie du forum poker Poker Winners.' },
  },
  // Pages légales
  {
    path: 'cgu',
    loadComponent: () => import('./features/legal/cgu/cgu.component').then((m) => m.CguComponent),
    title: "Conditions générales d'utilisation — Poker Winners",
    data: { description: "Conditions générales d'utilisation du site et du forum Poker Winners." },
  },
  {
    path: 'confidentialite',
    loadComponent: () => import('./features/legal/confidentialite/confidentialite.component').then((m) => m.ConfidentialiteComponent),
    title: 'Politique de confidentialité — Poker Winners',
    data: { description: 'Politique de confidentialité de Poker Winners : données collectées, durées de conservation et droits RGPD.' },
  },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./features/legal/mentions-legales/mentions-legales.component').then((m) => m.MentionsLegalesComponent),
    title: 'Mentions légales — Poker Winners',
    data: { description: 'Mentions légales du site Poker Winners : éditeur, hébergeur et contact.' },
  },
  // Boutique v2.0 : routes inactives tant que environment.shopEnabled vaut false
  {
    path: 'boutique',
    canMatch: [shopGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/shop/product-list/product-list.component').then((m) => m.ProductListComponent),
        title: 'Boutique — Poker Winners',
      },
      {
        path: 'panier',
        loadComponent: () => import('./features/shop/cart/cart.component').then((m) => m.CartComponent),
        title: 'Mon panier — Boutique — Poker Winners',
      },
      {
        path: ':slug',
        loadComponent: () => import('./features/shop/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
        title: 'Boutique — Poker Winners',
      },
    ],
  },
  {
    path: 'mon-espace/commandes',
    canMatch: [shopGuard],
    canActivate: [authGuard],
    loadComponent: () => import('./features/shop/my-orders/my-orders.component').then((m) => m.MyOrdersComponent),
    title: 'Mes commandes — Poker Winners',
  },
  {
    path: 'cgv',
    canMatch: [shopGuard],
    loadComponent: () => import('./features/legal/cgv/cgv.component').then((m) => m.CgvComponent),
    title: 'Conditions générales de vente — Poker Winners',
  },
  { path: '**', redirectTo: '' },
];
