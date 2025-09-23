// Oracle Lumira - Product Purchase Routes (SPA Checkout)
import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { StripeService } from '../services/stripe';
import { getProductById, validateProductId, PRODUCT_CATALOG, getAllProducts } from '../catalog';
import { 
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  OrderStatusResponse
} from '../types/payments';
import { validateRequest, createValidationChain, sanitizeError } from '../middleware/validation';
import Stripe from 'stripe';
import { ProductOrder } from '../models/ProductOrder';
import { User } from '../models/User';
import { Order } from '../models/Order';

const router = Router();

// Orders are persisted in MongoDB (ProductOrder model)

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

      // Persist pending order in MongoDB
      await ProductOrder.create({
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
      });

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

      // Load order from Mongo by paymentIntentId (keeps API compatibility)
      const orderDoc = await ProductOrder.findOne({ paymentIntentId: orderId });
      if (!orderDoc) {
        res.status(404).json({
          error: 'Order not found',
          orderId,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Fallback without webhooks: check live status from Stripe
      try {
        if (orderDoc.paymentIntentId) {
          const pi = await StripeService.getPaymentIntent(orderDoc.paymentIntentId);
          if (pi.status === 'succeeded' && orderDoc.status !== 'completed') {
            orderDoc.status = 'completed' as any;
            orderDoc.completedAt = new Date();
            orderDoc.updatedAt = new Date();
            await orderDoc.save();
            await ensureDeskOrderForPayment(pi as any);
          } else if ((pi.status === 'canceled' || pi.status === 'requires_payment_method') && orderDoc.status !== 'completed') {
            orderDoc.status = 'failed' as any;
            orderDoc.updatedAt = new Date();
            await orderDoc.save();
          }
        }
      } catch (stripeCheckError) {
        // Do not fail the request if Stripe check errors; just return current cached state
        console.warn('Stripe status check failed for order', orderId, stripeCheckError);
      }

      // Get product details
      const product = getProductById(orderDoc.productId);
      if (!product) {
        console.error('Product configuration error for order:', orderId, 'productId:', orderDoc.productId);
        res.status(500).json({
          error: 'Product configuration error',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if payment is completed and access should be granted
      const accessGranted = orderDoc.status === 'completed';
      const sanctuaryUrl = accessGranted ? '/sanctuaire' : undefined;

      const response: OrderStatusResponse = {
        order: {
          id: orderDoc.paymentIntentId,
          productId: orderDoc.productId,
          customerEmail: orderDoc.customerEmail,
          amount: orderDoc.amount,
          currency: orderDoc.currency,
          status: orderDoc.status as any,
          paymentIntentId: orderDoc.paymentIntentId,
          createdAt: orderDoc.createdAt as any,
          updatedAt: orderDoc.updatedAt as any,
          completedAt: orderDoc.completedAt as any,
          metadata: orderDoc.metadata || {},
        },
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
    // Update order status in DB
    const orderDoc = await ProductOrder.findOne({ paymentIntentId: paymentIntent.id });
    if (orderDoc) {
      orderDoc.status = 'completed' as any;
      orderDoc.completedAt = new Date();
      orderDoc.updatedAt = new Date();
      await orderDoc.save();
      console.log('Order updated to completed:', orderDoc.paymentIntentId);
    } else {
      console.warn('Order not found in DB for paymentIntent:', paymentIntent.id);
    }

    // Grant access via Stripe service
    const completedOrder = await StripeService.handlePaymentSuccess(paymentIntent);
    await ensureDeskOrderForPayment(paymentIntent);
    
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

// Create a minimal Order document for Expert Desk if none exists yet
async function ensureDeskOrderForPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    const existing = await Order.findOne({ paymentIntentId: paymentIntent.id });
    if (existing) return;

    const email = (paymentIntent.metadata?.customerEmail || '').toLowerCase() || `client+${paymentIntent.id}@noemail.local`;
    const levelKey = (paymentIntent.metadata?.level || '').toLowerCase();

    const levelMap: Record<string, { num: 1|2|3|4; name: 'Simple'|'Intuitive'|'Alchimique'|'Intégrale' }> = {
      initie: { num: 1, name: 'Simple' },
      mystique: { num: 2, name: 'Intuitive' },
      profond: { num: 3, name: 'Alchimique' },
      integrale: { num: 4, name: 'Intégrale' },
    };
    const levelInfo = levelMap[levelKey] || { num: 1 as 1, name: 'Simple' as const };

    // Find or create a basic user
    let user = await User.findOne({ email });
    if (!user) {
      const local = email.split('@')[0] || 'Client';
      user = await User.create({
        email,
        firstName: local.substring(0, 1).toUpperCase() + local.substring(1, Math.min(local.length, 20)) || 'Client',
        lastName: 'Stripe',
      });
    }

    await Order.create({
      userId: user._id,
      userEmail: user.email,
      level: levelInfo.num,
      levelName: levelInfo.name,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'paid',
      paymentIntentId: paymentIntent.id,
      formData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('ensureDeskOrderForPayment error:', err);
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
    const orderDocFail = await ProductOrder.findOne({ paymentIntentId: paymentIntent.id });
    if (orderDocFail) {
      orderDocFail.status = 'failed' as any;
      orderDocFail.updatedAt = new Date();
      await orderDocFail.save();
      console.log('Order updated to failed:', orderDocFail.paymentIntentId);
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
    const orderDocCancel = await ProductOrder.findOne({ paymentIntentId: paymentIntent.id });
    if (orderDocCancel) {
      orderDocCancel.status = 'cancelled' as any;
      orderDocCancel.updatedAt = new Date();
      await orderDocCancel.save();
      console.log('Order updated to cancelled:', orderDocCancel.paymentIntentId);
    }

    // TODO: Clean up any reserved inventory or resources
    // await inventoryService.releaseReservation(paymentIntent);
  } catch (error) {
    console.error('Error processing product payment cancellation:', error);
  }
}

/**
 * GET /api/products
 * Return the product catalog
 */
router.get('/', (req: Request, res: Response) => {
  const products = getAllProducts();
  res.json({ products });
});

export default router;

/**
 * POST /api/products/create-order
 * Créer une commande directe pour les tests (bypasse Stripe)
 */
router.post('/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, amount, formData, metadata } = req.body;
    
    if (!level || !amount || !formData) {
      res.status(400).json({ error: 'level, amount, and formData are required' });
      return;
    }

    // Générer un ID de commande unique
    const orderId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Trouver ou créer l'utilisateur
    let user = await User.findOne({ email: formData.email });
    if (!user) {
      user = await User.create({
        email: formData.email,
        firstName: formData.firstName || 'Test',
        lastName: formData.lastName || 'User'
      });
    }

    // Mapping des niveaux
    const levelNames = {
      1: 'Simple',
      2: 'Intuitive', 
      3: 'Alchimique',
      4: 'Intégrale'
    };

    // Créer la commande pour Expert Desk
    const order = await Order.create({
      userId: user._id,
      userEmail: user.email,
      level: level,
      levelName: levelNames[level as keyof typeof levelNames] || 'Simple',
      amount: amount,
      currency: 'eur',
      status: 'pending',
      paymentIntentId: orderId,
      orderNumber: `ORD-${Date.now()}`,
      formData: formData,
      metadata: metadata || {}
    });

    console.log('✅ Test order created:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      level: order.level,
      client: `${formData.firstName} ${formData.lastName}`
    });

    res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      message: 'Test order created successfully'
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * POST /api/products/simulate-payment
 * Simuler un paiement réussi pour les tests
 */
router.post('/simulate-payment', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, status = 'paid' } = req.body;
    
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    // Mettre à jour le statut de la commande
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    order.status = status;
    if (status === 'paid') {
      order.paidAt = new Date();
    }
    await order.save();

    console.log('✅ Payment simulated:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status
    });

    res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      message: `Payment ${status} simulated successfully`
    });

  } catch (error) {
    console.error('Simulate payment error:', error);
    res.status(500).json({ error: 'Failed to simulate payment' });
  }
});
