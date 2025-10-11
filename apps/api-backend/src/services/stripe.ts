// Oracle Lumira - Stripe Service
import Stripe from 'stripe';
import { getProductById } from '../catalog';
import { CreatePaymentIntentRequest, Order } from '../types/payments';

// Lazy Stripe client to avoid throwing at import time
let stripeClient: Stripe | null = null;
export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  stripeClient = new Stripe(key, {
    apiVersion: '2024-06-20',
    typescript: true,
  });
  return stripeClient;
}

/**
 * Build Stripe options with idempotency key
 */
export function buildStripeOptions(req: any): { idempotencyKey: string } {
  // Generate idempotency key based on request data
  const requestId = req.headers['x-request-id'] || req.ip + Date.now();
  return {
    idempotencyKey: `oracle-lumira-${requestId}`
  };
}

export class StripeService {
  /**
   * Create a PaymentIntent for a product
   */
  static async createPaymentIntent(request: CreatePaymentIntentRequest) {
    const { productId, customerEmail, customerName, customerPhone, metadata = {} } = request;

    // Validate product exists
    const product = getProductById(productId);
    if (!product) {
      throw new Error(`Invalid product ID: ${productId}`);
    }

    try {
      // Create PaymentIntent with automatic payment methods
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: product.amountCents,
        currency: product.currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          productId,
          productName: product.name,
          level: product.level,
          customerEmail: customerEmail || '',
          customerName: customerName || '',        // 🆕 Store customer name
          customerPhone: customerPhone || '',      // 🆕 Store customer phone
          ...metadata,
        },
        description: `Oracle Lumira - ${product.name}`,
        statement_descriptor: 'ORACLE LUMIRA',
      });

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        amount: product.amountCents,
        currency: product.currency,
        productName: product.name,
      };
    } catch (error) {
      console.error('Stripe PaymentIntent creation failed:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Retrieve a PaymentIntent by ID
   */
  static async getPaymentIntent(paymentIntentId: string) {
    try {
      return await getStripe().paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Failed to retrieve PaymentIntent:', error);
      throw new Error('Payment intent not found');
    }
  }

  /**
   * Construct Stripe webhook event from request
   */
  static constructWebhookEvent(
    body: string | Buffer,
    signature: string,
    endpointSecret: string
  ) {
    try {
      return getStripe().webhooks.constructEvent(body, signature, endpointSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Handle successful payment
   */
  static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<Order> {
    const { metadata } = paymentIntent;
    
    // Create order record
    const order: Order = {
      id: paymentIntent.id,
      productId: metadata.productId,
      customerEmail: metadata.customerEmail || undefined,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'completed',
      paymentIntentId: paymentIntent.id,
      createdAt: new Date(paymentIntent.created * 1000),
      updatedAt: new Date(),
      completedAt: new Date(),
      metadata: {
        level: metadata.level,
        productName: metadata.productName,
      },
    };

    // TODO: Save order to database
    console.log('Order completed:', order);

    // TODO: Grant access to user (update user permissions, send welcome email, etc.)
    await StripeService.grantProductAccess(order);

    return order;
  }

  /**
   * Grant access to purchased product
   */
  static async grantProductAccess(order: Order) {
    const product = getProductById(order.productId);
    if (!product) {
      console.error('Cannot grant access: product not found', order.productId);
      return;
    }

    console.log(`Granting ${product.level} access for order ${order.id}`);
    
    // TODO: Implementation specifics:
    // 1. Update user role in database
    // 2. Send welcome email with access credentials
    // 3. Create user session for sanctuaire access
    // 4. Log access grant for audit

    // For now, just log the action
    console.log('Access granted successfully:', {
      orderId: order.id,
      level: product.level,
      customerEmail: order.customerEmail,
      features: product.features,
    });
  }
}
