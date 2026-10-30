import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { jwtInterceptor } from './jwt.interceptor';

describe('jwtInterceptor', () => {
  const api = environment.apiUrl;
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigateByUrl']) },
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  const login = () => {
    localStorage.setItem('pv_access_token', 'access-1');
    localStorage.setItem('pv_refresh_token', 'refresh-1');
  };

  it("ajoute le jeton aux appels de l'API", () => {
    login();

    client.get(`${api}/me`).subscribe();

    expect(http.expectOne(`${api}/me`).request.headers.get('Authorization')).toBe('Bearer access-1');
  });

  it("n'envoie jamais le jeton à un autre site ni aux routes d'authentification", () => {
    login();

    client.get('https://www.youtube.com/oembed').subscribe();
    client.post(`${api}/login`, {}).subscribe();
    client.post(`${api}/token/refresh`, {}).subscribe();

    expect(http.expectOne('https://www.youtube.com/oembed').request.headers.has('Authorization')).toBeFalse();
    expect(http.expectOne(`${api}/login`).request.headers.has('Authorization')).toBeFalse();
    expect(http.expectOne(`${api}/token/refresh`).request.headers.has('Authorization')).toBeFalse();
  });

  it("laisse passer les visiteurs sans en-tête", () => {
    client.get(`${api}/videos`).subscribe();

    expect(http.expectOne(`${api}/videos`).request.headers.has('Authorization')).toBeFalse();
  });

  it('sur 401, renouvelle le jeton puis rejoue la requête une fois', () => {
    login();
    let body: unknown;

    client.get(`${api}/me`).subscribe((b) => (body = b));

    http.expectOne(`${api}/me`).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${api}/token/refresh`).flush({ token: 'access-2', refresh_token: 'refresh-2' });
    const replay = http.expectOne(`${api}/me`);
    expect(replay.request.headers.get('Authorization')).toBe('Bearer access-2');
    replay.flush({ ok: true });

    expect(body).toEqual({ ok: true });
  });

  it('déconnecte sans redirection si le renouvellement échoue', () => {
    login();
    let error: unknown;

    client.get(`${api}/me`).subscribe({ error: (e) => (error = e) });

    http.expectOne(`${api}/me`).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(`${api}/token/refresh`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect((error as HttpErrorResponse).status).toBe(401);
    expect(localStorage.getItem('pv_access_token')).toBeNull();
    expect(localStorage.getItem('pv_refresh_token')).toBeNull();
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
  });

  it('ne tente pas de refresh sur une autre erreur (403 Premium requis)', () => {
    login();
    let error: unknown;

    client.get(`${api}/lessons/expert/x`).subscribe({ error: (e) => (error = e) });
    http.expectOne(`${api}/lessons/expert/x`).flush({ code: 'premium_required' }, { status: 403, statusText: 'Forbidden' });

    http.expectNone(`${api}/token/refresh`);
    expect((error as HttpErrorResponse).status).toBe(403);
    expect(localStorage.getItem('pv_access_token')).toBe('access-1');
  });
});
