import { Component, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/api/api.service';
import { AccountService } from '../../../core/api/account.service';
import { AuthShellComponent } from '../../auth/auth-shell/auth-shell.component';

type State = 'confirm' | 'loading' | 'done' | 'error';

/**
 * Cible du lien reçu par email : /suppression-compte?token=…
 * La suppression n'est déclenchée que par un clic (un simple aperçu du lien par la messagerie ne supprime rien).
 */
@Component({
  selector: 'app-account-deletion',
  imports: [RouterLink, AuthShellComponent],
  template: `
    <app-auth-shell eyebrow="Mes données" [heading]="state() === 'done' ? 'Compte supprimé' : 'Supprimer mon compte'" quote="Merci d’avoir fait partie de la communauté.">
      @switch (state()) {
        @case ('done') {
          <div class="pv-alert pv-alert--success" role="status">{{ message() }}</div>
          <a routerLink="/" class="pv-btn pv-btn--primary">Retour à l'accueil <span class="pv-arrow" aria-hidden="true">→</span></a>
        }
        @case ('error') {
          <div class="pv-alert pv-alert--error" role="alert">{{ message() }}</div>
          <a routerLink="/mon-espace" class="pv-btn pv-btn--outline">Aller à mon espace</a>
        }
        @default {
          @if (!token()) {
            <div class="pv-alert pv-alert--error" role="alert">Ce lien est incomplet. Recommencez depuis votre espace.</div>
          } @else {
            <p>
              En confirmant, vos données personnelles sont <strong>effacées immédiatement et définitivement</strong> :
              email, pseudo, mot de passe, favoris et abonnements. Vos messages du forum restent visibles sous le nom
              « Utilisateur supprimé ».
            </p>
            <div class="actions">
              <button type="button" class="pv-btn pv-btn--primary" [disabled]="state() === 'loading'" (click)="confirm()">
                {{ state() === 'loading' ? 'Suppression…' : 'Supprimer définitivement mon compte' }}
              </button>
              <a routerLink="/" class="pv-btn pv-btn--outline">Annuler</a>
            </div>
          }
        }
      }
    </app-auth-shell>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    p {
      margin: 0 0 1.5rem;
      color: var(--pv-ink-soft);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
  `,
})
export class AccountDeletionComponent {
  private readonly account = inject(AccountService);

  readonly token = input('');

  protected readonly state = signal<State>('confirm');
  protected readonly message = signal('');

  protected confirm(): void {
    this.state.set('loading');
    this.account.confirmDeletion(this.token()).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.state.set('done');
      },
      error: (err: unknown) => {
        this.message.set(apiErrorMessage(err, 'Le lien est invalide ou expiré.'));
        this.state.set('error');
      },
    });
  }
}
