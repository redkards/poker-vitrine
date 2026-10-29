import { Component, DestroyRef, effect, inject, input, signal, untracked, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { apiErrorMessage } from '../../core/api/api.service';
import { hasPublicProfile } from '../../core/api/member.models';
import { SEARCH_LIMITS, SearchResults } from '../../core/api/search.models';
import { SearchService, normalizeQuery } from '../../core/api/search.service';

/** Délai de frappe avant d'interroger l'API */
export const SEARCH_DEBOUNCE_MS = 350;

/**
 * v1.1 — Recherche (/recherche?q=) dans les actualités publiées et le forum.
 */
@Component({
  selector: 'app-search',
  imports: [RouterLink, DatePipe],
  templateUrl: './search.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly search = inject(SearchService);
  private readonly router = inject(Router);

  /** Query param ?q= (lié par withComponentInputBinding) */
  readonly q = input<string>();

  protected readonly limits = SEARCH_LIMITS;
  /** Saisie en cours (non normalisée) */
  protected readonly term = signal('');
  protected readonly results = signal<SearchResults | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    // L'URL (header, historique) fait foi : on recopie ?q= dans le champ si elle diffère
    effect(() => {
      const fromUrl = normalizeQuery(this.q() ?? '');
      untracked(() => {
        if (fromUrl !== normalizeQuery(this.term())) {
          this.term.set(fromUrl);
        }
      });
    });

    toObservable(this.term)
      .pipe(
        map(normalizeQuery),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        tap((query) => this.syncUrl(query)),
        switchMap((query) => {
          this.error.set(null);
          if (query.length < SEARCH_LIMITS.min) {
            this.loading.set(false);
            return of(null);
          }
          this.loading.set(true);
          return this.search.search(query).pipe(
            catchError((err: unknown) => {
              this.error.set(apiErrorMessage(err, 'La recherche a échoué, réessayez.'));
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((results) => {
        this.loading.set(false);
        this.results.set(results);
      });
  }

  protected onInput(event: Event): void {
    this.term.set((event.target as HTMLInputElement).value);
  }

  protected hasProfile(pseudo: string): boolean {
    return hasPublicProfile(pseudo);
  }

  protected tooShort(): boolean {
    const length = normalizeQuery(this.term()).length;
    return length > 0 && length < SEARCH_LIMITS.min;
  }

  protected isEmpty(results: SearchResults): boolean {
    return results.articles.length === 0 && results.topics.length === 0;
  }

  /** Garde ?q= à jour sans empiler d'entrées dans l'historique */
  private syncUrl(query: string): void {
    if (query === normalizeQuery(this.q() ?? '')) {
      return;
    }
    void this.router.navigate([], { queryParams: { q: query || null }, replaceUrl: true });
  }
}
