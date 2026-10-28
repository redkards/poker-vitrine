import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ArticleSummary, SiteStats } from '../../core/api/content.models';
import { ContentService } from '../../core/api/content.service';

const AUTOPLAY_MS = 6000;
const SLIDE_COUNT = 4;
const NEWS_COUNT = 3;

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly content = inject(ContentService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly articles = signal<ArticleSummary[]>([]);
  private readonly siteStats = signal<SiteStats | null>(null);
  protected readonly loaded = signal(false);

  /** Carrousel « à la une » : les derniers articles */
  protected readonly slides = computed(() => this.articles().slice(0, SLIDE_COUNT));
  /** Section actualités : les suivants, ou les derniers s'il y en a peu */
  protected readonly news = computed(() => {
    const all = this.articles();
    return all.length > SLIDE_COUNT ? all.slice(SLIDE_COUNT, SLIDE_COUNT + NEWS_COUNT) : all.slice(0, NEWS_COUNT);
  });

  protected readonly stats = computed(() => {
    const s = this.siteStats();
    const value = (n: number | undefined) => (n === undefined ? '—' : n.toLocaleString('fr-FR'));
    return [
      { value: value(s?.videos), label: 'Vidéos' },
      { value: value(s?.articles), label: 'Articles' },
      { value: value(s?.members), label: 'Membres' },
    ];
  });

  protected readonly current = signal(0);
  protected readonly slide = computed<ArticleSummary | undefined>(() => this.slides()[this.current()]);

  /** Visuel fourni par le propriétaire du projet : public/images/hero.webp */
  protected readonly heroImageFailed = signal(false);

  private paused = false;

  ngOnInit(): void {
    forkJoin({
      articles: this.content.getArticles(1, SLIDE_COUNT + NEWS_COUNT),
      stats: this.content.getStats(),
    }).subscribe({
      next: ({ articles, stats }) => {
        this.articles.set(articles.items);
        this.siteStats.set(stats);
        this.loaded.set(true);
      },
      // L'accueil reste utilisable sans l'API : on masque simplement les contenus dynamiques
      error: () => this.loaded.set(true),
    });

    const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }
    const timer = setInterval(() => !this.paused && this.next(), AUTOPLAY_MS);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected next(): void {
    const count = this.slides().length;
    if (count) this.current.update((i) => (i + 1) % count);
  }

  protected prev(): void {
    const count = this.slides().length;
    if (count) this.current.update((i) => (i - 1 + count) % count);
  }

  protected goTo(index: number): void {
    this.current.set(index);
  }

  protected setPaused(paused: boolean): void {
    this.paused = paused;
  }

  protected pad(n: number): string {
    return String(n + 1).padStart(2, '0');
  }
}
