import { Component, computed, input, linkedSignal, ChangeDetectionStrategy } from '@angular/core';
import { HandExample } from '../lessons.data';
import { PlayingCardComponent } from './playing-card.component';

/**
 * Hiérarchie des combinaisons : liste cliquable + exemple en cartes.
 */
@Component({
  selector: 'app-hand-ranking',
  imports: [PlayingCardComponent],
  template: `
    <ol class="list">
      @for (h of hands(); track h.name) {
        <li>
          <button type="button" class="item" [attr.aria-pressed]="$index === current()" (click)="current.set($index)">
            <span class="item__rank" aria-hidden="true">{{ $index + 1 }}</span>{{ h.name }}
          </button>
        </li>
      }
    </ol>
    <div class="example" aria-live="polite">
      <p class="example__title"><strong>{{ current() + 1 }}. {{ hand().name }}</strong></p>
      <div class="example__cards" role="group" [attr.aria-label]="'Exemple : ' + hand().name">
        @for (c of hand().cards; track c) {
          <app-playing-card [code]="c" />
        }
      </div>
      <p class="example__text">{{ hand().description }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hand-ranking.component.scss',
})
export class HandRankingComponent {
  readonly hands = input.required<HandExample[]>();
  protected readonly current = linkedSignal(() => (this.hands(), 0));
  protected readonly hand = computed(() => this.hands()[this.current()]);
}
