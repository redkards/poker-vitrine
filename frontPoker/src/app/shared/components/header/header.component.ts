import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../../features/shop/cart.service';
import { shopEnabled } from '../../../features/shop/shop.guard';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/actualites', label: 'Actualités', exact: false },
    { path: '/forum', label: 'Forum', exact: false },
    { path: '/videos', label: 'Vidéos', exact: false },
    { path: '/lecons', label: 'Apprendre', exact: false },
    { path: '/calendrier', label: 'Calendrier', exact: false },
    // Boutique v2.0 : lien masqué tant que le drapeau est désactivé
    ...(shopEnabled() ? [{ path: '/boutique', label: 'Boutique', exact: false }] : []),
  ];
  protected readonly shopEnabled = shopEnabled();
  protected readonly cart = inject(CartService);

  constructor() {
    this.router
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  /** Envoie vers /recherche?q= (page de recherche vide si rien n'est saisi) */
  protected search(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const q = input.value.replace(/\s+/g, ' ').trim();
    input.value = '';
    input.blur();
    void this.router.navigate(['/recherche'], { queryParams: q ? { q } : {} });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
