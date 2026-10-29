import { Component, computed, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Lecteur YouTube « au clic » (RGPD) : aucune connexion à YouTube tant que le visiteur
 * n'a pas lancé la vidéo, puis lecture via youtube-nocookie.com.
 */
@Component({
  selector: 'app-youtube-player',
  template: `
    <div class="player">
      @if (playing() && embedUrl(); as url) {
        <iframe
          [src]="url"
          [title]="title()"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      } @else {
        <button type="button" class="facade" (click)="playing.set(true)" [attr.aria-label]="'Lire la vidéo : ' + title()">
          <span class="facade__spade" aria-hidden="true">♠</span>
          <span class="facade__play" aria-hidden="true">▶</span>
          <span class="facade__title">{{ title() }}</span>
          <span class="facade__notice">
            En lançant la vidéo, vous acceptez son chargement depuis YouTube (mode confidentialité renforcée).
          </span>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    .player {
      position: relative;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      border-radius: var(--pv-radius);
      background: var(--pv-dark);
    }
    iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
    .facade {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      align-content: center;
      gap: 0.9rem;
      width: 100%;
      padding: 1.5rem;
      border: 0;
      background: radial-gradient(110% 90% at 50% 0%, #5a0a10 0%, #1b0304 60%, #0e0e0f 100%);
      color: #fff;
      font-family: var(--pv-font-body);
      text-align: center;
      cursor: pointer;
    }
    .facade__spade {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: clamp(8rem, 30vw, 16rem);
      color: rgb(255 255 255 / 0.04);
    }
    .facade__play {
      position: relative;
      display: grid;
      place-items: center;
      width: 76px;
      height: 76px;
      padding-left: 6px;
      border-radius: 50%;
      background: var(--pv-red);
      font-size: 1.8rem;
      box-shadow: 0 12px 30px -10px rgb(179 18 27 / 0.9);
      transition: transform 0.18s;
    }
    .facade:hover .facade__play {
      transform: scale(1.06);
    }
    .facade__title {
      position: relative;
      max-width: 36ch;
      font-family: var(--pv-font-title);
      font-size: clamp(1.1rem, 2.4vw, 1.6rem);
      font-weight: 700;
    }
    .facade__notice {
      position: relative;
      max-width: 52ch;
      color: #c4c6cb;
      font-size: 0.8rem;
    }
  `,
})
export class YoutubePlayerComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly videoId = input.required<string | null>();
  readonly title = input('');

  protected readonly playing = signal(false);

  protected readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const id = this.videoId();
    // L'id vient de l'API, mais on le revalide avant de le faire confiance
    if (!id || !/^[\w-]{11}$/.test(id)) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`);
  });
}
