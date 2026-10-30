export type PremiumPlanCode = 'mensuel' | 'annuel';

export interface PremiumPlan {
  code: PremiumPlanCode;
  label: string;
  months: number;
  /** Prix TTC en centimes */
  priceCents: number;
  monthlyEquivalentCents: number;
  /** Économie par rapport au paiement mensuel */
  savingPercent: number;
}

export interface PremiumPlans {
  currency: string;
  /** false tant que le paiement en ligne n'est pas ouvert */
  paymentEnabled: boolean;
  plans: PremiumPlan[];
}

export interface PremiumSubscribeResponse {
  message: string;
  status: string;
  redirectUrl: string | null;
  premium: boolean;
  premiumUntil: string | null;
}

/** 12,34 € à partir de centimes */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
