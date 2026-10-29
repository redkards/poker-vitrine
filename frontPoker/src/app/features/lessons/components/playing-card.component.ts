import { Component, computed, input } from '@angular/core';
import { CardCode, Rank, Suit } from '../lessons.data';

const RANK_LABEL: Record<Rank, string> = {
  A: 'A', K: 'R', Q: 'D', J: 'V', T: '10', '9': '9', '8': '8', '7': '7', '6': '6', '5': '5', '4': '4', '3': '3', '2': '2',
};
const RANK_NAME: Record<Rank, string> = {
  A: 'As', K: 'Roi', Q: 'Dame', J: 'Valet', T: 'Dix', '9': 'Neuf', '8': 'Huit', '7': 'Sept', '6': 'Six', '5': 'Cinq', '4': 'Quatre', '3': 'Trois', '2': 'Deux',
};
const SUIT_SYMBOL: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_NAME: Record<Suit, string> = { s: 'pique', h: 'cœur', d: 'carreau', c: 'trèfle' };

/** Nom complet d'une carte, ex. « As de pique ». */
export function cardName(code: CardCode): string {
  return `${RANK_NAME[code[0] as Rank]} de ${SUIT_NAME[code[1] as Suit]}`;
}

/** Liste lisible de cartes, ex. « As de pique, Roi de cœur ». */
export function cardsName(codes: readonly CardCode[]): string {
  return codes.map(cardName).join(', ');
}

/**
 * Carte à jouer en CSS (valeur française + enseigne), avec retournement animé.
 */
@Component({
  selector: 'app-playing-card',
  template: `
    <span class="card__inner">
      <span class="card__face card__front" aria-hidden="true">
        <span class="card__corner">{{ rank() }}<br />{{ suit() }}</span>
        <span class="card__pip">{{ suit() }}</span>
      </span>
      <span class="card__face card__back" aria-hidden="true"></span>
    </span>
  `,
  styleUrl: './playing-card.component.scss',
  host: {
    role: 'img',
    class: 'card',
    '[class.card--red]': 'isRed()',
    '[class.is-hidden]': 'hidden()',
    '[attr.data-size]': 'size()',
    '[attr.aria-label]': 'label()',
  },
})
export class PlayingCardComponent {
  readonly code = input.required<CardCode>();
  readonly hidden = input(false);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly rank = computed(() => RANK_LABEL[this.code()[0] as Rank]);
  protected readonly suit = computed(() => SUIT_SYMBOL[this.code()[1] as Suit]);
  protected readonly isRed = computed(() => this.code()[1] === 'h' || this.code()[1] === 'd');
  protected readonly label = computed(() => (this.hidden() ? 'Carte face cachée' : cardName(this.code())));
}
