/**
 * P0 — "bind sanctuaire sessions to verified identity"
 *
 * These tests exercise the real Express routers (no re-implementation of the
 * logic) against an in-memory persistence layer, and cover the mandatory
 * scenarios:
 *   1. purchase with another customer's email  ⇒ no access to that account
 *   2. purchase with a new account             ⇒ access only after verification
 *   3. valid payment                           ⇒ order correctly recorded
 *   4. failed payment                          ⇒ no entitlement
 *   5. replayed webhook                        ⇒ no duplicate
 *   6. expired / already used magic link       ⇒ refused
 *   7. legitimate client re-login              ⇒ works
 */
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

import { collections, resetCollections } from './inMemoryModel';

jest.setTimeout(20000);

// ---------------------------------------------------------------------------
// Model mocks (must be declared before the routers are imported)
// ---------------------------------------------------------------------------
jest.mock('../../models/MagicLinkToken', () => ({
  MagicLinkToken: {
    create: (data: any) => collections.magicLinkTokens.create(data),
    findOne: (filter: any) => collections.magicLinkTokens.findOne(filter),
    findOneAndUpdate: (filter: any, update: any, options: any) =>
      collections.magicLinkTokens.findOneAndUpdate(filter, update, options),
    deleteMany: (filter: any) => collections.magicLinkTokens.deleteMany(filter),
  },
}));

jest.mock('../../models/User', () => ({
  User: {
    findOne: (filter: any) => collections.users.findOne(filter),
    findById: (id: any) => collections.users.findById(id),
    create: (data: any) => collections.users.create(data),
    findOneAndUpdate: (filter: any, update: any, options: any) =>
      collections.users.findOneAndUpdate(filter, update, options),
    findByIdAndUpdate: (id: any, update: any, options: any) =>
      collections.users.findByIdAndUpdate(id, update, options),
  },
}));

jest.mock('../../models/Order', () => ({
  Order: {
    find: (filter: any) => collections.orders.find(filter),
    findOne: (filter: any) => collections.orders.findOne(filter),
    create: (data: any) => collections.orders.create(data),
    findOneAndUpdate: (filter: any, update: any, options: any) =>
      collections.orders.findOneAndUpdate(filter, update, options),
    findById: (id: any) => collections.orders.findById(id),
    countDocuments: (filter: any) => collections.orders.countDocuments(filter),
  },
}));

jest.mock('../../models/ProductOrder', () => ({
  ProductOrder: {
    find: (filter: any) => collections.productOrders.find(filter),
    findOne: (filter: any) => collections.productOrders.findOne(filter),
    create: (data: any) => collections.productOrders.create(data),
    findOneAndUpdate: (filter: any, update: any, options: any) =>
      collections.productOrders.findOneAndUpdate(filter, update, options),
    countDocuments: (filter: any) => collections.productOrders.countDocuments(filter),
  },
}));

jest.mock('../../models/ProcessedEvent', () => ({
  ProcessedEvent: {
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    deleteOne: jest.fn().mockResolvedValue({}),
  },
  default: {
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    deleteOne: jest.fn().mockResolvedValue({}),
  },
}));

// Stripe is never called for real.
const mockConstructWebhookEvent = jest.fn();
const mockGetPaymentIntent = jest.fn();
const mockCreatePaymentIntent = jest.fn();

jest.mock('../../services/stripe', () => ({
  StripeService: {
    createPaymentIntent: (...args: any[]) => mockCreatePaymentIntent(...args),
    getPaymentIntent: (...args: any[]) => mockGetPaymentIntent(...args),
    constructWebhookEvent: (...args: any[]) => mockConstructWebhookEvent(...args),
    handlePaymentSuccess: jest.fn(async (paymentIntent: any) => ({
      id: paymentIntent.id,
      status: 'completed',
    })),
    grantProductAccess: jest.fn(),
  },
  getStripe: () => ({
    webhooks: { constructEvent: (...args: any[]) => mockConstructWebhookEvent(...args) },
    paymentIntents: {
      retrieve: (...args: any[]) => mockGetPaymentIntent(...args),
      create: (...args: any[]) => mockCreatePaymentIntent(...args),
    },
    customers: { create: jest.fn(), retrieve: jest.fn() },
  }),
  buildStripeOptions: () => ({ idempotencyKey: 'test-idempotency-key' }),
  default: {},
}));

jest.mock('../../services/s3', () => ({
  getS3Service: () => ({
    detectBucketTypeFromUrl: () => 'uploads',
    getPresignedGetUrl: jest.fn(),
    getPresignedPutUrl: jest.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// App under test
// ---------------------------------------------------------------------------
const JWT_SECRET = 'test-secret-for-security-suite';
process.env.JWT_SECRET = JWT_SECRET;
process.env.NODE_ENV = 'test';
// Required by POST /create-payment-intent (Stripe service itself is mocked).
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_security_suite';
// Tests must be able to request several links in a row (real deployments keep a cooldown).
process.env.MAGIC_LINK_RESEND_COOLDOWN_SECONDS = '0';
process.env.MAGIC_LINK_REQUEST_RATE_LIMIT = '1000';
process.env.MAGIC_LINK_VERIFY_RATE_LIMIT = '1000';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

function buildApp() {
  const app = express();
  app.use(express.json());

  // Webhook MUST receive the raw body, exactly like server.ts does.
  app.use('/api/products/webhook', express.raw({ type: 'application/json' }));

  const productsRoutes = require('../../routes/products').default;
  const { sanctuaireAuthRoutes } = require('../../routes/sanctuaireAuth');
  const { userRoutes } = require('../../routes/users');

  app.use('/api/products', productsRoutes);
  app.use('/api/users', sanctuaireAuthRoutes);
  app.use('/api/users', userRoutes);

  return app;
}

let app: express.Application;

beforeEach(() => {
  resetCollections();
  jest.clearAllMocks();
  process.env.JWT_SECRET = JWT_SECRET;
  app = buildApp();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const VICTIM = { email: 'victim@example.com', firstName: 'Véra', lastName: 'Roussel' };
const ATTACKER = { email: 'attacker@example.com', firstName: 'Ana', lastName: 'Kruger' };

function seedUser(user: { email: string; firstName: string; lastName: string }) {
  const doc = collections.users.seedDoc({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    subscriptionStatus: 'active',
  });
  return String(doc._id);
}

function seedCompletedProductOrder(params: {
  email: string;
  productId?: string;
  paymentIntentId?: string;
  status?: string;
}) {
  const productId = params.productId || 'mystique';
  return collections.productOrders.seedDoc({
    productId,
    customerEmail: params.email,
    amount: 4700,
    currency: 'eur',
    status: params.status || 'completed',
    paymentIntentId: params.paymentIntentId || `pi_seed_${Math.random().toString(36).slice(2, 10)}`,
    completedAt: new Date(),
    metadata: { productName: `Niveau ${productId}`, level: productId },
  });
}

/** Extract the magic-link token the way a mailbox owner would (from the email URL). */
function extractTokenFromLogs(spy: jest.SpyInstance): string | null {
  const calls = spy.mock.calls.map((args: any[]) =>
    args.map((a: any) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
  );
  const joined = calls.join('\n');
  const match = joined.match(/token=([a-f0-9]{64})/);
  return match ? match[1] : null;
}

async function issueLinkFor(email: string): Promise<string> {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  try {
    const res = await request(app)
      .post('/api/users/auth/magic-link/request')
      .send({ email });
    expect([202, 429]).toContain(res.status);
    const token = extractTokenFromLogs(logSpy);
    expect(token).toBeTruthy();
    return token as string;
  } finally {
    logSpy.mockRestore();
  }
}

async function loginAs(email: string): Promise<string> {
  const token = await issueLinkFor(email);
  const res = await request(app)
    .post('/api/users/auth/magic-link/verify')
    .send({ token })
    .expect(200);
  expect(res.body.token).toBeTruthy();
  return res.body.token;
}

// ---------------------------------------------------------------------------
// 1. Purchase with another customer's email
// ---------------------------------------------------------------------------
describe('1. Paiement avec l’email d’un autre client', () => {
  it('ne délivre AUCUNE session sans vérification de la boîte email', async () => {
    const victimId = seedUser(VICTIM);
    seedCompletedProductOrder({ email: VICTIM.email });

    // The attacker knows the victim's email and even the exact route used to be enough.
    const legacyV2 = await request(app)
      .post('/api/users/auth/sanctuaire-v2')
      .send({ email: VICTIM.email });
    expect([401, 403, 404]).toContain(legacyV2.status);
    expect(legacyV2.body.token).toBeUndefined();
    expect(legacyV2.body.user).toBeUndefined();

    const legacyV1 = await request(app)
      .post('/api/users/auth/sanctuaire')
      .send({ email: VICTIM.email });
    expect([401, 403, 404]).toContain(legacyV1.status);
    expect(legacyV1.body.token).toBeUndefined();

    // Requesting a link is uniform: no account/entitlement disclosure.
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const requestRes = await request(app)
      .post('/api/users/auth/magic-link/request')
      .send({ email: 'unknown-person@example.com' });
    logSpy.mockRestore();

    expect(requestRes.status).toBe(202);
    expect(requestRes.body.success).toBe(true);
    expect(JSON.stringify(requestRes.body)).not.toMatch(/firstName|lastName|level|products|orderCount/);

    // The victim's account is still reachable with a session bound to her id,
    // but the attacker never obtained one: nothing leaks through the API.
    const victimSession = jwt.sign(
      { userId: victimId, email: VICTIM.email, type: 'sanctuaire_access', email_verified: true },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const entitlements = await request(app)
      .get('/api/users/entitlements')
      .set('Authorization', `Bearer ${victimSession}`)
      .expect(200);
    expect(entitlements.body.products).toContain('mystique');
  });

  it('le webhook ne réécrit jamais le profil d’un compte existant', async () => {
    const victimId = seedUser(VICTIM);
    const before = collections.users.docs.find((u) => String(u._id) === victimId);
    expect(before?.firstName).toBe('Véra');

    mockConstructWebhookEvent.mockReturnValue({
      id: 'evt_overwrite_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_overwrite_1',
          amount: 4700,
          currency: 'eur',
          status: 'succeeded',
          metadata: {
            productId: 'mystique',
            level: 'mystique',
            // Attacker-declared identity at checkout:
            customerEmail: VICTIM.email,
            customerName: 'Pirate Tiers',
            customerPhone: '0699999999',
          },
        },
      },
    });

    await request(app)
      .post('/api/products/webhook')
      .set('stripe-signature', 'sig_test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_overwrite_1' }))
      .expect(200);

    const after = collections.users.docs.find((u) => String(u._id) === victimId);
    expect(after?.firstName).toBe('Véra');
    expect(after?.lastName).toBe('Roussel');
    expect(after?.phone).toBeUndefined();
    // Still exactly one account for this email.
    expect(collections.users.docs.filter((u) => u.email === VICTIM.email)).toHaveLength(1);
  });

  it('refuse une session dont le jeton ne correspond pas au compte', async () => {
    const attackerId = seedUser(ATTACKER);
    const forged = jwt.sign(
      { userId: attackerId, email: VICTIM.email, type: 'sanctuaire_access', email_verified: true },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/users/entitlements')
      .set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// 2. New customer: access only after verification
// ---------------------------------------------------------------------------
describe('2. Achat avec un nouveau compte', () => {
  it('n’ouvre l’accès qu’après vérification de l’email', async () => {
    const newEmail = 'nouveau@example.com';
    seedCompletedProductOrder({ email: newEmail, productId: 'mystique' });

    // Before verification: no session exists at all.
    await request(app).get('/api/users/session').expect(401);

    const sessionToken = await loginAs(newEmail);

    const session = await request(app)
      .get('/api/users/session')
      .set('Authorization', `Bearer ${sessionToken}`)
      .expect(200);

    expect(session.body.authenticated).toBe(true);
    expect(session.body.emailVerified).toBe(true);
    expect(session.body.user.email).toBe(newEmail);
    expect(session.body.products).toContain('mystique');
  });

  it('crée le compte au moment de la vérification (client sans compte préexistant)', async () => {
    const newEmail = 'jamais-vu@example.com';
    seedCompletedProductOrder({ email: newEmail });

    expect(collections.users.docs).toHaveLength(0);
    await loginAs(newEmail);
    expect(collections.users.docs).toHaveLength(1);
    expect(collections.users.docs[0].email).toBe(newEmail);
  });
});

// ---------------------------------------------------------------------------
// 3. Valid payment ⇒ order recorded
// ---------------------------------------------------------------------------
describe('3. Paiement valide', () => {
  it('enregistre correctement la commande et accorde les droits', async () => {
    mockCreatePaymentIntent.mockResolvedValue({
      clientSecret: 'pi_valid_client_secret',
      paymentIntentId: 'pi_valid_123',
      amount: 4700,
      currency: 'eur',
      productName: 'Niveau Mystique',
    });

    const intentRes = await request(app)
      .post('/api/products/create-payment-intent')
      .send({ productId: 'mystique', customerEmail: VICTIM.email, customerName: 'Véra Roussel' })
      .expect(200);

    expect(intentRes.body.clientSecret).toBe('pi_valid_client_secret');
    expect(intentRes.body.orderId).toBe('pi_valid_123');

    // The pending order exists but grants nothing yet.
    expect(collections.productOrders.docs).toHaveLength(1);
    expect(collections.productOrders.docs[0].status).toBe('pending');

    const tokenBefore = await loginAs(VICTIM.email);
    const before = await request(app)
      .get('/api/users/entitlements')
      .set('Authorization', `Bearer ${tokenBefore}`)
      .expect(200);
    expect(before.body.products).toEqual([]);

    // Stripe webhook: payment succeeded.
    mockConstructWebhookEvent.mockReturnValue({
      id: 'evt_valid_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_valid_123',
          amount: 4700,
          currency: 'eur',
          status: 'succeeded',
          metadata: {
            productId: 'mystique',
            level: 'mystique',
            productName: 'Niveau Mystique',
            customerEmail: VICTIM.email,
            customerName: 'Véra Roussel',
          },
        },
      },
    });

    await request(app)
      .post('/api/products/webhook')
      .set('stripe-signature', 'sig_test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_valid_1' }))
      .expect(200);

    const stored = collections.productOrders.docs.find(
      (order) => order.paymentIntentId === 'pi_valid_123'
    );
    expect(stored).toBeTruthy();
    expect(stored?.status).toBe('completed');

    const tokenAfter = await loginAs(VICTIM.email);
    const after = await request(app)
      .get('/api/users/entitlements')
      .set('Authorization', `Bearer ${tokenAfter}`)
      .expect(200);
    expect(after.body.products).toContain('mystique');
    expect(after.body.highestLevel).toBe('mystique');
  });
});

// ---------------------------------------------------------------------------
// 4. Failed payment ⇒ no entitlement
// ---------------------------------------------------------------------------
describe('4. Paiement échoué', () => {
  it('n’accorde aucun droit', async () => {
    mockCreatePaymentIntent.mockResolvedValue({
      clientSecret: 'pi_fail_client_secret',
      paymentIntentId: 'pi_fail_123',
      amount: 4700,
      currency: 'eur',
      productName: 'Niveau Mystique',
    });

    await request(app)
      .post('/api/products/create-payment-intent')
      .send({ productId: 'mystique', customerEmail: ATTACKER.email })
      .expect(200);

    mockConstructWebhookEvent.mockReturnValue({
      id: 'evt_failed_1',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_fail_123',
          amount: 4700,
          currency: 'eur',
          status: 'requires_payment_method',
          metadata: { productId: 'mystique', customerEmail: ATTACKER.email },
        },
      },
    });

    await request(app)
      .post('/api/products/webhook')
      .set('stripe-signature', 'sig_test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_failed_1' }))
      .expect(200);

    const stored = collections.productOrders.docs.find((o) => o.paymentIntentId === 'pi_fail_123');
    expect(stored?.status).toBe('failed');

    const token = await loginAs(ATTACKER.email);
    const entitlements = await request(app)
      .get('/api/users/entitlements')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(entitlements.body.products).toEqual([]);
    expect(entitlements.body.highestLevel).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 5. Replayed webhook ⇒ no duplicate
// ---------------------------------------------------------------------------
describe('5. Rejeu de webhook', () => {
  it('ne crée pas de doublon et ne régresse pas l’état', async () => {
    mockCreatePaymentIntent.mockResolvedValue({
      clientSecret: 'pi_replay_client_secret',
      paymentIntentId: 'pi_replay_123',
      amount: 4700,
      currency: 'eur',
      productName: 'Niveau Mystique',
    });

    await request(app)
      .post('/api/products/create-payment-intent')
      .send({ productId: 'mystique', customerEmail: VICTIM.email })
      .expect(200);

    const event = {
      id: 'evt_replay_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_replay_123',
          amount: 4700,
          currency: 'eur',
          status: 'succeeded',
          metadata: {
            productId: 'mystique',
            level: 'mystique',
            customerEmail: VICTIM.email,
          },
        },
      },
    };
    mockConstructWebhookEvent.mockReturnValue(event);

    await request(app)
      .post('/api/products/webhook')
      .set('stripe-signature', 'sig_test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_replay_1' }))
      .expect(200);

    const countAfterFirst = collections.productOrders.docs.length;
    expect(countAfterFirst).toBe(1);

    await request(app)
      .post('/api/products/webhook')
      .set('stripe-signature', 'sig_test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ id: 'evt_replay_1' }))
      .expect(200);

    expect(collections.productOrders.docs.length).toBe(countAfterFirst);
    expect(collections.productOrders.docs[0].status).toBe('completed');

    // The Expert Desk order is created exactly once for this PaymentIntent.
    const deskOrders = collections.orders.docs.filter((o) => o.paymentIntentId === 'pi_replay_123');
    expect(deskOrders).toHaveLength(1);

    const token = await loginAs(VICTIM.email);
    const entitlements = await request(app)
      .get('/api/users/entitlements')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(entitlements.body.orderCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 6. Expired / already used magic link ⇒ refused
// ---------------------------------------------------------------------------
describe('6. Lien magique expiré ou déjà utilisé', () => {
  it('refuse un lien déjà utilisé (usage unique)', async () => {
    seedUser(VICTIM);
    const token = await issueLinkFor(VICTIM.email);

    await request(app).post('/api/users/auth/magic-link/verify').send({ token }).expect(200);

    const replay = await request(app).post('/api/users/auth/magic-link/verify').send({ token });
    expect(replay.status).toBe(401);
    expect(replay.body.token).toBeUndefined();
    expect(replay.body.code).toBe('MAGIC_LINK_INVALID');
  });

  it('refuse un lien expiré', async () => {
    seedUser(VICTIM);
    const token = await issueLinkFor(VICTIM.email);

    // Simulate the passage of time (token TTL exceeded).
    const stored = collections.magicLinkTokens.docs[0];
    stored.expiresAt = new Date(Date.now() - 1000);

    const res = await request(app).post('/api/users/auth/magic-link/verify').send({ token });
    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it('refuse un jeton inconnu / forgé', async () => {
    const res = await request(app)
      .post('/api/users/auth/magic-link/verify')
      .send({ token: 'f'.repeat(64) });
    expect(res.status).toBe(401);
  });

  it('stocke uniquement un hash du jeton, jamais le jeton brut', async () => {
    seedUser(VICTIM);
    const token = await issueLinkFor(VICTIM.email);
    const stored = collections.magicLinkTokens.docs[0];
    expect(stored.tokenHash).not.toBe(token);
    expect(JSON.stringify(stored)).not.toContain(token);
  });
});

// ---------------------------------------------------------------------------
// 7. Legitimate re-login
// ---------------------------------------------------------------------------
describe('7. Reconnexion légitime d’un client', () => {
  it('un nouveau lien ouvre une nouvelle session valide', async () => {
    seedUser(VICTIM);
    seedCompletedProductOrder({ email: VICTIM.email, productId: 'profond' });

    const firstToken = await loginAs(VICTIM.email);
    const firstSession = await request(app)
      .get('/api/users/session')
      .set('Authorization', `Bearer ${firstToken}`)
      .expect(200);
    expect(firstSession.body.products).toContain('profond');

    // Second login (e.g. new browser): a fresh link must work.
    const secondToken = await loginAs(VICTIM.email);
    expect(typeof secondToken).toBe('string');

    const secondSession = await request(app)
      .get('/api/users/session')
      .set('Authorization', `Bearer ${secondToken}`)
      .expect(200);
    expect(secondSession.body.user.email).toBe(VICTIM.email);
    expect(secondSession.body.highestLevel).toBe('profond');
  });

  it('préserve les droits historiques (achats antérieurs toujours visibles)', async () => {
    seedUser(VICTIM);
    seedCompletedProductOrder({ email: VICTIM.email, productId: 'initie', status: 'completed' });
    seedCompletedProductOrder({ email: VICTIM.email, productId: 'profond', status: 'completed' });

    const token = await loginAs(VICTIM.email);
    const entitlements = await request(app)
      .get('/api/users/entitlements')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(entitlements.body.products).toEqual(
      expect.arrayContaining(['initie', 'mystique', 'profond'])
    );
    expect(entitlements.body.highestLevel).toBe('profond');
  });
});

// ---------------------------------------------------------------------------
// Extra: order privacy + idempotency of order creation
// ---------------------------------------------------------------------------
describe('Confidentialité des réponses de commande', () => {
  it('GET /api/products/orders/:id ne renvoie aucune donnée personnelle', async () => {
    const order = seedCompletedProductOrder({ email: VICTIM.email, paymentIntentId: 'pi_public_1' });
    order.metadata = {
      ...order.metadata,
      customerEmail: VICTIM.email,
      customerPhone: '0600000000',
      customerName: 'Véra Roussel',
    };
    mockGetPaymentIntent.mockResolvedValue({ status: 'succeeded', metadata: {}, amount: 4700 });

    const res = await request(app).get('/api/products/orders/pi_public_1').expect(200);
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain(VICTIM.email);
    expect(serialized).not.toContain('0600000000');
    expect(serialized).not.toContain('Véra');
    expect(res.body.order.customerEmail).toBeUndefined();
    expect(res.body.order.status).toBe('completed');
  });

  it('le contexte de commande authentifié est réservé au propriétaire vérifié', async () => {
    collections.productOrders.seedDoc({
      productId: 'mystique',
      customerEmail: VICTIM.email,
      amount: 4700,
      currency: 'eur',
      status: 'completed',
      paymentIntentId: 'pi_ctx_1',
      metadata: { customerFirstName: 'Véra', customerLastName: 'Roussel', customerPhone: '0600000000' },
    });

    const victimToken = await loginAs(VICTIM.email);
    const ok = await request(app)
      .get('/api/users/session/order-context?orderId=pi_ctx_1')
      .set('Authorization', `Bearer ${victimToken}`)
      .expect(200);
    expect(ok.body.customer.email).toBe(VICTIM.email);
    expect(ok.body.customer.firstName).toBe('Véra');

    const attackerToken = await loginAs(ATTACKER.email);
    const forbidden = await request(app)
      .get('/api/users/session/order-context?orderId=pi_ctx_1')
      .set('Authorization', `Bearer ${attackerToken}`);
    expect(forbidden.status).toBe(403);
  });
});
