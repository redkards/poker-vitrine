/** Réponse de GET /api/search?q= (v1.1) */
export interface SearchArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
}

export interface SearchTopic {
  id: number;
  title: string;
  category: { slug: string | null; name: string | null };
  author: { pseudo: string };
  lastPostAt: string | null;
}

export interface SearchResults {
  query: string;
  articles: SearchArticle[];
  topics: SearchTopic[];
}

/** Bornes imposées par l'API (SearchController) */
export const SEARCH_LIMITS = {
  min: 2,
  max: 100,
} as const;
