import { Component, computed, input, linkedSignal } from '@angular/core';
import { CardCode, DecisionOption } from '../lessons.data';
import { PlayingCardComponent, cardsName } from './playing-card.component';

/**
 * Mise en situation : une main, plusieurs options, un retour expliqué.
 */
@Component({
  selector: 'app-decision-spot',
  imports: [PlayingCardComponent],
  templateUrl: './decision-spot.component.html',
  styleUrl: './decision-spot.component.scss',
})
export class DecisionSpotComponent {
  readonly situation = input.required<string>();
  readonly hero = input<CardCode[] | undefined>(undefined);
  readonly board = input<CardCode[] | undefined>(undefined);
  readonly options = input.required<DecisionOption[]>();

  protected readonly choice = linkedSignal<number | null>(() => (this.options(), null));
  protected readonly picked = computed(() => {
    const i = this.choice();
    return i === null ? null : this.options()[i];
  });

  protected label(cards: CardCode[]): string {
    return cardsName(cards);
  }
}
