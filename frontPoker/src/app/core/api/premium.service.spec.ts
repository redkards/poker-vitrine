import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { PremiumPlans, formatPrice } from './premium.models';
import { PremiumService, isPaymentUnavailable } from './premium.service';

describe('PremiumService', () => {
  let service: PremiumService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PremiumService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('charge les formules GET /api/premium/plans', () => {
    const plans: PremiumPlans = {
      currency: 'EUR',
      paymentEnabled: false,
      plans: [{ code: 'mensuel', label: 'Mensuel', months: 1, priceCents: 499, monthlyEquivalentCents: 499, savingPercent: 0 }],
    };
    let result: PremiumPlans | undefined;

    service.getPlans().subscribe((p) => (result = p));

    const req = http.expectOne(`${environment.apiUrl}/premium/plans`);
    expect(req.request.method).toBe('GET');
    req.flush(plans);
    expect(result).toEqual(plans);
  });

  it('souscrit POST /api/premium/subscribe et reconnaît le 503 « paiement fermé »', () => {
    let error: unknown;

    service.subscribe('annuel').subscribe({ error: (e) => (error = e) });

    const req = http.expectOne(`${environment.apiUrl}/premium/subscribe`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ plan: 'annuel' });
    req.flush({ code: 'payment_unavailable', message: "Le paiement en ligne n'est pas encore ouvert." }, { status: 503, statusText: 'Service Unavailable' });

    expect(isPaymentUnavailable(error)).toBeTrue();
    expect(isPaymentUnavailable(new HttpErrorResponse({ status: 500 }))).toBeFalse();
  });

  it('formate les prix en euros', () => {
    expect(formatPrice(4900).replace(/\s/g, ' ')).toBe('49,00 €');
  });
});
