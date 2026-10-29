import { Component, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api.service';
import { MemberProfile, hasPublicProfile } from '../../../core/api/member.models';
import { MemberService } from '../../../core/api/member.service';
import { SeoService } from '../../../core/seo/seo.service';

/**
 * v1.1 — Profil public d'un membre (/membres/:pseudo) : pseudo, ancienneté, nombre de messages.
 */
@Component({
  selector: 'app-member-profile',
  imports: [RouterLink, DatePipe],
  templateUrl: './member-profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './member-profile.component.scss',
})
export class MemberProfileComponent {
  private readonly members = inject(MemberService);
  private readonly seo = inject(SeoService);

  readonly pseudo = input.required<string>();

  protected readonly member = signal<MemberProfile | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  private loadSub?: Subscription;

  constructor() {
    effect(() => this.load(this.pseudo()));
  }

  private load(pseudo: string): void {
    this.loadSub?.unsubscribe();
    this.member.set(null);
    this.loading.set(true);
    this.notFound.set(false);
    this.error.set(null);

    if (!hasPublicProfile(pseudo)) {
      this.showNotFound();
      return;
    }

    this.loadSub = this.members.getProfile(pseudo).subscribe({
      next: (member) => {
        this.member.set(member);
        this.loading.set(false);
        const messages = `${member.postCount} message${member.postCount > 1 ? 's' : ''}`;
        this.seo.update({
          title: `${member.pseudo} — Membre — Poker Winners`,
          description: `Profil de ${member.pseudo}, membre de la communauté Poker Winners : ${messages} sur le forum poker.`,
          type: 'profile',
        });
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.showNotFound();
          return;
        }
        this.loading.set(false);
        this.error.set(apiErrorMessage(err, 'Impossible de charger ce profil.'));
      },
    });
  }

  private showNotFound(): void {
    this.loading.set(false);
    this.notFound.set(true);
    this.seo.update({ title: 'Membre introuvable — Poker Winners' });
  }
}
