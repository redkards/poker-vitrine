import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, OrderPayload, Product, ProductCategory, ProductList } from './shop.models';

/**
 * Boutique v2.0 : catalogue et commandes. Le serveur recalcule toujours prix, TVA et stock.
 */
@Injectable({ providedIn: 'root' })
export class ShopService {
  private readonly api = inject(ApiService);

  getProducts(category?: ProductCategory | null): Observable<ProductList> {
    return this.api.get<ProductList>('shop/products', category ? { category } : undefined);
  }

  getProduct(slug: string): Observable<Product> {
    return this.api.get<Product>(`shop/products/${encodeURIComponent(slug)}`);
  }

  createOrder(payload: OrderPayload): Observable<Order> {
    return this.api.post<Order>('shop/orders', payload);
  }

  getMyOrders(): Observable<Order[]> {
    return this.api.get<Order[]>('me/orders');
  }
}
