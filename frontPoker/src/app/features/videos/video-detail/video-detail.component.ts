import { Component, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SeoService } from '../../../core/seo/seo.service';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/api/api.service';
import { Video } from '../../../core/api/content.models';
import { ContentService } from '../../../core/api/content.service';
import { AccountService } from '../../../core/api/account.service';
import { AuthService } from '../../../core/auth/auth.service';
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
          @if (v.locked) {
            <div class="locked" role="note">
              <span class="locked__icon" aria-hidden="true">🔒</span>
              <h2>Vidéo réservée aux membres Premium</h2>
              <p>Cette vidéo de niveau {{ v.levelLabel.toLowerCase() }} fait partie des contenus Premium : vidéos expert, analyses de mains avancées et nouveautés en avant-première.</p>
              <a routerLink="/premium" class="pv-btn pv-btn--primary">Débloquer avec Premium <span class="pv-arrow" aria-hidden="true">→</span></a>
            </div>
          } @else {
            <app-youtube-player [videoId]="v.youtubeId" [title]="v.title" />
          }
          <div class="video__info">
            <div class="video__tags">
              <a class="badge" [attr.data-level]="v.levelValue" routerLink="/videos" [queryParams]="{ niveau: v.levelValue }">{{ v.levelLabel }}</a>
              @if (v.premium) {
                <span class="premium-badge">Premium</span>
              }
              <span class="video__cat">{{ v.category }}</span>
              <time [attr.datetime]="v.publishedAt">{{ v.publishedAt | date: 'd MMMM y' }}</time>
            </div>
            <h1>{{ v.title }}</h1>
            @if (v.description) {
              <p>{{ v.description }}</p>
            }
            @if (auth.isLoggedIn()) {
              <button
                type="button"
                class="pv-btn fav"
                [class.fav--on]="isFavorite()"
                [attr.aria-pressed]="isFavorite()"
                (click)="toggleFavorite(v.id)"
              >
                <span aria-hidden="true">{{ isFavorite() ? '♥' : '♡' }}</span>
                {{ isFavorite() ? 'Dans mes favoris' : 'Ajouter à mes favoris' }}
              </button>
            } @else {
              <p class="video__hint"><a routerLink="/connexion">Connectez-vous</a> pour enregistrer cette vidéo dans vos favoris.</p>
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
    .locked {
      display: grid;
      justify-items: center;
      gap: 0.8rem;
      padding: clamp(2rem, 6vw, 4rem) clamp(1.25rem, 4vw, 3rem);
      text-align: center;
      color: #fff;
      background:
        radial-gradient(circle at 80% 20%, rgb(179 18 27 / 0.45), transparent 45%),
        radial-gradient(90% 120% at 30% 0%, #3d0a0e 0%, var(--pv-dark-2) 75%);
    }
    .locked h2 {
      margin: 0;
      color: #fff;
      font-size: clamp(1.3rem, 3vw, 1.8rem);
    }
    .locked p {
      max-width: 36rem;
      margin: 0;
      color: rgb(255 255 255 / 0.8);
    }
    .locked__icon {
      font-size: 2.4rem;
    }
    .premium-badge {
      padding: 0.18rem 0.6rem;
      border-radius: 999px;
      background: linear-gradient(135deg, #f5c451, #d99a1e);
      color: #3a2500;
      font-weight: 700;
      font-size: 0.72rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .loading {
      margin-top: 2rem;
      color: var(--pv-muted);
    }
    .fav {
      justify-self: start;
      border-color: var(--pv-line);
      background: var(--pv-card);
      color: var(--pv-ink);
    }
    .fav span {
      color: var(--pv-red);
      font-size: 1.2rem;
    }
    .fav--on {
      border-color: var(--pv-red);
      background: var(--pv-red-soft);
    }
    .video__info .video__hint {
      color: var(--pv-muted);
      font-size: 0.9rem;
    }
  `,
})
export class VideoDetailComponent {
  private readonly content = inject(ContentService);
  private readonly seo = inject(SeoService);

  readonly id = input.required<string>();

  protected readonly auth = inject(AuthService);
  private readonly account = inject(AccountService);

  protected readonly video = signal<Video | null>(null);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly isFavorite = signal(false);

  protected toggleFavorite(videoId: number): void {
    const next = !this.isFavorite();
    this.isFavorite.set(next);
    this.account.setFavorite(videoId, next).subscribe({
      next: (res) => this.isFavorite.set(res.isFavorite),
      error: () => this.isFavorite.set(!next),
    });
  }

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
        if (this.auth.isLoggedIn()) {
          this.account.getFavorites().subscribe((list) => this.isFavorite.set(list.some((v) => v.id === video.id)));
        }
        this.seo.update({
          title: `${video.title} — Vidéos Poker Winners`,
          description: video.description || `Vidéo pédagogique de poker : ${video.title}.`,
          type: 'video.other',
        });
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
