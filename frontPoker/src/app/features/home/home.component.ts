import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ARTICLE_SCOPES, ArticleScope, ArticleSummary } from '../../core/api/content.models';
import { ContentService } from '../../core/api/content.service';

const AUTOPLAY_MS = 6000;
const SLIDE_COUNT = 4;
/** 2 fenêtres par rubrique */
const NEWS_PER_SCOPE = 2;

/** Blocs d'actualités de l'accueil : 2 colonnes chacun */
const NEWS_BLOCKS: { id: string; eyebrow: string; title: string; scopes: [ArticleScope, ArticleScope] }[] = [
  { id: 'actus', eyebrow: 'À la une', title: 'Dernières actualités', scopes: ['france', 'international'] },
  { id: 'tournois', eyebrow: 'Live et en ligne', title: 'Actu tournois', scopes: ['live', 'online'] },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, NgTemplateOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly content = inject(ContentService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loaded = signal(false);

  /** Carrousel « à la une » : les derniers articles, toutes rubriques confondues */
  protected readonly slides = signal<ArticleSummary[]>([]);
  private readonly newsByScope = signal<Partial<Record<ArticleScope, ArticleSummary[]>>>({});

  protected readonly newsBlocks = computed(() =>
    NEWS_BLOCKS.map((block) => ({
      ...block,
      columns: block.scopes.map((scope) => {
        const meta = ARTICLE_SCOPES.find((s) => s.value === scope)!;
        return { id: scope, title: meta.label, flag: meta.short, items: this.newsByScope()[scope] ?? [] };
      }),
    })),
  );

  protected readonly current = signal(0);
  protected readonly slide = computed<ArticleSummary | undefined>(() => this.slides()[this.current()]);

  /** Visuel fourni par le propriétaire du projet : public/images/hero.webp */
  protected readonly heroImageFailed = signal(false);

  private paused = false;

  ngOnInit(): void {
    forkJoin({
      featured: this.content.getArticles(1, SLIDE_COUNT),
      france: this.content.getArticles(1, NEWS_PER_SCOPE, null, 'france'),
      international: this.content.getArticles(1, NEWS_PER_SCOPE, null, 'international'),
      live: this.content.getArticles(1, NEWS_PER_SCOPE, null, 'live'),
      online: this.content.getArticles(1, NEWS_PER_SCOPE, null, 'online'),
    }).subscribe({
      next: ({ featured, ...byScope }) => {
        this.slides.set(featured.items);
        this.newsByScope.set({
          france: byScope.france.items,
          international: byScope.international.items,
          live: byScope.live.items,
          online: byScope.online.items,
        });
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
