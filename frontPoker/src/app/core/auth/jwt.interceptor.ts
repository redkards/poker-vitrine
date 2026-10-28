import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthService } from './auth.service';

/** Endpoints publics d'authentification : jamais de Bearer ni de refresh automatique */
const AUTH_ENDPOINTS = ['/login', '/token/refresh', '/register', '/verify-email'];

const withBearer = (req: HttpRequest<unknown>, token: string) =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

/**
 * Ajoute le JWT aux appels de l'API ; sur 401, tente un refresh puis rejoue la requête une fois.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(ApiService);
  const auth = inject(AuthService);

  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => req.url.startsWith(api.baseUrl + path));
  const token = auth.getAccessToken();

  if (!api.isApiUrl(req.url) || isAuthEndpoint || !token) {
    return next(req);
  }

  return next(withBearer(req, token)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap((newToken) => next(withBearer(req, newToken))),
        catchError((refreshError: unknown) => {
          auth.logout(false);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
