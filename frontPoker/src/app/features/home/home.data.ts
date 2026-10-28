/**
 * Données de DÉMONSTRATION de la page d'accueil.
 * Remplacées par l'API (GET /api/articles, statistiques) au Sprint 2.
 */

export interface FeaturedSlide {
  category: string;
  title: string;
  link: string;
}

export interface NewsItem {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  link: string;
}

export interface HomeStat {
  value: string;
  label: string;
}

export const FEATURED_SLIDES: FeaturedSlide[] = [
  { category: 'Stratégie', title: 'Bien jouer ses mains de départ en No-Limit Hold’em', link: '/actualites' },
  { category: 'Tournois', title: 'Le calendrier des grands festivals de l’hiver', link: '/actualites' },
  { category: 'Vidéo', title: 'Comprendre les cotes du pot en 10 minutes', link: '/videos' },
  { category: 'Communauté', title: 'Le forum d’entraide ouvre ses portes', link: '/forum' },
];

export const HOME_STATS: HomeStat[] = [
  { value: '120+', label: 'Vidéos' },
  { value: '24/7', label: 'Forum ouvert' },
  { value: '3 000+', label: 'Membres' },
];

export const LATEST_NEWS: NewsItem[] = [
  {
    category: 'Stratégie',
    title: 'Position au poker : pourquoi le bouton change tout',
    excerpt: 'Jouer en dernier, c’est jouer avec plus d’informations. Nos conseils pour exploiter la position.',
    date: '2026-10-26',
    link: '/actualites',
  },
  {
    category: 'Actualité',
    title: 'Les nouveautés des tournois live en France',
    excerpt: 'Structures, buy-ins, formats : tour d’horizon des changements de la saison.',
    date: '2026-10-22',
    link: '/actualites',
  },
  {
    category: 'Débutant',
    title: 'Les 5 erreurs les plus fréquentes des nouveaux joueurs',
    excerpt: 'Trop de mains jouées, tapis mal gérés… Apprenez à les repérer et à les corriger.',
    date: '2026-10-18',
    link: '/actualites',
  },
];
