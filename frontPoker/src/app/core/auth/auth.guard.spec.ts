import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard / guestGuard', () => {
  const loggedIn = signal(false);
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/forum/nouveau' } as RouterStateSnapshot;

  beforeEach(() => {
    loggedIn.set(false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isLoggedIn: loggedIn } }],
    });
  });

  const run = (guard: typeof authGuard) => TestBed.runInInjectionContext(() => guard(route, state));
  const url = (result: unknown) => TestBed.inject(Router).serializeUrl(result as UrlTree);

  it('laisse passer un membre connecté', () => {
    loggedIn.set(true);

    expect(run(authGuard)).toBeTrue();
  });

  it('renvoie un visiteur vers /connexion en mémorisant la page demandée', () => {
    expect(url(run(authGuard))).toBe('/connexion?returnUrl=%2Fforum%2Fnouveau');
  });

  it("guestGuard : ouvre connexion/inscription aux visiteurs, renvoie les membres vers « Mon espace »", () => {
    expect(run(guestGuard)).toBeTrue();

    loggedIn.set(true);
    expect(url(run(guestGuard))).toBe('/mon-espace');
  });
});
