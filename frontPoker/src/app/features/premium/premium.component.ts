import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/api/api.service';
import { PremiumPlan, PremiumPlanCode, PremiumPlans, formatPrice } from '../../core/api/premium.models';
import { PremiumService, isPaymentUnavailable } from '../../core/api/premium.service';
import { AuthService } from '../../core/auth/auth.service';

type Feedback = { type: 'info' | 'success' | 'error'; text: string };

/**
 * Abonnement Premium : avantages, formules, souscription (paiement en ligne pas encore ouvert).
 */
@Component({
  selector: 'app-premium',
  imports: [RouterLink, DatePipe],
  templateUrl: './premium.component.html',
  styleUrl: './premium.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumComponent {
  private readonly premium = inject(PremiumService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly plans = signal<PremiumPlans | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal<PremiumPlanCode | null>(null);
  protected readonly feedback = signal<Feedback | null>(null);

  protected readonly benefits = [
    { icon: '🎬', title: 'Vidéos expert', text: 'Toutes les vidéos de niveau avancé débloquées : ranges, 3-bet pots, jeu en position et ICM.' },
    { icon: '♠', title: 'Contenus avancés', text: 'Analyses de mains et stratégies de tournoi pour passer un cap à la table.' },
    { icon: '★', title: 'En avant-première', text: 'Les nouvelles vidéos Premium dès leur mise en ligne.' },
    { icon: '❤', title: 'Soutenir la communauté', text: 'Votre abonnement finance un site sans publicité intrusive.' },
  ];

  protected readonly formatPrice = formatPrice;

  constructor() {
    this.premium.getPlans().subscribe({
      next: (plans) => this.plans.set(plans),
      error: (err: unknown) => this.error.set(apiErrorMessage(err, 'Impossible de charger les offres Premium.')),
    });
  }

  protected subscribe(plan: PremiumPlan): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/connexion'], { queryParams: { returnUrl: '/premium' } });
      return;
    }

    this.busy.set(plan.code);
    this.feedback.set(null);
    this.premium.subscribe(plan.code).subscribe({
      next: (res) => {
        this.busy.set(null);
        if (res.redirectUrl) {
          window.location.assign(res.redirectUrl);
          return;
        }
        this.feedback.set({ type: 'success', text: res.message });
        this.auth.loadCurrentUser().subscribe();
      },
      error: (err: unknown) => {
        this.busy.set(null);
        this.feedback.set(
          isPaymentUnavailable(err)
            ? { type: 'info', text: 'Le paiement en ligne sera bientôt disponible. Merci de votre intérêt, revenez très vite !' }
            : { type: 'error', text: apiErrorMessage(err, 'La souscription a échoué, réessayez.') },
        );
      },
    });
  }
}
