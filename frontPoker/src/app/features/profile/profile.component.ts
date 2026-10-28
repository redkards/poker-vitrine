import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Espace membre (route protégée par l'AuthGuard).
 * Édition du profil, export et suppression RGPD : Sprint 4.
 */
@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  template: `
    @if (auth.user(); as user) {
      <section class="pv-container profile">
        <div class="profile__head">
          <span class="profile__avatar" aria-hidden="true">{{ user.pseudo.charAt(0).toUpperCase() }}</span>
          <div>
            <span class="pv-eyebrow">Mon espace</span>
            <h1>Bonjour, {{ user.pseudo }}</h1>
          </div>
        </div>

        <dl class="profile__grid">
          <div>
            <dt>Email</dt>
            <dd>{{ user.email }}</dd>
          </div>
          <div>
            <dt>Membre depuis</dt>
            <dd>{{ user.createdAt | date: 'd MMMM y' }}</dd>
          </div>
          <div>
            <dt>Dernière connexion</dt>
            <dd>{{ user.lastLoginAt ? (user.lastLoginAt | date: "d MMMM y 'à' HH:mm") : '—' }}</dd>
          </div>
          <div>
            <dt>CGU acceptées</dt>
            <dd>Version {{ user.consentVersion }}</dd>
          </div>
        </dl>

        <div class="pv-alert pv-alert--info">
          Bientôt ici : modification du pseudo et du mot de passe, favoris vidéos, export et suppression de vos données (RGPD).
        </div>
      </section>
    }
  `,
  styles: `
    .profile {
      margin-top: 1rem;
      padding: clamp(1.75rem, 4vw, 3rem);
      border-radius: var(--pv-radius-lg);
      background: var(--pv-surface);
      box-shadow: var(--pv-shadow);
    }
    .profile__head {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .profile__head h1 {
      margin-top: 0.3rem;
      font-size: clamp(2rem, 4vw, 2.8rem);
    }
    .profile__avatar {
      display: grid;
      place-items: center;
      flex: none;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--pv-red);
      color: #fff;
      font-family: var(--pv-font-title);
      font-size: 2rem;
      font-weight: 700;
    }
    .profile__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      margin: 0 0 1.5rem;
    }
    .profile__grid div {
      padding: 1.1rem 1.25rem;
      border-radius: var(--pv-radius-sm);
      background: var(--pv-card);
    }
    dt {
      color: var(--pv-muted);
      font-size: 0.82rem;
    }
    dd {
      margin: 0.2rem 0 0;
      font-weight: 600;
      word-break: break-word;
    }
  `,
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
}
