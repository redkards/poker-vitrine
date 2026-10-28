import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage, apiViolations } from '../../../core/api/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthShellComponent } from '../auth-shell/auth-shell.component';

type Field = 'pseudo' | 'email' | 'password' | 'acceptCgu';

/** Indication visuelle seulement : la vraie règle est appliquée par le serveur */
function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^\w\s]/.test(value)) score++;
  return Math.min(score, 4);
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, AuthShellComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    pseudo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[\w\-.]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    // RGPD : case non pré-cochée
    acceptCgu: [false, Validators.requiredTrue],
  });

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly serverErrors = signal<Partial<Record<Field, string>>>({});
  protected readonly showPassword = signal(false);
  /** Email du compte créé : affiche l'écran « vérifiez votre boîte mail » */
  protected readonly registeredEmail = signal<string | null>(null);
  protected readonly resendMessage = signal<string | null>(null);

  private readonly passwordValue = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });
  protected readonly strength = computed(() => passwordScore(this.passwordValue()));
  protected readonly strengthLabel = computed(() => ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'][this.strength()]);

  protected fieldError(field: Field): string | null {
    const control = this.form.controls[field];
    const server = this.serverErrors()[field];
    if (server) return server;
    if (!control.touched || control.valid) return null;

    switch (field) {
      case 'pseudo':
        return control.hasError('pattern')
          ? 'Lettres, chiffres, tirets, points et underscores uniquement.'
          : 'Le pseudo doit contenir entre 3 et 50 caractères.';
      case 'email':
        return 'Saisissez une adresse email valide.';
      case 'password':
        return 'Le mot de passe doit contenir au moins 8 caractères.';
      case 'acceptCgu':
        return 'Vous devez accepter les CGU et la Politique de Confidentialité.';
    }
  }

  protected submit(): void {
    this.serverErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = this.form.getRawValue();
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.registeredEmail.set(payload.email);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const violations = apiViolations(err);
        if (Object.keys(violations).length) {
          this.serverErrors.set(violations);
          return;
        }
        if (err instanceof HttpErrorResponse && err.status === 409) {
          const message = apiErrorMessage(err);
          this.serverErrors.set(message.includes('pseudo') ? { pseudo: message } : { email: message });
          return;
        }
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected resend(): void {
    const email = this.registeredEmail();
    if (!email) return;
    this.auth.resendVerification(email).subscribe({
      next: (res) => this.resendMessage.set(res.message),
      error: (err: unknown) => this.resendMessage.set(apiErrorMessage(err)),
    });
  }
}
