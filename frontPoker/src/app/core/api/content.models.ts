export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  category: string | null;
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
}
