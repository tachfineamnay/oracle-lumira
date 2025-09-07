// Oracle Lumira - Product Purchase Routes (SPA Checkout)
import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { StripeService } from '../services/stripe';
import { getProductById, validateProductId } from '../catalog';
import { 
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  OrderStatusResponse,
  Order
} from '../types/payments';

const router = Router();

// Temporary in-memory storage for orders (replace with database)
const productOrders: Map<string, Order> = new Map();

/**
 * POST /api/products/create-payment-intent
 * Create a PaymentIntent for a specific product purchase
 */
router.post(
  '/create-payment-intent',
  [
    body('productId')
      .isString()
      .custom((value) => {
        if (!validateProductId(value)) {
          throw new Error('Invalid product ID');
        }
        return true;
      }),
    body('customerEmail')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { productId, customerEmail, metadata } = req.body as CreatePaymentIntentRequest;
      const product = getProductById(productId)!;

      // Create PaymentIntent via Stripe
      const paymentData = await StripeService.createPaymentIntent({
        productId,
        customerEmail,
        metadata,
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
      });

      res.json(response);
    } catch (error) {
      console.error('Create Product PaymentIntent error:', error);
      res.status(500).json({
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error',
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
  [
    param('orderId').isString().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Invalid order ID',
          details: errors.array(),
        });
      }

      const { orderId } = req.params;

      // Get order from storage (replace with DB query)
      const order = productOrders.get(orderId);
      if (!order) {
        return res.status(404).json({
          error: 'Order not found',
        });
      }

      // Get product details
      const product = getProductById(order.productId);
      if (!product) {
        return res.status(500).json({
          error: 'Product configuration error',
        });
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
      res.status(500).json({
        error: 'Failed to retrieve order',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /api/products/webhook
 * Handle Stripe webhooks for product purchases
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_PRODUCT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook configuration error' });
    }

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe signature' });
    }

    // Construct and verify webhook event
    const event = StripeService.constructWebhookEvent(
      req.body,
      signature,
      endpointSecret
    );

    console.log('Product webhook event received:', event.type, event.id);

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

    res.json({ received: true });
  } catch (error) {
    console.error('Product webhook error:', error);
    res.status(400).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Handle successful product payment webhook
 */
async function handleProductPaymentSuccess(paymentIntent: any) {
  console.log('Processing product payment success:', paymentIntent.id);

  try {
    // Update order status
    const order = productOrders.get(paymentIntent.id);
    if (order) {
      order.status = 'completed';
      order.completedAt = new Date();
      order.updatedAt = new Date();
      productOrders.set(order.id, order);
    }

    // Grant access via Stripe service
    const completedOrder = await StripeService.handlePaymentSuccess(paymentIntent);
    
    console.log('Product payment success processed:', completedOrder.id);
  } catch (error) {
    console.error('Error processing product payment success:', error);
  }
}

/**
 * Handle failed product payment webhook
 */
async function handleProductPaymentFailure(paymentIntent: any) {
  console.log('Processing product payment failure:', paymentIntent.id);

  const order = productOrders.get(paymentIntent.id);
  if (order) {
    order.status = 'failed';
    order.updatedAt = new Date();
    productOrders.set(order.id, order);
  }
}

/**
 * Handle cancelled product payment webhook
 */
async function handleProductPaymentCancellation(paymentIntent: any) {
  console.log('Processing product payment cancellation:', paymentIntent.id);

  const order = productOrders.get(paymentIntent.id);
  if (order) {
    order.status = 'cancelled';
    order.updatedAt = new Date();
    productOrders.set(order.id, order);
  }
}

export default router;
