import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getStripe, buildStripeOptions } from '../services/stripe';
import { ProcessedEvent } from '../models/ProcessedEvent';
import { Order } from '../models/Order';
import { Expert } from '../models/Expert';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const processedEvents = new Set<string>();

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { expertId, amount, description, metadata = {} } = req.body;

    if (!expertId || !amount) {
      return res.status(400).json({ error: 'Expert ID and amount are required' });
    }

    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found' });
    }

    // Pre-create order to get a Mongo ObjectId (avoid using string UUID as _id)
    const order = new Order({
      expertId: expert._id,
      amount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const { idempotencyKey } = buildStripeOptions(req);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      metadata: {
        orderId: order._id.toString(),
        expertId: expert._id.toString(),
        ...metadata
      },
      description: description || `Consultation with ${expert.name}`,
    }, { idempotencyKey });

    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id.toString(),
      amount,
      expertName: expert.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback confirmation when Stripe webhooks are not available
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body || {};
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'paymentIntentId is required'
      });
    }

    const pi = await getStripe().paymentIntents.retrieve(paymentIntentId);
    const paymentStatus = pi.status;
    const isSuccess = paymentStatus === 'succeeded';

    // Update order if exists
    const order = await Order.findOne({ paymentIntentId });
    if (order) {
      if (isSuccess && order.status !== 'paid') {
        order.status = 'paid';
        order.paidAt = new Date();
        order.updatedAt = new Date();
        await order.save();
      }
    }

    return res.json({
      success: isSuccess,
      order: order ? {
        id: order._id.toString(),
        status: order.status,
        paymentStatus,
        amount: order.amount,
        service: (order as any).service,
      } : undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Confirmation failed' });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed.`);
  }

  if (processedEvents.has(event.id)) {
    return res.json({ received: true, duplicate: true });
  }

  processedEvents.add(event.id);

  try {
    await ProcessedEvent.create({
      eventId: event.id,
      eventType: event.type,
      processed: true,
      processedAt: new Date()
    });
  } catch (error) {
    // Event already exists, ignore
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.status = 'completed';
            order.updatedAt = new Date();
            await order.save();
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        const failedOrderId = failedPaymentIntent.metadata?.orderId;
        
        if (failedOrderId) {
          const order = await Order.findById(failedOrderId);
          if (order) {
            order.status = 'failed';
            order.updatedAt = new Date();
            await order.save();
          }
        }
        break;

      case 'payment_intent.canceled':
        const canceledPaymentIntent = event.data.object;
        const canceledOrderId = canceledPaymentIntent.metadata?.orderId;
        
        if (canceledOrderId) {
          const order = await Order.findById(canceledOrderId);
          if (order) {
            order.status = 'failed';
            order.updatedAt = new Date();
            await order.save();
          }
        }
        break;

      default:
        break;
    }
  } catch (error) {
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  res.json({ received: true });
});

// Public order lookup for client after confirmation
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('expertId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({
      order: {
        id: order._id.toString(),
        status: order.status,
        paymentStatus: order.status === 'completed' ? 'succeeded' : 'pending',
        amount: order.amount,
        service: (order as any).service,
        level: (order as any).level,
        duration: (order as any).duration,
        expert: order.expertId ? {
          name: (order.expertId as any).name,
          specialties: (order.expertId as any).specialties || [],
          rating: (order.expertId as any).rating || 0
        } : undefined,
        customerEmail: order.userEmail,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('expertId');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
