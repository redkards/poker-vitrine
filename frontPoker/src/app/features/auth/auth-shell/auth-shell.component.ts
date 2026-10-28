import { Component, input } from '@angular/core';

/**
 * Gabarit des pages d'authentification : panneau sombre décoratif + formulaire.
 */
@Component({
  selector: 'app-auth-shell',
  template: `
    <section class="pv-container shell">
      <div class="shell__aside" aria-hidden="true">
        <span class="shell__suits">♠ ♥ ♦ ♣</span>
        <p class="shell__quote">{{ quote() }}</p>
      </div>
      <div class="shell__main">
        <span class="pv-eyebrow">{{ eyebrow() }}</span>
        <h1>{{ heading() }}</h1>
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    .shell {
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      max-width: 1040px;
      margin-top: 1rem;
      overflow: hidden;
      border-radius: var(--pv-radius-lg);
      background: var(--pv-surface);
      box-shadow: var(--pv-shadow);
    }
    .shell__aside {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 2rem;
      padding: 2.5rem;
      color: #fff;
      background: radial-gradient(120% 90% at 20% 0%, #5a0a10 0%, #1b0304 60%, #0e0e0f 100%);
    }
    .shell__suits {
      font-size: 2.2rem;
      letter-spacing: 0.35em;
      color: rgb(255 80 90 / 0.85);
      text-shadow: 0 0 24px rgb(255 30 40 / 0.5);
    }
    .shell__quote {
      margin: 0;
      font-family: var(--pv-font-title);
      font-size: clamp(1.6rem, 3vw, 2.3rem);
      font-weight: 700;
      line-height: 1.2;
    }
    .shell__main {
      padding: clamp(1.75rem, 4vw, 3.25rem);
    }
    h1 {
      margin: 0.5rem 0 1.6rem;
      font-size: clamp(2rem, 4vw, 2.7rem);
    }
    @media (max-width: 820px) {
      .shell {
        grid-template-columns: 1fr;
      }
      .shell__aside {
        padding: 1.5rem 1.75rem;
      }
      .shell__quote {
        font-size: 1.35rem;
      }
    }
  `,
})
export class AuthShellComponent {
  readonly eyebrow = input('');
  readonly heading = input('');
  readonly quote = input('Le poker se joue avec la tête, la communauté vous aide à la garder froide.');
}
