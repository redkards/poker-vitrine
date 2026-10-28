import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ArticleSummary } from '../../core/api/content.models';
import { ContentService } from '../../core/api/content.service';

const AUTOPLAY_MS = 6000;
const SLIDE_COUNT = 4;
/** 2 fenêtres « Actu France » + 2 fenêtres « Actu internationale » */
const NEWS_PER_SCOPE = 2;

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

  /** Carrousel « à la une » : les derniers articles, toutes portées confondues */
  protected readonly slides = signal<ArticleSummary[]>([]);
  protected readonly newsFrance = signal<ArticleSummary[]>([]);
  protected readonly newsWorld = signal<ArticleSummary[]>([]);

  protected readonly current = signal(0);
  protected readonly slide = computed<ArticleSummary | undefined>(() => this.slides()[this.current()]);

  /** Visuel fourni par le propriétaire du projet : public/images/hero.webp */
  protected readonly heroImageFailed = signal(false);

  private paused = false;

  ngOnInit(): void {
    forkJoin({
      featured: this.content.getArticles(1, SLIDE_COUNT),
      france: this.content.getArticles(1, NEWS_PER_SCOPE, null, 'france'),
      world: this.content.getArticles(1, NEWS_PER_SCOPE, null, 'international'),
    }).subscribe({
      next: ({ featured, france, world }) => {
        this.slides.set(featured.items);
        this.newsFrance.set(france.items);
        this.newsWorld.set(world.items);
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
