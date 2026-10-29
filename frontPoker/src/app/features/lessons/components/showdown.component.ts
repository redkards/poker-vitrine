import { Component, computed, input, linkedSignal, ChangeDetectionStrategy } from '@angular/core';
import { CardCode, ShowdownPlayer } from '../lessons.data';
import { PlayingCardComponent, cardsName } from './playing-card.component';

/**
 * Abattage : le tableau, les mains en présence et la révélation du gagnant.
 */
@Component({
  selector: 'app-showdown',
  imports: [PlayingCardComponent],
  template: `
    <div class="board" role="group" [attr.aria-label]="'Tableau : ' + boardLabel()">
      @for (c of board(); track c) {
        <app-playing-card [code]="c" size="sm" />
      }
    </div>
    <div class="players">
      @for (p of players(); track p.label; let i = $index) {
        <div class="player" [class.is-winner]="revealed() && winner() === i">
          <p class="player__label">{{ p.label }}</p>
          <div class="player__cards">
            @for (c of p.cards; track c) {
              <app-playing-card [code]="c" [hidden]="i > 0 && !revealed()" />
            }
          </div>
          <p class="player__result">{{ i === 0 || revealed() ? p.result : 'Cartes cachées' }}</p>
        </div>
      }
    </div>
    <p class="note" aria-live="polite">{{ revealed() ? note() : '' }}</p>
    <button type="button" class="pv-btn pv-btn--outline" (click)="revealed.set(!revealed())">
      {{ revealed() ? 'Cacher à nouveau' : 'Abattage : révéler les cartes' }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './showdown.component.scss',
})
export class ShowdownComponent {
  readonly board = input.required<CardCode[]>();
  readonly players = input.required<ShowdownPlayer[]>();
  readonly winner = input<number | null>(null);
  readonly note = input('');

  protected readonly revealed = linkedSignal(() => (this.players(), false));
  protected readonly boardLabel = computed(() => cardsName(this.board()));
}
