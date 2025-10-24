import express from 'express';
import Stripe from 'stripe';
import { Order } from '../models/Order';
import { ProductOrder } from '../models/ProductOrder';
import { User } from '../models/User';
import { getLevelNameFromLevel } from '../utils/orderUtils';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
});

// Level configuration
const LEVELS = {
  1: { name: getLevelNameFromLevel(1), price: 0, description: '1 carte + PDF 2p' },
  2: { name: getLevelNameFromLevel(2), price: 1400, description: 'Profil âme + PDF 4p + audio 5min' }, // 14€ in cents
  3: { name: getLevelNameFromLevel(3), price: 2900, description: 'Blocages + rituel + PDF 6-8p + audio 12min' }, // 29€
  4: { name: getLevelNameFromLevel(4), price: 4900, description: 'Cartographie + mandala + PDF 15p + audio 25min' } // 49€
};

// Create payment intent
router.post('/create-payment-intent', async (req: any, res: any) => {
  try {
    const { level, formData } = req.body;
    
    // Validate level
    if (!LEVELS[level as keyof typeof LEVELS]) {
      return res.status(400).json({ error: 'Invalid level' });
    }
    
    const levelConfig = LEVELS[level as keyof typeof LEVELS];
    
    // For free level (Simple), no payment needed
    if (levelConfig.price === 0) {
      // Create order directly
      const user = await findOrCreateUser(formData);
      const order = await createOrder(user._id, user.email, level, levelConfig, formData, 0);
      
      return res.json({
        orderId: order._id,
        orderNumber: order.orderNumber,
        requiresPayment: false,
        message: 'Order created successfully - processing will begin shortly'
      });
    }
    
    // Create or find user
    const user = await findOrCreateUser(formData);
    
    // Create Stripe customer if not exists
    let stripeCustomer;
    if (user.stripeCustomerId) {
      stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        metadata: {
          userId: user._id.toString(),
          source: 'oracle-lumira'
        }
      });
      
      user.stripeCustomerId = stripeCustomer.id;
      await user.save();
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: levelConfig.price,
      currency: 'eur',
      customer: stripeCustomer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        level: level.toString(),
        userId: user._id.toString(),
        userEmail: user.email,
        levelName: levelConfig.name
      },
      description: `Oracle Lumira - ${levelConfig.name} (${levelConfig.description})`
    });
    
    // Create order in pending status
    const order = await createOrder(
      user._id,
      user.email,
      level,
      levelConfig,
      formData,
      levelConfig.price,
      paymentIntent.id
    );
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      orderNumber: order.orderNumber,
      requiresPayment: true
    });
    
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
async function findOrCreateUser(formData: any) {
  let user = await User.findOne({ email: formData.email.toLowerCase() });
  
  if (!user) {
    user = new User({
      email: formData.email.toLowerCase(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
    });
    await user.save();
  }
  
  return user;
}

async function createOrder(
  userId: any,
  userEmail: string,
  level: number,
  levelConfig: any,
  formData: any,
  amount: number,
  paymentIntentId?: string
) {
  const order = new Order({
    userId,
    userEmail,
    level,
        amount,
    currency: 'eur',
    status: amount === 0 ? 'paid' : 'pending',
    paymentIntentId,
    formData: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      specificQuestion: formData.specificQuestion,
      preferences: formData.preferences || {}
    }
  });
  
  await order.save();
  return order;
}

async function handlePaymentSuccess(paymentIntent: any) {
  console.log('Webhook payment_intent.succeeded received:', paymentIntent.id);

  // 0) Upsert user based on PaymentIntent metadata (first purchase support)
  try {
    const md: any = paymentIntent.metadata || {};
    const customerEmail: string | undefined = (md.customerEmail || md.userEmail || paymentIntent.receipt_email || '').toLowerCase();
    const customerFirstName: string | undefined = md.customerFirstName || md.firstName;
    const customerLastName: string | undefined = md.customerLastName || md.lastName;
    const customerPhone: string | undefined = md.customerPhone || md.phone;

    if (customerEmail) {
      const user = await User.findOneAndUpdate(
        { email: customerEmail },
        {
          $setOnInsert: {
            email: customerEmail,
            firstName: customerFirstName || 'Client',
            lastName: customerLastName || 'Oracle',
            subscriptionStatus: 'active',
          },
          $set: {
            phone: customerPhone,
          },
          $inc: { totalOrders: 1 },
          $currentDate: { lastOrderAt: true },
        },
        { upsert: true, new: true, runValidators: true }
      );

      // Attach for downstream helpers if needed
      paymentIntent.metadata = {
        ...(paymentIntent.metadata || {}),
        userId: user._id.toString(),
        userEmail: user.email,
      };

      console.log('[Webhook] User upserted', { userId: user._id.toString(), email: user.email });
    }
  } catch (error) {
    console.error('[Webhook] User upsert failed', error);
  }

  // 1) Ensure ProductOrder exists and is marked completed (idempotent)
  try {
    const productOrder = await ProductOrder.findOne({ paymentIntentId: paymentIntent.id });
    if (!productOrder) {
      // Create ProductOrder when missing (webhook-first flows)
      const metadata: any = paymentIntent.metadata || {};
      const productId = metadata.productId || metadata.level || 'initie';
      const customerEmail = metadata.customerEmail || paymentIntent.receipt_email || undefined;

      const newOrder = new ProductOrder({
        productId,
        customerEmail,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'completed',
        paymentIntentId: paymentIntent.id,
        completedAt: new Date(),
        metadata
      });
      await newOrder.save();
      console.log('ProductOrder created from webhook (succeeded):', {
        orderId: newOrder._id,
        paymentIntentId: paymentIntent.id,
        productId
      });
    } else if (productOrder.status === 'completed') {
      console.log('Webhook already processed for this ProductOrder:', paymentIntent.id);
    } else {
      console.log('ProductOrder found. Updating status to completed...', productOrder.paymentIntentId);
      productOrder.status = 'completed' as any;
      productOrder.completedAt = new Date();
      productOrder.updatedAt = new Date();
      await productOrder.save();
      console.log('ProductOrder saved successfully as completed:', productOrder.paymentIntentId);
    }
  } catch (err) {
    console.error('Error updating ProductOrder on webhook:', err);
  }

  // 2) Maintain legacy Order updates (paid) with logs
  try {
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
    if (order) {
      if (order.status !== 'paid') {
        order.status = 'paid';
        await order.save();
        console.log(`Order ${order.orderNumber} updated to paid.`);
      } else {
        console.log(`Order ${order.orderNumber} already marked as paid.`);
      }

      // Update user stats
      await User.findByIdAndUpdate(order.userId, {
        $inc: { totalOrders: 1 },
        lastOrderAt: new Date(),
        subscriptionStatus: 'active'
      });
    }
  } catch (err) {
    console.error('Error updating legacy Order on webhook:', err);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id);
  
  const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
  if (order) {
    order.status = 'failed';
    await order.save();
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  console.log('Payment canceled:', paymentIntent.id);
  
  const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
  if (order) {
    order.status = 'failed';
    await order.save();
  }
}

export { router as stripeRoutes };
