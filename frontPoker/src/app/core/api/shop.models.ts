/** Boutique v2.0 — montants en centimes TTC (comme l'API) */

export type ProductCategory = 'livre' | 'accessoire';
export type OrderStatus = 'en_attente' | 'payee' | 'expediee' | 'annulee';

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: ProductCategory;
  categoryLabel: string;
  priceCents: number;
  vatRate: '5.5' | '20';
  /** Quantité commandable (plafonnée par commande) ; 0 = rupture */
  available: number;
  imageUrl: string | null;
  excerpt: string;
  description?: string | null;
}

export interface ProductList {
  items: Product[];
  categories: { value: ProductCategory; label: string; count: number }[];
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  country: string;
}

export interface OrderPayload extends ShippingAddress {
  items: { slug: string; quantity: number }[];
  phone: string | null;
  acceptCgv: boolean;
}

export interface Order {
  reference: string;
  status: OrderStatus;
  statusLabel: string;
  createdAt: string;
  totalExclTaxCents: number;
  totalVatCents: number;
  totalInclTaxCents: number;
  shippingAddress: ShippingAddress;
  items: {
    productName: string;
    productSlug: string | null;
    quantity: number;
    unitPriceInclTaxCents: number;
    vatRate: string;
    lineInclTaxCents: number;
  }[];
  payment?: { redirectUrl: string | null };
}
