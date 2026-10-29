import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Erreur de validation renvoyée par Symfony (MapRequestPayload) */
export interface ApiViolation {
  propertyPath: string;
  title: string;
}

/**
 * Point d'accès unique à l'API Symfony.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    return this.http.get<T>(this.url(path), { params: params ? new HttpParams({ fromObject: params }) : undefined });
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  patch<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http.patch<T>(this.url(path), body);
  }

  /** Le corps est facultatif (ex. mot de passe de confirmation pour DELETE /me) */
  delete<T>(path: string, body?: unknown): Observable<T> {
    return this.http.delete<T>(this.url(path), body === undefined ? {} : { body });
  }

  /** Téléchargement d'un fichier (ex. export RGPD) */
  getBlob(path: string): Observable<Blob> {
    return this.http.get(this.url(path), { responseType: 'blob' });
  }

  isApiUrl(url: string): boolean {
    return url.startsWith(this.baseUrl);
  }

  private url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }
}

/** Message lisible à partir d'une erreur HTTP de l'API */
export function apiErrorMessage(error: unknown, fallback = 'Une erreur est survenue, réessayez.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    }
    return error.error?.message ?? error.error?.detail ?? fallback;
  }
  return fallback;
}

/** Erreurs de validation indexées par champ */
export function apiViolations(error: unknown): Record<string, string> {
  const violations: ApiViolation[] = error instanceof HttpErrorResponse ? (error.error?.violations ?? []) : [];
  return violations.reduce<Record<string, string>>((acc, v) => {
    acc[v.propertyPath] ??= v.title;
    return acc;
  }, {});
}
