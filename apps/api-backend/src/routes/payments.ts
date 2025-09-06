import express from 'express';
import Stripe from 'stripe';
import { Order } from '../models/Order';
import { Expert } from '../models/Expert';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Service pricing configuration
const SERVICE_PRICING = {
  basic: {
    name: 'Consultation Basique',
    price: 2900, // in cents
    duration: 30,
  },
  premium: {
    name: 'Consultation Premium', 
    price: 7900, // in cents
    duration: 60,
  },
  vip: {
    name: 'Consultation VIP',
    price: 14900, // in cents
    duration: 120,
  }
};

interface CreatePaymentIntentRequest {
  level: string;
  service: 'basic' | 'premium' | 'vip';
  expertId: string;
  userId?: string;
  customerEmail?: string;
  customerName?: string;
}

// Create payment intent
router.post('/create-payment-intent', async (req: express.Request, res: express.Response) => {
  try {
    const { level, service, expertId, userId, customerEmail, customerName }: CreatePaymentIntentRequest = req.body;

    // Validate service type
    if (!SERVICE_PRICING[service]) {
      return res.status(400).json({ 
        error: 'Invalid service type',
        validServices: Object.keys(SERVICE_PRICING)
      });
    }

    // Verify expert exists
    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    const serviceConfig = SERVICE_PRICING[service];

    // Create order in database
    const order = new Order({
      userId: userId || null,
      expertId,
      level,
      service,
      amount: serviceConfig.price / 100, // Store in euros
      duration: serviceConfig.duration,
      status: 'pending',
      paymentStatus: 'pending',
      customerEmail,
      customerName,
      createdAt: new Date(),
    });

    await order.save();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: serviceConfig.price,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order._id.toString(),
        expertId,
        service,
        level,
        userId: userId || 'guest',
      },
      receipt_email: customerEmail,
      description: `${serviceConfig.name} - Expert: ${expert.name} - Level: ${level}`,
    });

    // Update order with payment intent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id.toString(),
      amount: serviceConfig.price / 100,
      serviceName: serviceConfig.name,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Confirm payment and update order status
router.post('/confirm-payment', async (req: express.Request, res: express.Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({ error: 'Payment intent not found' });
    }

    // Find order by payment intent ID
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status based on payment status
    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
      order.paidAt = new Date();
    } else if (paymentIntent.status === 'payment_failed') {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
    } else {
      order.paymentStatus = 'pending';
    }

    await order.save();

    res.json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        amount: order.amount,
        service: order.service,
      },
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get order details
router.get('/order/:orderId', async (req: express.Request, res: express.Response) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('expertId', 'name specialties rating')
      .exec();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        amount: order.amount,
        service: order.service,
        level: order.level,
        duration: order.duration,
        expert: order.expertId,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// List user orders (authenticated route)
router.get('/orders', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.id;

    const orders = await Order.find({ userId })
      .populate('expertId', 'name specialties rating')
      .sort({ createdAt: -1 })
      .exec();

    res.json({
      orders: orders.map(order => ({
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        amount: order.amount,
        service: order.service,
        level: order.level,
        expert: order.expertId,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
      }))
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Webhook to handle Stripe events
router.post('/webhook', express.raw({type: 'application/json'}), async (req: express.Request, res: express.Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return res.status(400).json({ error: 'Missing webhook signature or secret' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        const order = await Order.findOne({ 
          stripePaymentIntentId: paymentIntent.id 
        });

        if (order) {
          order.paymentStatus = 'completed';
          order.status = 'confirmed';
          order.paidAt = new Date();
          await order.save();

          console.log(`Payment succeeded for order ${order._id}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        const order = await Order.findOne({ 
          stripePaymentIntentId: paymentIntent.id 
        });

        if (order) {
          order.paymentStatus = 'failed';
          order.status = 'cancelled';
          await order.save();

          console.log(`Payment failed for order ${order._id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
