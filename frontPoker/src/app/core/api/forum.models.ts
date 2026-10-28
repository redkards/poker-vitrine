import { Paginated } from './content.models';

export type ForumRole = 'Administrateur' | 'Modérateur';

/** Identité publique d'un auteur (jamais l'email) */
export interface ForumAuthor {
  pseudo: string;
  role: ForumRole | null;
}

export interface ForumCategoryRef {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface ForumCategory extends ForumCategoryRef {
  topicCount: number;
  postCount: number;
  lastPostAt: string | null;
}

export interface ForumTopic {
  id: number;
  title: string;
  author: ForumAuthor;
  createdAt: string;
  lastPostAt: string | null;
  isPinned: boolean;
  isLocked: boolean;
}

export interface ForumTopicSummary extends ForumTopic {
  replyCount: number;
}

export interface ForumTopicDetail extends ForumTopic {
  category: ForumCategoryRef;
  isSubscribed: boolean;
}

/** Message du forum : texte brut, null si masqué par la modération */
export interface ForumPost {
  id: number;
  author: ForumAuthor;
  content: string | null;
  isModerated: boolean;
  createdAt: string;
}

export interface ForumCategoryPage extends Paginated<ForumTopicSummary> {
  category: ForumCategoryRef;
}

export interface ForumTopicPage extends Paginated<ForumPost> {
  topic: ForumTopicDetail;
}

export interface ForumSubscription {
  isSubscribed: boolean;
}

/** Limites de saisie (alignées sur les contraintes Symfony) */
export const FORUM_LIMITS = {
  titleMin: 5,
  titleMax: 150,
  contentMin: 2,
  contentMax: 10000,
} as const;
