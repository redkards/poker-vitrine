import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthShellComponent } from '../auth-shell/auth-shell.component';

type State = 'loading' | 'success' | 'expired' | 'invalid';

/**
 * Cible du lien reçu par email : /verify-email?token=...
 */
@Component({
  selector: 'app-verify-email',
  imports: [FormsModule, RouterLink, AuthShellComponent],
  template: `
    <app-auth-shell eyebrow="Activation du compte" [heading]="headings[state()]">
      @switch (state()) {
        @case ('loading') {
          <p class="pv-hint" role="status">Vérification de votre lien en cours…</p>
        }
        @case ('success') {
          <div class="pv-alert pv-alert--success" role="status">{{ message() }}</div>
          <a routerLink="/connexion" class="pv-btn pv-btn--primary pv-btn--lg">
            Se connecter <span class="pv-arrow" aria-hidden="true">→</span>
          </a>
        }
        @default {
          <div class="pv-alert pv-alert--error" role="alert">{{ message() }}</div>
          <form (ngSubmit)="resend()">
            <div class="pv-field">
              <label for="resend-email">Recevoir un nouveau lien</label>
              <input id="resend-email" name="email" class="pv-input" type="email" required [(ngModel)]="email" autocomplete="email" />
            </div>
            @if (resendMessage(); as m) {
              <div class="pv-alert pv-alert--info" role="status">{{ m }}</div>
            }
            <button type="submit" class="pv-btn pv-btn--primary" [disabled]="!email">
              Renvoyer le lien <span class="pv-arrow" aria-hidden="true">→</span>
            </button>
          </form>
        }
      }
    </app-auth-shell>
  `,
})
export class VerifyEmailComponent implements OnInit {
  private readonly auth = inject(AuthService);

  readonly token = input<string>('');

  protected readonly state = signal<State>('loading');
  protected readonly message = signal('');
  protected readonly resendMessage = signal<string | null>(null);
  protected email = '';

  protected readonly headings: Record<State, string> = {
    loading: 'Un instant…',
    success: 'Compte activé',
    expired: 'Lien expiré',
    invalid: 'Lien invalide',
  };

  ngOnInit(): void {
    if (!this.token()) {
      this.state.set('invalid');
      this.message.set('Aucun jeton de vérification dans le lien.');
      return;
    }

    this.auth.verifyEmail(this.token()).subscribe({
      next: (res) => {
        this.state.set('success');
        this.message.set(res.message);
      },
      error: (err: unknown) => {
        this.state.set(err instanceof HttpErrorResponse && err.status === 410 ? 'expired' : 'invalid');
        this.message.set(apiErrorMessage(err));
      },
    });
  }

  protected resend(): void {
    this.auth.resendVerification(this.email).subscribe({
      next: (res) => this.resendMessage.set(res.message),
      error: (err: unknown) => this.resendMessage.set(apiErrorMessage(err)),
    });
  }
}
