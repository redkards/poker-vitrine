import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CurrentUser } from './auth.models';
import { AuthService } from './auth.service';

const DEMO_USER: CurrentUser = {
  id: 1,
  email: 'demo@pokervitrine.local',
  pseudo: 'Demo',
  roles: ['ROLE_USER'],
  isVerified: true,
  createdAt: '2026-10-01T10:00:00+00:00',
  lastLoginAt: null,
  consentVersion: '1.0',
  premium: false,
  premiumUntil: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: router }],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('se connecte : enregistre les jetons puis charge le profil', () => {
    let user: CurrentUser | undefined;

    service.login('demo@pokervitrine.local', 'secret').subscribe((u) => (user = u));

    const login = http.expectOne(`${environment.apiUrl}/login`);
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual({ email: 'demo@pokervitrine.local', password: 'secret' });
    login.flush({ token: 'access-1', refresh_token: 'refresh-1' });

    http.expectOne(`${environment.apiUrl}/me`).flush(DEMO_USER);

    expect(user).toEqual(DEMO_USER);
    expect(service.getAccessToken()).toBe('access-1');
    expect(localStorage.getItem('pv_refresh_token')).toBe('refresh-1');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it("restaure la session sans appel à l'API quand aucun jeton n'est stocké", () => {
    let result: CurrentUser | null | undefined;

    service.restoreSession().subscribe((u) => (result = u));

    http.expectNone(`${environment.apiUrl}/me`);
    expect(result).toBeNull();
  });

  it('restaure la session à null si /me échoue (jeton expiré et refresh refusé)', () => {
    localStorage.setItem('pv_access_token', 'expire');
    let result: CurrentUser | null | undefined;

    service.restoreSession().subscribe((u) => (result = u));
    http.expectOne(`${environment.apiUrl}/me`).flush({}, { status: 500, statusText: 'Server Error' });

    expect(result).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it("partage un seul refresh entre plusieurs appels simultanés (refresh token à usage unique)", () => {
    localStorage.setItem('pv_refresh_token', 'refresh-1');
    const tokens: string[] = [];

    service.refreshAccessToken().subscribe((t) => tokens.push(t));
    service.refreshAccessToken().subscribe((t) => tokens.push(t));

    const req = http.expectOne(`${environment.apiUrl}/token/refresh`);
    expect(req.request.body).toEqual({ refresh_token: 'refresh-1' });
    req.flush({ token: 'access-2', refresh_token: 'refresh-2' });

    expect(tokens).toEqual(['access-2', 'access-2']);
    expect(localStorage.getItem('pv_refresh_token')).toBe('refresh-2');

    // Le refresh suivant repart du nouveau refresh token
    service.refreshAccessToken().subscribe();
    expect(http.expectOne(`${environment.apiUrl}/token/refresh`).request.body).toEqual({ refresh_token: 'refresh-2' });
  });

  it("refuse le refresh sans refresh token, sans appel à l'API", () => {
    let error: unknown;

    service.refreshAccessToken().subscribe({ error: (e) => (error = e) });

    http.expectNone(`${environment.apiUrl}/token/refresh`);
    expect(error).toEqual(jasmine.any(Error));
  });

  it("se déconnecte : efface les jetons et l'utilisateur, redirige vers l'accueil", () => {
    localStorage.setItem('pv_access_token', 'a');
    localStorage.setItem('pv_refresh_token', 'r');
    service.loadCurrentUser().subscribe();
    http.expectOne(`${environment.apiUrl}/me`).flush(DEMO_USER);

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getAccessToken()).toBeNull();
    expect(localStorage.getItem('pv_refresh_token')).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('se déconnecte sans redirection quand demandé', () => {
    service.logout(false);

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
