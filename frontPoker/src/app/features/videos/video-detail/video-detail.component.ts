import { Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/api/api.service';
import { Video } from '../../../core/api/content.models';
import { ContentService } from '../../../core/api/content.service';
import { YoutubePlayerComponent } from '../../../shared/components/youtube-player/youtube-player.component';

/**
 * Détail d'une vidéo : /videos/:id
 */
@Component({
  selector: 'app-video-detail',
  imports: [RouterLink, DatePipe, YoutubePlayerComponent],
  template: `
    <div class="pv-container wrap">
      <a routerLink="/videos" class="back-link">← Toutes les vidéos</a>

      @if (video(); as v) {
        <article class="video">
          <app-youtube-player [videoId]="v.youtubeId" [title]="v.title" />
          <div class="video__info">
            <div class="video__tags">
              <a class="badge" [attr.data-level]="v.levelValue" routerLink="/videos" [queryParams]="{ niveau: v.levelValue }">{{ v.levelLabel }}</a>
              <span class="video__cat">{{ v.category }}</span>
              <time [attr.datetime]="v.publishedAt">{{ v.publishedAt | date: 'd MMMM y' }}</time>
            </div>
            <h1>{{ v.title }}</h1>
            @if (v.description) {
              <p>{{ v.description }}</p>
            }
          </div>
        </article>
      } @else if (notFound()) {
        <div class="pv-alert pv-alert--info">Cette vidéo n'existe pas ou n'est plus en ligne.</div>
      } @else if (error()) {
        <div class="pv-alert pv-alert--error" role="alert">{{ error() }}</div>
      } @else {
        <p class="loading" role="status">Chargement de la vidéo…</p>
      }
    </div>
  `,
  styles: `
    .wrap {
      margin-top: 1rem;
    }
    .video {
      max-width: 960px;
      margin: 1.5rem auto 0;
      overflow: hidden;
      border-radius: var(--pv-radius-lg);
      background: var(--pv-card);
      box-shadow: var(--pv-shadow);
    }
    .video__info {
      display: grid;
      gap: 0.8rem;
      padding: clamp(1.25rem, 3vw, 2.25rem);
    }
    .video__info h1 {
      font-size: clamp(1.7rem, 3.6vw, 2.5rem);
    }
    .video__info p {
      margin: 0;
      color: var(--pv-ink-soft);
    }
    .video__tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      color: var(--pv-muted);
      font-size: 0.86rem;
    }
    .video__tags .badge {
      text-decoration: none;
    }
    .video__cat {
      font-weight: 600;
      color: var(--pv-ink-soft);
    }
    .loading {
      margin-top: 2rem;
      color: var(--pv-muted);
    }
  `,
})
export class VideoDetailComponent {
  private readonly content = inject(ContentService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly id = input.required<string>();

  protected readonly video = signal<Video | null>(null);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => this.load(Number(this.id())));
  }

  private load(id: number): void {
    this.video.set(null);
    this.notFound.set(false);
    this.error.set(null);

    if (!Number.isInteger(id) || id < 1) {
      this.notFound.set(true);
      return;
    }

    this.content.getVideo(id).subscribe({
      next: (video) => {
        this.video.set(video);
        this.title.setTitle(`${video.title} — Vidéos PokerVitrine`);
        if (video.description) {
          this.meta.updateTag({ name: 'description', content: video.description });
        }
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.notFound.set(true);
          return;
        }
        this.error.set(apiErrorMessage(err, 'Impossible de charger la vidéo.'));
      },
    });
  }
}
