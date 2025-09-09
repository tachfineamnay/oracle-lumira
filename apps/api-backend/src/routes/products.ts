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

// Note: Custom manual validation is implemented in handler to return
// specific error payloads expected by tests/clients.
// express-validator chains removed to avoid generic 'Validation failed' shape.

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
 * Requirements: Robust validation, detailed error logging, proper status codes
 */
router.post(
  '/create-payment-intent',
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const requestId = `req_${startTime}_${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      console.log(`[${requestId}] POST /api/products/create-payment-intent started`, {
        body: req.body,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Validate request body structure
      if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
        console.error(`[${requestId}] Invalid request body:`, { body: req.body });
        res.status(400).json({
          error: 'Invalid request body',
          code: 'INVALID_REQUEST_BODY',
          message: 'Request body must be a valid JSON object',
          timestamp: new Date().toISOString(),
          requestId,
        });
        return;
      }

      const { productId, customerEmail, metadata = {} } = req.body as CreatePaymentIntentRequest;
      
      // Detailed input validation
      if (!productId) {
        console.error(`[${requestId}] Missing productId:`, { body: req.body });
        res.status(400).json({
          error: 'Product ID is required',
          code: 'MISSING_PRODUCT_ID',
          message: 'The productId field is required and must be a non-empty string',
          validProductIds: Object.keys(PRODUCT_CATALOG),
          timestamp: new Date().toISOString(),
          requestId,
        });
        return;
      }

      // Validate product exists
      const product = getProductById(productId);
      if (!product) {
        console.error(`[${requestId}] Product not found:`, { 
          productId, 
          availableProducts: Object.keys(PRODUCT_CATALOG) 
        });
        res.status(404).json({
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
          message: `Product '${productId}' does not exist`,
          validProductIds: Object.keys(PRODUCT_CATALOG),
          timestamp: new Date().toISOString(),
          requestId,
        });
        return;
      }

      console.log(`[${requestId}] Product validated:`, {
        productId: product.id,
        name: product.name,
        amountCents: product.amountCents,
        currency: product.currency,
      });

      // Validate email if provided
      if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        console.error(`[${requestId}] Invalid email format:`, { customerEmail });
        res.status(400).json({
          error: 'Invalid email format',
          code: 'INVALID_EMAIL',
          message: 'Customer email must be a valid email address',
          timestamp: new Date().toISOString(),
          requestId,
        });
        return;
      }

      // Validate Stripe environment
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error(`[${requestId}] Missing STRIPE_SECRET_KEY environment variable`);
        res.status(502).json({
          error: 'Payment service configuration error',
          code: 'STRIPE_CONFIG_ERROR',
          message: 'Payment processing is temporarily unavailable',
          timestamp: new Date().toISOString(),
          requestId,
        });
        return;
      }

      console.log(`[${requestId}] Creating PaymentIntent with Stripe...`);

      // Create PaymentIntent via Stripe
      const paymentData = await StripeService.createPaymentIntent({
        productId,
        customerEmail,
        metadata: {
          ...metadata,
          source: 'spa-checkout',
          timestamp: new Date().toISOString(),
          requestId,
        },
      });

      console.log(`[${requestId}] PaymentIntent created successfully:`, {
        paymentIntentId: paymentData.paymentIntentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
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
          requestId,
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

      const processingTime = Date.now() - startTime;
      console.log(`[${requestId}] SUCCESS - PaymentIntent created:`, {
        orderId: response.orderId,
        productId,
        amount: response.amount,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json(response);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Detailed error logging with context
      console.error(`[${requestId}] ERROR - PaymentIntent creation failed:`, {
        error: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        request: {
          body: req.body,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
      });

      // Categorize error types and return appropriate status codes
      if (error instanceof Error) {
        // Stripe-specific errors
        if (error.message.includes('Invalid product ID')) {
          res.status(404).json({
            error: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId,
          });
          return;
        }

        // Stripe API errors (payment service down, invalid keys, etc.)
        if (error.message.includes('Stripe') || error.message.includes('payment intent')) {
          res.status(502).json({
            error: 'Payment service error',
            code: 'STRIPE_SERVICE_ERROR',
            message: 'Payment processing is temporarily unavailable. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            timestamp: new Date().toISOString(),
            requestId,
          });
          return;
        }

        // Network or timeout errors
        if (error.message.includes('timeout') || error.message.includes('network')) {
          res.status(502).json({
            error: 'Service timeout',
            code: 'SERVICE_TIMEOUT',
            message: 'Request timeout. Please try again.',
            timestamp: new Date().toISOString(),
            requestId,
          });
          return;
        }

        // Validation errors (should be caught earlier, but fallback)
        if (error.message.includes('validation') || error.message.includes('invalid')) {
          res.status(400).json({
            error: 'Invalid request data',
            code: 'VALIDATION_ERROR',
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId,
          });
          return;
        }
      }

      // Generic 500 for unhandled errors
      const sanitized = sanitizeError(error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing your request',
        details: process.env.NODE_ENV === 'development' ? sanitized : undefined,
        timestamp: new Date().toISOString(),
        requestId,
      });
    }
  }
);

/**
 * GET /api/products/order/:orderId
 * Get product order status and details
 */
// Internal handler to serve both /order/:orderId and /orders/:orderId
async function getOrderHandler(req: Request, res: Response): Promise<void> {
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

      // Fallback without webhooks: check live status from Stripe
      try {
        if (order.status === 'pending' && order.paymentIntentId) {
          const pi = await StripeService.getPaymentIntent(order.paymentIntentId);
          if (pi.status === 'succeeded') {
            order.status = 'completed';
            order.completedAt = new Date();
            order.updatedAt = new Date();
            productOrders.set(order.id, order);
          } else if (pi.status === 'canceled' || pi.status === 'requires_payment_method') {
            order.status = 'failed';
            order.updatedAt = new Date();
            productOrders.set(order.id, order);
          }
        }
      } catch (stripeCheckError) {
        // Do not fail the request if Stripe check errors; just return current cached state
        console.warn('Stripe status check failed for order', orderId, stripeCheckError);
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

router.get('/order/:orderId', ...getOrderValidators, getOrderHandler);
// Alias for frontend compatibility
router.get('/orders/:orderId', ...getOrderValidators, getOrderHandler);

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
