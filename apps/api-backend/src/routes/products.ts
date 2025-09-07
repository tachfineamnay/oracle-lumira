// Oracle Lumira - Product Purchase Routes (SPA Checkout)
import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { StripeService } from '../services/stripe';
import { getProductById, validateProductId, PRODUCT_CATALOG } from '../catalog';
import { 
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  OrderStatusResponse,
  Order
} from '../types/payments';
import { validateRequest, createValidationChain, sanitizeError } from '../middleware/validation';
import Stripe from 'stripe';

const router = Router();

// Temporary in-memory storage for orders (replace with database)
const productOrders: Map<string, Order> = new Map();

// Validation chains with proper typing
const createPaymentIntentValidators = createValidationChain([
  body('productId')
    .isString()
    .trim()
    .isIn(Object.keys(PRODUCT_CATALOG))
    .withMessage('Invalid product ID. Must be one of: ' + Object.keys(PRODUCT_CATALOG).join(', ')),
  body('customerEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
]);

const getOrderValidators = createValidationChain([
  param('orderId')
    .isString()
    .isLength({ min: 1 })
    .trim()
    .withMessage('Order ID is required'),
]);

/**
 * POST /api/products/create-payment-intent
 * Create a PaymentIntent for a specific product purchase
 */
router.post(
  '/create-payment-intent',
  ...createPaymentIntentValidators,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, customerEmail, metadata = {} } = req.body as CreatePaymentIntentRequest;
      const product = getProductById(productId)!; // Safe after validation

      // Create PaymentIntent via Stripe
      const paymentData = await StripeService.createPaymentIntent({
        productId,
        customerEmail,
        metadata: {
          ...metadata,
          source: 'spa-checkout',
          timestamp: new Date().toISOString(),
        },
      });

      // Create pending order
      const order: Order = {
        id: paymentData.paymentIntentId,
        productId,
        customerEmail,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        paymentIntentId: paymentData.paymentIntentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          productName: product.name,
          level: product.level,
        },
      };

      // Store order (temporary - replace with DB)
      productOrders.set(order.id, order);

      const response: CreatePaymentIntentResponse = {
        clientSecret: paymentData.clientSecret,
        orderId: paymentData.paymentIntentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        productName: paymentData.productName,
      };

      console.log('Product PaymentIntent created:', {
        orderId: response.orderId,
        productId,
        amount: response.amount,
        timestamp: new Date().toISOString(),
      });

      res.json(response);
    } catch (error) {
      console.error('Create Product PaymentIntent error:', error);
      const sanitized = sanitizeError(error);
      res.status(500).json({
        error: 'Failed to create payment intent',
        ...sanitized,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * GET /api/products/order/:orderId
 * Get product order status and details
 */
router.get(
  '/order/:orderId',
  ...getOrderValidators,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;

      // Get order from storage (replace with DB query)
      const order = productOrders.get(orderId);
      if (!order) {
        res.status(404).json({
          error: 'Order not found',
          orderId,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get product details
      const product = getProductById(order.productId);
      if (!product) {
        console.error('Product configuration error for order:', orderId, 'productId:', order.productId);
        res.status(500).json({
          error: 'Product configuration error',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if payment is completed and access should be granted
      const accessGranted = order.status === 'completed';
      const sanctuaryUrl = accessGranted ? '/sanctuaire' : undefined;

      const response: OrderStatusResponse = {
        order,
        product: {
          id: product.id,
          name: product.name,
          level: product.level,
        },
        accessGranted,
        sanctuaryUrl,
      };

      res.json(response);
    } catch (error) {
      console.error('Get product order error:', error);
      const sanitized = sanitizeError(error);
      res.status(500).json({
        error: 'Failed to retrieve order',
        ...sanitized,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// Processed webhook events (simple idempotence - replace with DB)
const processedWebhookEvents = new Set<string>();

/**
 * POST /api/products/webhook
 * Handle Stripe webhooks for product purchases
 * Uses raw body parser and signature verification
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_PRODUCT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      res.status(500).json({ 
        error: 'Webhook configuration error',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!signature) {
      res.status(400).json({ 
        error: 'Missing stripe signature',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Construct and verify webhook event
    const event = StripeService.constructWebhookEvent(
      req.body,
      signature,
      endpointSecret
    );

    // Idempotence check - prevent processing same event twice
    if (processedWebhookEvents.has(event.id)) {
      console.log('Webhook event already processed:', event.id);
      res.json({ received: true, already_processed: true });
      return;
    }

    console.log('Product webhook event received:', event.type, event.id, {
      timestamp: new Date().toISOString(),
    });

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleProductPaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handleProductPaymentFailure(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handleProductPaymentCancellation(event.data.object);
        break;

      default:
        console.log('Unhandled product webhook event type:', event.type);
    }

    // Mark event as processed
    processedWebhookEvents.add(event.id);

    res.json({ received: true, event_type: event.type });
  } catch (error) {
    console.error('Product webhook error:', error);
    const sanitized = sanitizeError(error);
    res.status(400).json({
      error: 'Webhook processing failed',
      ...sanitized,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Handle successful product payment webhook
 * @param paymentIntent - Stripe PaymentIntent object from webhook
 */
async function handleProductPaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('✅ Processing product payment success:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
    timestamp: new Date().toISOString(),
  });

  try {
    // Update order status in memory store
    const order = productOrders.get(paymentIntent.id);
    if (order) {
      order.status = 'completed';
      order.completedAt = new Date();
      order.updatedAt = new Date();
      productOrders.set(order.id, order);
      
      console.log('Order updated to completed:', order.id);
    } else {
      console.warn('Order not found in memory store:', paymentIntent.id);
    }

    // Grant access via Stripe service
    const completedOrder = await StripeService.handlePaymentSuccess(paymentIntent);
    
    console.log('Product payment success fully processed:', {
      orderId: completedOrder.id,
      productId: paymentIntent.metadata?.product_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error processing product payment success:', error);
    throw error; // Re-throw to ensure webhook returns error status
  }
}

/**
 * Handle failed product payment webhook
 * @param paymentIntent - Stripe PaymentIntent object from webhook
 */
async function handleProductPaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('❌ Processing product payment failure:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    last_payment_error: paymentIntent.last_payment_error,
    metadata: paymentIntent.metadata,
    timestamp: new Date().toISOString(),
  });

  try {
    const order = productOrders.get(paymentIntent.id);
    if (order) {
      order.status = 'failed';
      order.updatedAt = new Date();
      productOrders.set(order.id, order);
      
      console.log('Order updated to failed:', order.id);
    }

    // TODO: Send customer notification about payment failure
    // await notificationService.sendPaymentFailedEmail(paymentIntent);
  } catch (error) {
    console.error('Error processing product payment failure:', error);
  }
}

/**
 * Handle cancelled product payment webhook
 * @param paymentIntent - Stripe PaymentIntent object from webhook
 */
async function handleProductPaymentCancellation(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('🚫 Processing product payment cancellation:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    cancellation_reason: paymentIntent.cancellation_reason,
    metadata: paymentIntent.metadata,
    timestamp: new Date().toISOString(),
  });

  try {
    const order = productOrders.get(paymentIntent.id);
    if (order) {
      order.status = 'cancelled';
      order.updatedAt = new Date();
      productOrders.set(order.id, order);
      
      console.log('Order updated to cancelled:', order.id);
    }

    // TODO: Clean up any reserved inventory or resources
    // await inventoryService.releaseReservation(paymentIntent);
  } catch (error) {
    console.error('Error processing product payment cancellation:', error);
  }
}

export default router;
