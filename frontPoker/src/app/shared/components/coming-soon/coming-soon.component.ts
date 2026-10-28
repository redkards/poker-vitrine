import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Page provisoire des rubriques livrées aux sprints suivants.
 */
@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink],
  template: `
    <section class="pv-container soon">
      <span class="pv-eyebrow">Bientôt disponible</span>
      <h1>{{ heading() }}</h1>
      <p>Cette rubrique est en cours de construction et arrivera au {{ sprint() }}.</p>
      <a routerLink="/" class="pv-btn pv-btn--primary">Retour à l'accueil <span class="pv-arrow" aria-hidden="true">→</span></a>
    </section>
  `,
  styles: `
    .soon {
      display: grid;
      justify-items: start;
      gap: 1rem;
      margin-top: 2rem;
      padding: clamp(2rem, 6vw, 4.5rem);
      border-radius: var(--pv-radius-lg);
      background: var(--pv-surface);
      box-shadow: var(--pv-shadow);
    }
    h1 {
      font-size: clamp(2.2rem, 5vw, 3.6rem);
    }
    p {
      margin: 0 0 0.5rem;
      color: var(--pv-muted);
    }
  `,
})
export class ComingSoonComponent {
  readonly heading = input('');
  readonly sprint = input('');
}
