import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { shopEnabled } from '../shop/shop.guard';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { apiErrorMessage, apiViolations } from '../../core/api/api.service';
import { AccountService } from '../../core/api/account.service';
import { Video } from '../../core/api/content.models';
import { AuthService } from '../../core/auth/auth.service';

type Feedback = { type: 'success' | 'error'; text: string } | null;

/**
 * UC6 / UC8 / UC13 / UC14 — Espace membre : profil, mot de passe, favoris, export et suppression RGPD.
 */
@Component({
  selector: 'app-profile',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly account = inject(AccountService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly pseudoForm = this.fb.group({
    pseudo: [this.auth.user()?.pseudo ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[\w\-.]+$/)]],
  });
  protected readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });
  protected readonly deletionForm = this.fb.group({
    password: ['', Validators.required],
  });

  protected readonly pseudoFeedback = signal<Feedback>(null);
  protected readonly passwordFeedback = signal<Feedback>(null);
  protected readonly passwordErrors = signal<Record<string, string>>({});
  protected readonly exportFeedback = signal<Feedback>(null);
  protected readonly deletionFeedback = signal<Feedback>(null);
  protected readonly busy = signal<'pseudo' | 'password' | 'export' | 'deletion' | null>(null);
  protected readonly showDeletion = signal(false);

  /** Boutique v2.0 : lien « Mes commandes » affiché seulement si la boutique est ouverte */
  protected readonly shopEnabled = shopEnabled();

  protected readonly favorites = signal<Video[]>([]);
  protected readonly favoritesLoaded = signal(false);

  ngOnInit(): void {
    this.account.getFavorites().subscribe({
      next: (videos) => {
        this.favorites.set(videos);
        this.favoritesLoaded.set(true);
      },
      error: () => this.favoritesLoaded.set(true),
    });
  }

  protected savePseudo(): void {
    if (this.pseudoForm.invalid) {
      this.pseudoForm.markAllAsTouched();
      return;
    }
    this.busy.set('pseudo');
    this.account.updatePseudo(this.pseudoForm.getRawValue().pseudo).subscribe({
      next: () => {
        this.busy.set(null);
        this.pseudoFeedback.set({ type: 'success', text: 'Pseudo mis à jour.' });
      },
      error: (err: unknown) => {
        this.busy.set(null);
        this.pseudoFeedback.set({ type: 'error', text: apiViolations(err)['pseudo'] ?? apiErrorMessage(err) });
      },
    });
  }

  protected savePassword(): void {
    this.passwordErrors.set({});
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.busy.set('password');
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.account.changePassword(currentPassword, newPassword).subscribe({
      next: (res) => {
        this.busy.set(null);
        this.passwordForm.reset();
        this.passwordFeedback.set({ type: 'success', text: res.message });
      },
      error: (err: unknown) => {
        this.busy.set(null);
        const violations = apiViolations(err);
        this.passwordErrors.set(violations);
        this.passwordFeedback.set(Object.keys(violations).length ? null : { type: 'error', text: apiErrorMessage(err) });
      },
    });
  }

  protected removeFavorite(video: Video): void {
    this.account.setFavorite(video.id, false).subscribe({
      next: () => this.favorites.update((list) => list.filter((v) => v.id !== video.id)),
    });
  }

  protected exportData(): void {
    this.busy.set('export');
    this.account.downloadExport().subscribe({
      next: () => {
        this.busy.set(null);
        this.exportFeedback.set({ type: 'success', text: 'Votre fichier a été téléchargé.' });
      },
      error: (err: unknown) => {
        this.busy.set(null);
        this.exportFeedback.set({ type: 'error', text: apiErrorMessage(err, "L'export a échoué, réessayez.") });
      },
    });
  }

  protected requestDeletion(): void {
    if (this.deletionForm.invalid) {
      this.deletionForm.markAllAsTouched();
      return;
    }
    this.busy.set('deletion');
    this.account.requestDeletion(this.deletionForm.getRawValue().password).subscribe({
      next: (res) => {
        this.busy.set(null);
        this.deletionForm.reset();
        this.deletionFeedback.set({ type: 'success', text: res.message });
      },
      error: (err: unknown) => {
        this.busy.set(null);
        const text =
          err instanceof HttpErrorResponse && err.status === 422
            ? (apiViolations(err)['password'] ?? 'Mot de passe incorrect.')
            : apiErrorMessage(err);
        this.deletionFeedback.set({ type: 'error', text });
      },
    });
  }
}
