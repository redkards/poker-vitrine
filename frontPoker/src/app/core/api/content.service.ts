import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Article, ArticleSummary, Paginated, SiteStats, Video, VideoLevel, VideoPage } from './content.models';

export interface VideoQuery {
  page?: number;
  limit?: number;
  level?: VideoLevel | null;
  category?: string | null;
}

/**
 * Contenu public : actualités, vidéos, chiffres clés (Sprint 2).
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly api = inject(ApiService);

  getArticles(page = 1, limit = 9, category?: string | null): Observable<Paginated<ArticleSummary>> {
    return this.api.get<Paginated<ArticleSummary>>('articles', compact({ page, limit, category }));
  }

  getArticle(slug: string): Observable<Article> {
    return this.api.get<Article>(`articles/${encodeURIComponent(slug)}`);
  }

  getVideos(query: VideoQuery = {}): Observable<VideoPage> {
    return this.api.get<VideoPage>('videos', compact({ page: 1, limit: 12, ...query }));
  }

  getVideo(id: number): Observable<Video> {
    return this.api.get<Video>(`videos/${id}`);
  }

  getStats(): Observable<SiteStats> {
    return this.api.get<SiteStats>('stats');
  }
}

/** Retire les paramètres vides de la query string */
function compact(params: Record<string, string | number | null | undefined>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string | number] => entry[1] !== null && entry[1] !== undefined && entry[1] !== ''),
  );
}
