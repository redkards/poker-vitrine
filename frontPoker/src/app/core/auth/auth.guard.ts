import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Réserve une route aux membres connectés ; sinon redirige vers /connexion en mémorisant la page demandée.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);

  if (auth.isLoggedIn()) {
    return true;
  }

  return inject(Router).createUrlTree(['/connexion'], { queryParams: { returnUrl: state.url } });
};

/** Inverse : pages connexion/inscription inutiles une fois connecté */
export const guestGuard: CanActivateFn = () => {
  return inject(AuthService).isLoggedIn() ? inject(Router).createUrlTree(['/mon-espace']) : true;
};
