import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthTokens, CurrentUser, MessageResponse, RegisterPayload } from './auth.models';

const ACCESS_KEY = 'pv_access_token';
const REFRESH_KEY = 'pv_refresh_token';

/**
 * Authentification JWT : access token (1 h) + refresh token à usage unique (7 j).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly currentUser = signal<CurrentUser | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);

  /** Un seul refresh à la fois : le refresh token ne sert qu'une fois */
  private refreshInFlight$: Observable<string> | null = null;

  register(payload: RegisterPayload): Observable<MessageResponse> {
    return this.api.post<MessageResponse>('register', payload);
  }

  verifyEmail(token: string): Observable<MessageResponse> {
    return this.api.get<MessageResponse>('verify-email', { token });
  }

  resendVerification(email: string): Observable<MessageResponse> {
    return this.api.post<MessageResponse>('verify-email/resend', { email });
  }

  login(email: string, password: string): Observable<CurrentUser> {
    return this.api.post<AuthTokens>('login', { email, password }).pipe(
      tap((tokens) => this.storeTokens(tokens)),
      switchMap(() => this.loadCurrentUser()),
    );
  }

  /** Recharge l'utilisateur connecté (au démarrage de l'application) */
  restoreSession(): Observable<CurrentUser | null> {
    if (!this.getAccessToken()) {
      return of(null);
    }
    return this.loadCurrentUser().pipe(catchError(() => of(null)));
  }

  loadCurrentUser(): Observable<CurrentUser> {
    return this.api.get<CurrentUser>('me').pipe(tap((user) => this.currentUser.set(user)));
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.storage(REFRESH_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('Aucun refresh token'));
    }

    this.refreshInFlight$ ??= this.api.post<AuthTokens>('token/refresh', { refresh_token: refreshToken }).pipe(
      tap((tokens) => this.storeTokens(tokens)),
      map((tokens) => tokens.token),
      finalize(() => (this.refreshInFlight$ = null)),
      shareReplay(1),
    );

    return this.refreshInFlight$;
  }

  logout(redirect = true): void {
    this.removeStorage(ACCESS_KEY);
    this.removeStorage(REFRESH_KEY);
    this.currentUser.set(null);
    if (redirect) {
      void this.router.navigateByUrl('/');
    }
  }

  getAccessToken(): string | null {
    return this.storage(ACCESS_KEY);
  }

  private storeTokens(tokens: AuthTokens): void {
    this.setStorage(ACCESS_KEY, tokens.token);
    this.setStorage(REFRESH_KEY, tokens.refresh_token);
  }

  // localStorage peut être indisponible (navigation privée stricte) : on ne plante jamais
  private storage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* session non persistée */
    }
  }

  private removeStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* rien à nettoyer */
    }
  }
}
