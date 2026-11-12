import { Order } from '../models/Order';
import { ProductOrder } from '../models/ProductOrder';
import { getLevelMetadata } from '../config/entitlements';

/**
 * Oracle Lumira - Sanctuaire entitlements (single source of truth)
 *
 * Entitlements are derived from *recorded purchases only*:
 *  - Order:      paid / completed / awaiting_validation
 *  - ProductOrder: completed
 *
 * A pending, failed, cancelled or merely "processing" payment grants nothing.
 * Entitlements never depend on how the client authenticated: they depend on the
 * email that was verified through the magic link.
 */

const LEVEL_NUMBER_BY_PRODUCT: Record<string, number> = {
  initie: 1,
  mystique: 2,
  profond: 3,
  integrale: 4,
};

const GRANTED_PRODUCTS_BY_LEVEL: Record<number, string[]> = {
  1: ['initie'],
  2: ['initie', 'mystique'],
  3: ['initie', 'mystique', 'profond'],
  4: ['initie', 'mystique', 'profond', 'integrale'],
};

export const PAID_ORDER_STATUSES = ['paid', 'completed', 'awaiting_validation'];
export const COMPLETED_PRODUCT_ORDER_STATUSES = ['completed'];

export function levelNumberFromProduct(productId?: string): number {
  return LEVEL_NUMBER_BY_PRODUCT[String(productId || '').toLowerCase()] || 1;
}

export function levelNumberFromPurchase(purchase: any): number {
  if (typeof purchase?.level === 'number' && purchase.level >= 1 && purchase.level <= 4) {
    return purchase.level;
  }
  if (typeof purchase?.metadata?.level === 'number' && purchase.metadata.level >= 1) {
    return Math.min(purchase.metadata.level, 4);
  }
  return levelNumberFromProduct(purchase?.metadata?.level || purchase?.productId);
}

/** Owning level N grants every lower level (historical entitlements preserved). */
export function grantedProductsForLevel(level: number): string[] {
  return GRANTED_PRODUCTS_BY_LEVEL[level] || GRANTED_PRODUCTS_BY_LEVEL[1];
}

export interface SanctuaireEntitlements {
  products: string[];
  highestLevel: string | null;
  levelMetadata: { name: string; color: string; icon: string } | null;
  highestLevelNumber: number;
  orderCount: number;
}

export function normalizeSessionEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

export async function computeEntitlements(userId: any, email: string): Promise<SanctuaireEntitlements> {
  const normalizedEmail = normalizeSessionEmail(email);

  const scopedOrders = await Order.find({
    $or: [
      { userId },
      { userEmail: normalizedEmail },
      { 'checkout.customer.email': normalizedEmail },
      { 'formData.email': normalizedEmail },
    ],
    status: { $in: PAID_ORDER_STATUSES },
  });

  const productOrders = await ProductOrder.find({
    customerEmail: normalizedEmail,
    status: { $in: COMPLETED_PRODUCT_ORDER_STATUSES },
  });

  let highestLevelNumber = 0;
  const products = new Set<string>();

  // A single purchase can be recorded twice (ProductOrder created by checkout +
  // legacy Order created for the Expert Desk, both sharing paymentIntentId).
  // Entitlements must be counted once per purchase, never per document.
  const purchases = new Map<string, any>();
  for (const purchase of [...(scopedOrders as any[]), ...(productOrders as any[])]) {
    const key = String(
      purchase?.paymentIntentId || purchase?.stripeSessionId || purchase?._id || Math.random()
    );
    const existing = purchases.get(key);
    if (!existing) {
      purchases.set(key, purchase);
    }
  }

  for (const purchase of purchases.values()) {
    const level = levelNumberFromPurchase(purchase);
    highestLevelNumber = Math.max(highestLevelNumber, level);
    grantedProductsForLevel(level).forEach((productId) => products.add(productId));
  }

  const productList = Array.from(products);
  const highestLevel = productList.length > 0 ? productList[productList.length - 1] : null;

  return {
    products: productList,
    highestLevel,
    levelMetadata: highestLevel ? getLevelMetadata(highestLevel) : null,
    highestLevelNumber,
    orderCount: purchases.size,
  };
}
