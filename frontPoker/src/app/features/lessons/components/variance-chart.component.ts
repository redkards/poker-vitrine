import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';

const N = 200;
const W = 600;
const H = 220;
const PAD = 8;
/** Gains (en droits d'entrée) et probabilités fictives : rendement moyen ≈ +9 %. */
const PRIZES = [
  { p: 0.003, x: 80 },
  { p: 0.012, x: 22 },
  { p: 0.04, x: 6 },
  { p: 0.14, x: 2.5 },
];
const EV = PRIZES.reduce((s, z) => s + z.p * z.x, 0) - 1;

function simulate(seed: number): number[] {
  // Générateur pseudo-aléatoire déterministe (mulberry32)
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [0];
  for (let i = 0; i < N; i++) {
    const r = rand();
    let acc = 0;
    let gain = 0;
    for (const z of PRIZES) {
      acc += z.p;
      if (r < acc) {
        gain = z.x;
        break;
      }
    }
    out.push(out[i] + gain - 1);
  }
  return out;
}

function longestDrought(series: number[]): number {
  let best = 0;
  let cur = 0;
  for (let i = 1; i < series.length; i++) {
    cur = series[i] < series[i - 1] ? cur + 1 : 0;
    best = Math.max(best, cur);
  }
  return best;
}

/**
 * Courbes de résultats fictives illustrant la variance en tournoi.
 */
@Component({
  selector: 'app-variance-chart',
  template: `
    <div class="chips" role="group" aria-label="Choisir un parcours fictif">
      @for (s of seeds; track s; let i = $index) {
        <button type="button" class="chip" [attr.aria-pressed]="seed() === s" (click)="seed.set(s)">Parcours {{ i + 1 }}</button>
      }
    </div>
    <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" class="chart" role="img" [attr.aria-label]="summary()">
      <line [attr.x1]="0" [attr.x2]="w" [attr.y1]="zeroY()" [attr.y2]="zeroY()" class="zero" />
      <line [attr.x1]="0" [attr.y1]="zeroY()" [attr.x2]="w" [attr.y2]="evY()" class="ev" />
      <polyline [attr.points]="points()" class="line" />
    </svg>
    <p class="legend">
      <span class="key key--line"></span> Résultat cumulé
      <span class="key key--ev"></span> Moyenne attendue
      <span class="key key--zero"></span> Point zéro
    </p>
    <p class="summary" aria-live="polite">{{ summary() }}</p>
    <p class="note">Illustration fictive : 200 tournois joués par un même joueur au même niveau, avec une hypothèse de rendement moyen de {{ evPct }} %. Dans la réalité, une grande partie des joueurs perdent sur la durée.</p>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './variance-chart.component.scss',
})
export class VarianceChartComponent {
  protected readonly w = W;
  protected readonly h = H;
  protected readonly seeds = [7, 21, 58];
  protected readonly evPct = Math.round(EV * 100);
  protected readonly seed = signal(this.seeds[0]);

  private readonly series = computed(() => simulate(this.seed()));
  private readonly bounds = computed(() => {
    const s = this.series();
    const lo = Math.min(0, ...s);
    const hi = Math.max(EV * N, ...s);
    return { lo, hi: hi === lo ? lo + 1 : hi };
  });

  private y(v: number): number {
    const { lo, hi } = this.bounds();
    return PAD + (1 - (v - lo) / (hi - lo)) * (H - 2 * PAD);
  }

  protected readonly zeroY = computed(() => this.y(0));
  protected readonly evY = computed(() => this.y(EV * N));
  protected readonly points = computed(() =>
    this.series()
      .map((v, i) => `${((i / N) * W).toFixed(1)},${this.y(v).toFixed(1)}`)
      .join(' '),
  );
  protected readonly summary = computed(() => {
    const s = this.series();
    const end = Math.round(s[s.length - 1]);
    const low = Math.round(Math.min(...s));
    return `Après ${N} tournois : ${end > 0 ? '+' : ''}${end} droits d'entrée. Point le plus bas : ${low}. Plus longue série de tournois sans gain : ${longestDrought(s)}.`;
  });
}
