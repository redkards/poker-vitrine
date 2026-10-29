import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage, apiViolations } from '../../../core/api/api.service';
import { ShopService } from '../../../core/api/shop.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../cart.service';
import { PricePipe } from '../price.pipe';

/**
 * Boutique v2.0 — Panier et récapitulatif de commande avec adresse de livraison.
 * Les prix affichés sont rafraîchis depuis le catalogue ; le serveur recalcule tout à la validation.
 */
@Component({
  selector: 'app-cart',
  imports: [ReactiveFormsModule, RouterLink, PricePipe],
  templateUrl: './cart.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly shop = inject(ShopService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  protected readonly countries = [
    { code: 'FR', label: 'France' },
    { code: 'BE', label: 'Belgique' },
    { code: 'LU', label: 'Luxembourg' },
    { code: 'MC', label: 'Monaco' },
  ];

  protected readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    addressLine1: ['', [Validators.required, Validators.maxLength(180)]],
    addressLine2: ['', Validators.maxLength(180)],
    postalCode: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z \-]{4,10}$/)]],
    city: ['', [Validators.required, Validators.maxLength(120)]],
    country: ['FR', Validators.required],
    phone: ['', Validators.pattern(/^\+?[0-9 .\-()]{6,30}$/)],
    acceptCgv: [false, Validators.requiredTrue],
  });

  protected readonly errors = signal<Record<string, string>>({});
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  ngOnInit(): void {
    if (this.cart.lines().length) {
      this.shop.getProducts().subscribe({ next: (list) => this.cart.refresh(list.items) });
    }
  }

  protected submit(): void {
    this.errors.set({});
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.shop
      .createOrder({
        ...value,
        addressLine2: value.addressLine2 || null,
        phone: value.phone || null,
        items: this.cart.lines().map((l) => ({ slug: l.slug, quantity: l.quantity })),
      })
      .subscribe({
        next: (order) => {
          this.cart.clear();
          if (order.payment?.redirectUrl) {
            window.location.assign(order.payment.redirectUrl);
            return;
          }
          void this.router.navigate(['/mon-espace/commandes'], { queryParams: { commande: order.reference } });
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          const violations = apiViolations(err);
          this.errors.set(violations);
          // Erreurs hors formulaire (panier, stock…) : message général
          const other = Object.keys(violations).filter((k) => !(k in value));
          this.error.set(!Object.keys(violations).length ? apiErrorMessage(err) : other.length ? violations[other[0]] : null);
        },
      });
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }
}
