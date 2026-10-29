import { Component, computed, input, linkedSignal } from '@angular/core';
import { CardCode } from '../lessons.data';
import { PlayingCardComponent, cardsName } from './playing-card.component';

const STREETS = [
  { at: 0, name: 'Préflop', next: 'Dévoiler le flop' },
  { at: 3, name: 'Flop', next: 'Dévoiler la turn' },
  { at: 4, name: 'Turn', next: 'Dévoiler la river' },
  { at: 5, name: 'River', next: 'Rejouer la main' },
] as const;

/**
 * Table simplifiée : cartes du joueur + tableau qui se dévoile tour par tour.
 */
@Component({
  selector: 'app-poker-table',
  imports: [PlayingCardComponent],
  templateUrl: './poker-table.component.html',
  styleUrl: './poker-table.component.scss',
})
export class PokerTableComponent {
  readonly hero = input.required<CardCode[]>();
  readonly board = input.required<CardCode[]>();
  readonly revealed = input<number>(0);
  readonly interactive = input(false);

  protected readonly shown = linkedSignal(() => this.revealed());
  protected readonly street = computed(() => STREETS.find((s) => s.at === this.shown()) ?? STREETS[0]);
  protected readonly status = computed(() => {
    const visible = this.board().slice(0, this.shown());
    return visible.length
      ? `${this.street().name} : ${cardsName(visible)}.`
      : `${this.street().name} : aucune carte commune dévoilée.`;
  });
  protected readonly heroLabel = computed(() => `Vos cartes : ${cardsName(this.hero())}`);

  protected advance(): void {
    this.shown.update((n) => (n === 0 ? 3 : n >= 5 ? 0 : n + 1));
  }
}
