import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LessonLevel } from '../lessons.data';
import {
  BEGINNER_CHARTS,
  EXPERT_RANGE_TITLES,
  INTERMEDIATE_CHARTS,
  RANGE_LEVELS,
  RANKS,
  RangeChart,
  cellHand,
  chartActions,
  rangePercent,
} from './ranges.data';

/**
 * Tableaux de ranges : /lecons/ranges — grille 13 × 13 par niveau et par situation.
 * Niveau Expert : tableaux chargés depuis l'API pour les membres Premium, panneau de déverrouillage sinon.
 */
@Component({
  selector: 'app-range-charts',
  imports: [RouterLink],
  templateUrl: './range-charts.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './range-charts.component.scss',
})
export class RangeChartsComponent {
  private readonly api = inject(ApiService);
  protected readonly auth = inject(AuthService);

  protected readonly levels = RANGE_LEVELS;
  protected readonly expertTitles = EXPERT_RANGE_TITLES;
  protected readonly rows = RANKS.map((rank, row) => ({ rank, cells: RANKS.map((_, col) => cellHand(row, col)) }));

  protected readonly level = signal<LessonLevel>('debutant');
  private readonly selected = signal<Record<string, number>>({});

  protected readonly levelInfo = computed(() => RANGE_LEVELS.find((l) => l.level === this.level())!);
  /** Niveau Premium inaccessible au visiteur courant (anonyme ou membre non abonné) */
  protected readonly locked = computed(() => this.levelInfo().premium && !this.auth.user()?.premium);

  /** Tableaux Expert, demandés à l'API uniquement pour un membre Premium qui ouvre ce niveau */
  protected readonly expertCharts = rxResource({
    params: () => (this.level() === 'avance' && this.auth.user()?.premium ? true : undefined),
    stream: () => this.api.get<RangeChart[]>('lessons/ranges/expert'),
  });

  protected readonly charts = computed<RangeChart[]>(() => {
    switch (this.level()) {
      case 'debutant':
        return BEGINNER_CHARTS;
      case 'intermediaire':
        return INTERMEDIATE_CHARTS;
      default:
        return this.expertCharts.hasValue() ? this.expertCharts.value() : [];
    }
  });

  protected readonly chartIndex = computed(() => Math.min(this.selected()[this.level()] ?? 0, Math.max(0, this.charts().length - 1)));
  protected readonly chart = computed<RangeChart | undefined>(() => this.charts()[this.chartIndex()]);
  private readonly actions = computed(() => {
    const chart = this.chart();
    return chart ? chartActions(chart) : new Map();
  });

  /** Légende : chaque action avec sa part des 1 326 combinaisons, puis « Se coucher » */
  protected readonly legend = computed(() => {
    const chart = this.chart();
    if (!chart) {
      return [];
    }
    const items = chart.actions.map((a) => ({ key: a.key, label: a.label, percent: rangePercent(a.hands) }));
    const played = items.reduce((sum, i) => sum + i.percent, 0);
    return [...items, { key: 'fold', label: 'Se coucher', percent: 100 - played }];
  });

  protected selectLevel(level: LessonLevel): void {
    this.level.set(level);
  }

  protected selectChart(index: number): void {
    this.selected.update((s) => ({ ...s, [this.level()]: index }));
  }

  protected actionKey(hand: string): string {
    return this.actions().get(hand)?.key ?? 'fold';
  }

  protected cellLabel(hand: string): string {
    return `${hand} : ${this.actions().get(hand)?.label ?? 'Se coucher'}`;
  }

  protected formatPercent(value: number): string {
    return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} %`;
  }
}
