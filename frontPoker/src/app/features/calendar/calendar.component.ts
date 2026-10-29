import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { apiErrorMessage } from '../../core/api/api.service';
import { Tournament, TournamentList, TournamentZone } from '../../core/api/content.models';
import { ContentService } from '../../core/api/content.service';

const ZONES: TournamentZone[] = ['france', 'belgique', 'international'];
const MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const DAY_MONTH = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const DAY_MONTH_YEAR = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const SHORT_MONTH = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' });

/** Dates de l'API au format AAAA-MM-JJ, interprétées en UTC pour éviter tout décalage de fuseau */
const parse = (d: string) => new Date(`${d}T00:00:00Z`);

/**
 * Calendrier des tournois live : France, Belgique, international (?zone=).
 */
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly zone = signal<TournamentZone | null>(null);
  protected readonly data = signal<TournamentList | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly total = computed(() => (this.data()?.zones ?? []).reduce((sum, z) => sum + z.count, 0));

  /** Tournois groupés par mois de début */
  protected readonly months = computed(() => {
    const groups = new Map<string, Tournament[]>();
    for (const t of this.data()?.items ?? []) {
      const key = t.startDate.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), t]);
    }
    return [...groups.entries()].map(([key, items]) => {
      const label = MONTH.format(parse(`${key}-01`));
      return { key, label: label.charAt(0).toUpperCase() + label.slice(1), items };
    });
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        tap((params) => {
          const zone = params.get('zone') as TournamentZone | null;
          this.zone.set(zone && ZONES.includes(zone) ? zone : null);
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() => this.content.getTournaments(this.zone())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(apiErrorMessage(err, 'Impossible de charger le calendrier.'));
          this.loading.set(false);
        },
      });
  }

  protected setZone(zone: TournamentZone | null): void {
    void this.router.navigate([], { queryParams: { zone } });
  }

  protected day(t: Tournament): string {
    return String(parse(t.startDate).getUTCDate());
  }

  protected shortMonth(t: Tournament): string {
    return SHORT_MONTH.format(parse(t.startDate)).replace('.', '');
  }

  /** « 1 – 8 novembre 2026 », « 27 novembre – 21 décembre 2026 », « 20 décembre 2026 – 4 janvier 2027 » */
  protected range(t: Tournament): string {
    const start = parse(t.startDate);
    const end = parse(t.endDate);
    if (t.startDate === t.endDate) return DAY_MONTH_YEAR.format(start);
    if (start.getUTCFullYear() !== end.getUTCFullYear()) return `${DAY_MONTH_YEAR.format(start)} – ${DAY_MONTH_YEAR.format(end)}`;
    if (start.getUTCMonth() !== end.getUTCMonth()) return `${DAY_MONTH.format(start)} – ${DAY_MONTH_YEAR.format(end)}`;
    return `${start.getUTCDate()} – ${DAY_MONTH_YEAR.format(end)}`;
  }

  protected isOngoing(t: Tournament): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return t.startDate <= today && today <= t.endDate;
  }
}
