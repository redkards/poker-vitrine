import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="logo" [class.logo--light]="light()" aria-label="Poker Winners — accueil">
      <svg class="logo__spade" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.2c-.4 0-.8.2-1.1.5C8.6 5.1 3 9.4 3 13.6 3 16.4 5.2 18.4 7.7 18.4c1.2 0 2.3-.4 3.1-1.1-.3 1.6-1 2.9-2.3 4.1-.3.3-.1.8.3.8h6.4c.4 0 .6-.5.3-.8-1.3-1.2-2-2.5-2.3-4.1.8.7 1.9 1.1 3.1 1.1 2.5 0 4.7-2 4.7-4.8 0-4.2-5.6-8.5-7.9-10.9-.3-.3-.7-.5-1.1-.5Z"
        />
      </svg>
      <span class="logo__text">Poker<span>Winners</span></span>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      color: var(--pv-ink);
      text-decoration: none;
      border-radius: 8px;
    }
    .logo--light {
      color: #fff;
    }
    .logo__spade {
      width: 26px;
      height: 26px;
      fill: currentColor;
    }
    .logo__text {
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: 0.32em;
      text-transform: uppercase;
    }
    .logo__text span {
      color: var(--pv-red);
    }
    .logo--light .logo__text span {
      color: #ff5a63;
    }
  `,
})
export class LogoComponent {
  readonly light = input(false);
}
