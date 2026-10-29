import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SearchResults } from './search.models';

/**
 * v1.1 — Recherche publique dans les actualités et le forum.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly api = inject(ApiService);

  /** Espaces normalisés comme côté serveur ; la longueur (2–100) est vérifiée par l'appelant */
  search(query: string): Observable<SearchResults> {
    return this.api.get<SearchResults>('search', { q: normalizeQuery(query) });
  }
}

/** Supprime les espaces superflus (même règle que l'API) */
export function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, ' ').trim();
}
