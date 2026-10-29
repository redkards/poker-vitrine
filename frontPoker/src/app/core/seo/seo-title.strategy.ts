import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { OgType, SeoService } from './seo.service';

/**
 * Remplace la stratégie de titre par défaut : en plus du <title>, pose la meta description
 * et l'Open Graph déclarés dans les données de route (`data: { description, ogType }`).
 */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let route: ActivatedRouteSnapshot = snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    this.seo.update({
      title: this.buildTitle(snapshot),
      description: route.data['description'] as string | undefined,
      type: (route.data['ogType'] as OgType | undefined) ?? 'website',
    });
  }
}
