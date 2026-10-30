import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/** Boutique v2.0 : true seulement quand le drapeau est activé (environments/*.ts) */
export const shopEnabled = (): boolean => environment.shopEnabled;

/**
 * Pages de la boutique (et CGV) : inaccessibles tant que la boutique n'est pas ouverte.
 */
export const shopGuard: CanMatchFn & CanActivateFn = () => (shopEnabled() ? true : inject(Router).createUrlTree(['/']));
