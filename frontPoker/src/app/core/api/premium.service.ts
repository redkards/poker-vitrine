import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PremiumPlanCode, PremiumPlans, PremiumSubscribeResponse } from './premium.models';

/**
 * Abonnement Premium : formules et souscription.
 */
@Injectable({ providedIn: 'root' })
export class PremiumService {
  private readonly api = inject(ApiService);

  getPlans(): Observable<PremiumPlans> {
    return this.api.get<PremiumPlans>('premium/plans');
  }

  subscribe(plan: PremiumPlanCode): Observable<PremiumSubscribeResponse> {
    return this.api.post<PremiumSubscribeResponse>('premium/subscribe', { plan });
  }
}

/** 503 : paiement en ligne pas encore ouvert */
export function isPaymentUnavailable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 503;
}
