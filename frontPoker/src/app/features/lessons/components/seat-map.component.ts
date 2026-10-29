import { Component, computed, input, linkedSignal, ChangeDetectionStrategy } from '@angular/core';
import { SeatId } from '../lessons.data';

interface Seat {
  id: SeatId;
  short: string;
  name: string;
  group: string;
  text: string;
}

/** Ordre de parole avant le flop, dans le sens des aiguilles d'une montre depuis le bouton. */
const SEATS: Seat[] = [
  { id: 'BTN', short: 'BTN', name: 'Bouton', group: 'Position tardive', text: "Le donneur fictif. Après le flop, il parle en dernier sur chaque tour : c'est la meilleure place de la table." },
  { id: 'SB', short: 'PB', name: 'Petite blinde', group: 'Blindes', text: "Mise obligatoire d'une demi-grosse blinde en général. Après le flop, elle parle en premier : la place la plus inconfortable." },
  { id: 'BB', short: 'GB', name: 'Grosse blinde', group: 'Blindes', text: "Mise obligatoire d'une grosse blinde. Elle parle en dernier avant le flop, mais presque toujours en premier ensuite." },
  { id: 'UTG', short: 'UTG', name: 'Sous le pistolet', group: 'Position précoce', text: "Premier à parler avant le flop (« under the gun » en anglais) : cinq joueurs agissent après lui. Sélection la plus serrée." },
  { id: 'HJ', short: 'HJ', name: 'Milieu de parole', group: 'Position intermédiaire', text: "Appelée « hijack » en anglais. Quatre joueurs parlent encore derrière : on élargit un peu sa sélection." },
  { id: 'CO', short: 'CO', name: 'Cut-off', group: 'Position tardive', text: "La place juste à droite du bouton. Seuls le bouton et les blindes restent à parler : une excellente place pour ouvrir." },
];

@Component({
  selector: 'app-seat-map',
  templateUrl: './seat-map.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './seat-map.component.scss',
})
export class SeatMapComponent {
  readonly highlight = input<SeatId[]>([]);
  readonly selected = input<SeatId | undefined>(undefined);

  protected readonly seats = SEATS;
  protected readonly current = linkedSignal<SeatId>(() => this.selected() ?? 'BTN');
  protected readonly info = computed(() => SEATS.find((s) => s.id === this.current()) ?? SEATS[0]);

  protected isHighlighted(id: SeatId): boolean {
    return this.highlight().includes(id);
  }
}
