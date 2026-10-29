import { Component, DestroyRef, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api.service';
import { Product, ProductCategory, ProductList } from '../../../core/api/shop.models';
import { ShopService } from '../../../core/api/shop.service';
import { CartService } from '../cart.service';
import { PricePipe } from '../price.pipe';

const CATEGORIES: ProductCategory[] = ['livre', 'accessoire'];

/**
 * Boutique v2.0 — Catalogue filtrable par catégorie (?categorie=livre|accessoire)
 */
@Component({
  selector: 'app-product-list',
  imports: [RouterLink, PricePipe],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly shop = inject(ShopService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly cart = inject(CartService);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<ProductList['categories']>([]);
  protected readonly category = signal<ProductCategory | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly added = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        tap((params) => {
          const category = params.get('categorie') as ProductCategory | null;
          this.category.set(category && CATEGORIES.includes(category) ? category : null);
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() => this.shop.getProducts(this.category())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.products.set(result.items);
          this.categories.set(result.categories);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(apiErrorMessage(err, 'Impossible de charger la boutique.'));
          this.loading.set(false);
        },
      });
  }

  protected setCategory(category: ProductCategory | null): void {
    void this.router.navigate([], { queryParams: { categorie: category }, queryParamsHandling: 'merge' });
  }

  protected addToCart(product: Product): void {
    this.cart.add(product);
    this.added.set(product.slug);
  }
}
