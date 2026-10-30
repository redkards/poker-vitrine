import { Component, OnInit, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/api/api.service';
import { Order } from '../../../core/api/shop.models';
import { ShopService } from '../../../core/api/shop.service';
import { PricePipe } from '../price.pipe';

/**
 * Boutique v2.0 — Mes commandes (espace membre : /mon-espace/commandes)
 */
@Component({
  selector: 'app-my-orders',
  imports: [DatePipe, RouterLink, PricePipe],
  templateUrl: './my-orders.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './my-orders.component.scss',
})
export class MyOrdersComponent implements OnInit {
  private readonly shop = inject(ShopService);

  /** Référence de la commande qui vient d'être passée (?commande=) */
  readonly commande = input<string | undefined>();

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.shop.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(apiErrorMessage(err, 'Impossible de charger vos commandes.'));
        this.loading.set(false);
      },
    });
  }
}
