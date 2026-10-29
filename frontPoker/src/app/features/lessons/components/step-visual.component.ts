import { Component, computed, input, linkedSignal, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StepVisual } from '../lessons.data';
import { BlindLevelsComponent } from './blind-levels.component';
import { DecisionSpotComponent } from './decision-spot.component';
import { HandRankingComponent } from './hand-ranking.component';
import { PlayingCardComponent } from './playing-card.component';
import { PokerTableComponent } from './poker-table.component';
import { SeatMapComponent } from './seat-map.component';
import { ShowdownComponent } from './showdown.component';
import { StackGaugeComponent } from './stack-gauge.component';
import { VarianceChartComponent } from './variance-chart.component';

/**
 * Aiguille chaque étape vers son visuel interactif.
 * Les petits visuels (familles de mains, révélations, listes, bankroll) sont gérés ici.
 */
@Component({
  selector: 'app-step-visual',
  imports: [
    DecimalPipe,
    PlayingCardComponent,
    PokerTableComponent,
    ShowdownComponent,
    HandRankingComponent,
    SeatMapComponent,
    StackGaugeComponent,
    BlindLevelsComponent,
    DecisionSpotComponent,
    VarianceChartComponent,
  ],
  templateUrl: './step-visual.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './step-visual.component.scss',
})
export class StepVisualComponent {
  readonly visual = input.required<StepVisual>();

  /** Onglet actif (familles de mains) */
  protected readonly tab = linkedSignal(() => (this.visual(), 0));
  /** Éléments dévoilés / cochés */
  protected readonly open = linkedSignal<ReadonlySet<number>>(() => (this.visual(), new Set<number>()));
  /** Réserve saisie (bankroll) */
  protected readonly reserve = linkedSignal(() => {
    const v = this.visual();
    return v.kind === 'bankroll' ? v.reserve : 0;
  });

  protected readonly checkedCount = computed(() => this.open().size);

  protected toggle(i: number): void {
    this.open.update((s) => {
      const next = new Set(s);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }

  protected onReserve(event: Event): void {
    this.reserve.set(Math.max(0, Number((event.target as HTMLInputElement).value) || 0));
  }
}
