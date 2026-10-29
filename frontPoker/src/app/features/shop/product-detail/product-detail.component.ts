import { Component, effect, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/api/api.service';
import { Product } from '../../../core/api/shop.models';
import { ShopService } from '../../../core/api/shop.service';
import { CartService } from '../cart.service';
import { PricePipe } from '../price.pipe';

/**
 * Boutique v2.0 — Fiche produit (/boutique/:slug)
 */
@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, PricePipe],
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  private readonly shop = inject(ShopService);
  private readonly title = inject(Title);
  protected readonly cart = inject(CartService);

  readonly slug = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly quantity = signal(1);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly added = signal(false);

  constructor() {
    effect(() => this.load(this.slug()));
  }

  protected changeQuantity(delta: number): void {
    const max = this.product()?.available ?? 1;
    this.quantity.update((q) => Math.max(1, Math.min(max, q + delta)));
  }

  protected addToCart(product: Product): void {
    this.cart.add(product, this.quantity());
    this.added.set(true);
  }

  private load(slug: string): void {
    this.product.set(null);
    this.notFound.set(false);
    this.error.set(null);
    this.quantity.set(1);
    this.added.set(false);

    this.shop.getProduct(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.title.setTitle(`${product.name} — Boutique — Poker Winners`);
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.notFound.set(true);
          return;
        }
        this.error.set(apiErrorMessage(err, 'Impossible de charger ce produit.'));
      },
    });
  }
}
