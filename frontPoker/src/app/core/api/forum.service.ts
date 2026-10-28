import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ForumCategory, ForumCategoryPage, ForumPost, ForumSubscription, ForumTopic, ForumTopicPage } from './forum.models';

/**
 * Forum communautaire : lecture publique, publication réservée aux membres (Sprint 3).
 */
@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly api = inject(ApiService);

  getCategories(): Observable<ForumCategory[]> {
    return this.api.get<ForumCategory[]>('forum/categories');
  }

  getCategoryTopics(slug: string, page = 1): Observable<ForumCategoryPage> {
    return this.api.get<ForumCategoryPage>(`forum/categories/${encodeURIComponent(slug)}/topics`, { page });
  }

  createTopic(slug: string, title: string, content: string): Observable<ForumTopic> {
    return this.api.post<ForumTopic>(`forum/categories/${encodeURIComponent(slug)}/topics`, { title, content });
  }

  getTopic(id: number, page = 1): Observable<ForumTopicPage> {
    return this.api.get<ForumTopicPage>(`forum/topics/${id}`, { page });
  }

  reply(topicId: number, content: string): Observable<ForumPost> {
    return this.api.post<ForumPost>(`forum/topics/${topicId}/posts`, { content });
  }

  subscribe(topicId: number): Observable<ForumSubscription> {
    return this.api.post<ForumSubscription>(`forum/topics/${topicId}/subscription`);
  }

  unsubscribe(topicId: number): Observable<ForumSubscription> {
    return this.api.delete<ForumSubscription>(`forum/topics/${topicId}/subscription`);
  }
}
