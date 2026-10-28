import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LogoComponent],
  template: `
    <footer class="footer">
      <div class="pv-container footer__inner">
        <div class="footer__brand">
          <app-logo [light]="true" />
          <p>La communauté francophone pour apprendre, partager et progresser au poker.</p>
        </div>
        <nav class="footer__links" aria-label="Liens légaux">
          <a routerLink="/mentions-legales">Mentions légales</a>
          <a routerLink="/confidentialite">Politique de confidentialité</a>
          <a routerLink="/cgu">CGU</a>
        </nav>
      </div>
      <p class="pv-container footer__legal">
        © {{ year }} PokerVitrine · Le jeu comporte des risques : endettement, dépendance… Appelez le 09 74 75 13 13
        (appel non surtaxé). Interdit aux moins de 18 ans.
      </p>
    </footer>
  `,
  styles: `
    .footer {
      margin-top: 4rem;
      padding-block: 2.5rem 1.5rem;
      background: var(--pv-dark);
      color: #c9cbd0;
    }
    .footer__inner {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 2rem;
    }
    .footer__brand p {
      max-width: 380px;
      margin: 0.9rem 0 0;
      font-size: 0.92rem;
    }
    .footer__links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.6rem;
      align-items: center;
    }
    .footer__links a {
      color: #fff;
      font-size: 0.92rem;
      text-decoration: none;
    }
    .footer__links a:hover {
      text-decoration: underline;
    }
    .footer__legal {
      margin-top: 2rem;
      padding-top: 1.2rem;
      border-top: 1px solid #2f3034;
      font-size: 0.78rem;
      color: #8d9097;
    }
  `,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
