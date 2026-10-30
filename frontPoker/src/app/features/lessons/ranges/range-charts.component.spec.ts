import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { RangeChartsComponent } from './range-charts.component';
import { RangeChart } from './ranges.data';

describe('RangeChartsComponent', () => {
  const user = signal<{ premium: boolean } | null>(null);
  let http: HttpTestingController;

  beforeEach(() => {
    user.set(null);
    TestBed.configureTestingModule({
      imports: [RangeChartsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { user, isLoggedIn: () => user() !== null } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const render = () => {
    const fixture = TestBed.createComponent(RangeChartsComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };
  const clickLevel = (el: HTMLElement, label: string) =>
    [...el.querySelectorAll<HTMLButtonElement>('.level-btn')].find((b) => b.textContent?.includes(label))!.click();

  it('affiche la grille débutant de 169 cases, avec la légende', () => {
    const { el } = render();

    expect(el.querySelectorAll('.grid__cell').length).toBe(169);
    expect(el.querySelector('.grid__cell[aria-label="AA : Relancer"]')).not.toBeNull();
    expect(el.querySelector('.grid__cell[aria-label="72o : Se coucher"]')).not.toBeNull();
    expect(el.querySelector('.legend')?.textContent).toContain('8,1 %');
  });

  it('verrouille le niveau Expert sans appeler l’API pour un membre non abonné', () => {
    user.set({ premium: false });
    const { fixture, el } = render();

    clickLevel(el, 'Expert');
    fixture.detectChanges();

    http.expectNone(`${environment.apiUrl}/lessons/ranges/expert`);
    expect(el.querySelector('.locked')?.textContent).toContain('réservés aux membres Premium');
    expect(el.querySelector('.grid')).toBeNull();
  });

  it('charge les tableaux Expert depuis l’API pour un membre Premium', async () => {
    user.set({ premium: true });
    const { fixture, el } = render();
    const chart: RangeChart = {
      id: 'expert-test',
      title: 'Situation de test',
      situation: 'Test',
      note: 'Note',
      actions: [
        { key: 'threebet', label: 'Sur-relancer (3-bet)', hands: 'AA' },
        { key: 'call', label: 'Payer', hands: 'KK' },
      ],
    };

    clickLevel(el, 'Expert');
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/lessons/ranges/expert`).flush([chart]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('.locked')).toBeNull();
    expect(el.querySelector('.chart h2')?.textContent).toContain('Situation de test');
    expect(el.querySelector('.grid__cell[aria-label="AA : Sur-relancer (3-bet)"]')).not.toBeNull();
    expect(el.querySelector('.grid__cell[aria-label="KK : Payer"]')).not.toBeNull();
  });
});
