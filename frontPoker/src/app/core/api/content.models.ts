export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export type ArticleScope = 'france' | 'international' | 'live' | 'online';

export const ARTICLE_SCOPES: { value: ArticleScope; label: string; short: string }[] = [
  { value: 'france', label: 'Actu France', short: 'FR' },
  { value: 'international', label: 'Actu internationale', short: '🌍' },
  { value: 'live', label: 'Tournois live', short: 'LIVE' },
  { value: 'online', label: 'Tournois en ligne', short: 'WEB' },
];

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  scopeValue: ArticleScope;
  scopeLabel: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: string;
  authorPseudo: string | null;
}

export interface Article extends ArticleSummary {
  content: string;
}

export type VideoLevel = 'debutant' | 'intermediaire' | 'avance';

export interface Video {
  id: number;
  title: string;
  description: string | null;
  youtubeId: string | null;
  category: string;
  levelValue: VideoLevel;
  levelLabel: string;
  publishedAt: string;
  /** Réservée aux membres Premium */
  premium: boolean;
  /** Premium sans abonnement : youtubeId vaut alors null */
  locked: boolean;
}

export interface VideoPage extends Paginated<Video> {
  filters: {
    categories: string[];
    levels: { value: VideoLevel; label: string }[];
  };
}

export interface SiteStats {
  articles: number;
  videos: number;
  members: number;
  forumPosts: number;
}

// Calendrier des tournois live ------------------------------------------------
export type TournamentZone = 'france' | 'belgique' | 'international' | 'en-ligne';

export interface Tournament {
  id: number;
  name: string;
  circuit: string | null;
  zone: TournamentZone;
  zoneLabel: string;
  country: string;
  city: string;
  venue: string | null;
  /** AAAA-MM-JJ */
  startDate: string;
  endDate: string;
  mainEventBuyIn: string | null;
  guarantee: string | null;
  url: string | null;
  status: 'confirme' | 'a-confirmer';
  note: string | null;
  sources: { name: string; url: string }[];
}

export interface TournamentList {
  items: Tournament[];
  zones: { value: TournamentZone; label: string; count: number }[];
}
