import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/actualites', label: 'Actualités', exact: false },
    { path: '/forum', label: 'Forum', exact: false },
    { path: '/videos', label: 'Vidéos', exact: false },
    { path: '/lecons', label: 'Apprendre', exact: false },
    { path: '/calendrier', label: 'Calendrier', exact: false },
  ];

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
