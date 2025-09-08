import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { stripe, buildStripeOptions } from '../services/stripe.js';
import { ProcessedEvent } from '../models/ProcessedEvent.js';
import { Order } from '../models/Order.js';
import { Expert } from '../models/Expert.js';
import { authenticateToken } from '../middleware/auth.js';

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

    const orderId = uuidv4();
    const { idempotencyKey } = buildStripeOptions(req);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      metadata: {
        orderId,
        expertId: expert._id.toString(),
        ...metadata
      },
      description: description || `Consultation with ${expert.name}`,
    }, { idempotencyKey });

    const order = new Order({
      _id: orderId,
      paymentIntentId: paymentIntent.id,
      expertId: expert._id,
      amount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
      amount,
      expertName: expert.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
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
