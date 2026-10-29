import { Component, computed, input, linkedSignal, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BlindLevel } from '../lessons.data';
import { StackGaugeComponent } from './stack-gauge.component';

/**
 * Structure de blindes : on avance de niveau et on voit le tapis fondre en grosses blindes.
 */
@Component({
  selector: 'app-blind-levels',
  imports: [DecimalPipe, StackGaugeComponent],
  template: `
    <div class="wrap">
      <table class="levels">
        <caption class="pv-sr-only">Niveaux de blindes et valeur d'un tapis de {{ stack() | number: '1.0-0' }} jetons</caption>
        <thead>
          <tr><th scope="col">Niveau</th><th scope="col">Blindes</th><th scope="col">Ante</th><th scope="col">Tapis en BB</th></tr>
        </thead>
        <tbody>
          @for (l of levels(); track $index) {
            <tr [class.is-current]="$index === current()" [attr.aria-current]="$index === current() ? 'step' : null">
              <th scope="row">{{ $index + 1 }}</th>
              <td>{{ l.sb | number: '1.0-0' }} / {{ l.bb | number: '1.0-0' }}</td>
              <td>{{ l.ante ? (l.ante | number: '1.0-0') : '—' }}</td>
              <td>{{ stack() / l.bb | number: '1.0-1' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    <p class="hint">Tapis fixe de {{ stack() | number: '1.0-0' }} jetons, sans jouer une seule main.</p>
    <app-stack-gauge [bb]="bbNow()" [interactive]="false" />
    <div class="actions">
      <button type="button" class="pv-btn pv-btn--outline" (click)="prev()" [disabled]="current() === 0">Niveau précédent</button>
      <button type="button" class="pv-btn pv-btn--primary" (click)="next()" [disabled]="current() === levels().length - 1">Niveau suivant</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host { display: grid; gap: 0.9rem; }
    .wrap { overflow-x: auto; }
    .levels { width: 100%; border-collapse: collapse; font-size: 0.9rem; background: var(--pv-card); border-radius: var(--pv-radius-sm); overflow: hidden; }
    th, td { padding: 0.45rem 0.7rem; border-bottom: 1px solid var(--pv-line); text-align: left; }
    thead th { color: var(--pv-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    tr.is-current { background: var(--pv-red-soft); font-weight: 700; }
    tr.is-current th { color: var(--pv-red); }
    .hint { margin: 0; color: var(--pv-muted); font-size: 0.85rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.6rem; }
  `,
})
export class BlindLevelsComponent {
  readonly stack = input.required<number>();
  readonly levels = input.required<BlindLevel[]>();

  protected readonly current = linkedSignal(() => (this.levels(), 0));
  protected readonly bbNow = computed(() => Math.round((this.stack() / this.levels()[this.current()].bb) * 10) / 10);

  protected next(): void {
    this.current.update((i) => Math.min(this.levels().length - 1, i + 1));
  }

  protected prev(): void {
    this.current.update((i) => Math.max(0, i - 1));
  }
}
