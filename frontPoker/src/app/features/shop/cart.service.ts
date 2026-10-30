import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../../core/api/shop.models';

export interface CartLine {
  slug: string;
  name: string;
  /** Prix indicatif (affichage) : le prix facturé est recalculé par le serveur */
  priceCents: number;
  category: Product['category'];
  imageUrl: string | null;
  quantity: number;
  /** Plafond commandable connu lors de l'ajout */
  available: number;
}

const STORAGE_KEY = 'pw-cart';
const MAX_QUANTITY = 10;

/**
 * Panier de la boutique : signal persisté dans le navigateur (localStorage).
 * Il ne contient aucune donnée personnelle, seulement des références de produits.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly state = signal<CartLine[]>(readStorage());

  readonly lines = this.state.asReadonly();
  readonly count = computed(() => this.state().reduce((sum, l) => sum + l.quantity, 0));
  readonly totalCents = computed(() => this.state().reduce((sum, l) => sum + l.priceCents * l.quantity, 0));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
      } catch {
        // Stockage indisponible (navigation privée) : le panier reste en mémoire
      }
    });
  }

  add(product: Product, quantity = 1): void {
    const limit = Math.min(product.available, MAX_QUANTITY);
    if (limit < 1) {
      return;
    }
    this.state.update((lines) => {
      const existing = lines.find((l) => l.slug === product.slug);
      if (existing) {
        return lines.map((l) => (l === existing ? { ...l, quantity: Math.min(limit, l.quantity + quantity), available: limit } : l));
      }
      return [
        ...lines,
        {
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          category: product.category,
          imageUrl: product.imageUrl,
          quantity: Math.min(limit, quantity),
          available: limit,
        },
      ];
    });
  }

  setQuantity(slug: string, quantity: number): void {
    if (quantity < 1) {
      this.remove(slug);
      return;
    }
    this.state.update((lines) => lines.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(quantity, l.available, MAX_QUANTITY) } : l)));
  }

  remove(slug: string): void {
    this.state.update((lines) => lines.filter((l) => l.slug !== slug));
  }

  /** Met à jour prix et disponibilités avec le catalogue actuel ; retire les produits disparus */
  refresh(products: Product[]): void {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    this.state.update((lines) =>
      lines.flatMap((l) => {
        const p = bySlug.get(l.slug);
        if (!p || p.available < 1) {
          return [];
        }
        const available = Math.min(p.available, MAX_QUANTITY);
        return [{ ...l, name: p.name, priceCents: p.priceCents, imageUrl: p.imageUrl, available, quantity: Math.min(l.quantity, available) }];
      }),
    );
  }

  clear(): void {
    this.state.set([]);
  }
}

function readStorage(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((l): l is CartLine => typeof l?.slug === 'string' && Number.isInteger(l?.quantity)) : [];
  } catch {
    return [];
  }
}
