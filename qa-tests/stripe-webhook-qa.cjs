/*
 Stripe Webhook QA
 - Starts API with in-memory Mongo and a test webhook secret
 - Inserts a pending ProductOrder into Mongo
 - Sends a signed payment_intent.succeeded webhook to /api/stripe/webhook
 - Verifies ProductOrder becomes completed (idempotent on replay)
*/

const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createRequire } = require('module');

const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'apps', 'api-backend');
const DIST_SERVER = path.join(API_DIR, 'dist', 'server.js');
const ARTIFACTS = path.join(__dirname, 'artifacts', 'stripe-webhook-qa');

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

function waitForLog(child, needle, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    let done = false;
    const t = setTimeout(() => {
      if (!done) { done = true; reject(new Error(`Timeout waiting for: ${needle}`)); }
    }, timeoutMs);
    const onData = (buf) => {
      const s = buf.toString();
      if (s.includes(needle) && !done) { done = true; clearTimeout(t); cleanup(); resolve(); }
    };
    const cleanup = () => { child.stdout?.off('data', onData); child.stderr?.off('data', onData); };
    child.stdout?.on('data', onData); child.stderr?.on('data', onData);
  });
}

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function buildApiIfNeeded() {
  if (await fileExists(DIST_SERVER)) return;
  await new Promise((resolve, reject) => {
    const build = spawn(process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm',
      process.platform === 'win32' ? ['/c','npm','run','build'] : ['run','build'],
      { cwd: API_DIR, stdio: ['pipe','pipe','pipe'] });
    build.on('exit', (code) => code === 0 ? resolve(null) : reject(new Error('API build failed: code '+code)));
    build.on('error', reject);
  });
}

async function startApi(mongoUri, port, webhookSecret) {
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: String(port),
    MONGODB_URI: mongoUri,
    JWT_SECRET: 'sanctuaire-test-secret',
    STRIPE_SECRET_KEY: 'sk_test_dummy',
    STRIPE_WEBHOOK_SECRET: webhookSecret,
    STRIPE_PRODUCT_WEBHOOK_SECRET: webhookSecret,
  };
  const api = spawn(process.execPath, ['dist/server.js'], { cwd: API_DIR, env, stdio: ['ignore','pipe','pipe'] });
  await waitForLog(api, `Server is running on port ${port}`);
  return { api, env };
}

async function run() {
  await ensureDir(ARTIFACTS);
  const mongod = await MongoMemoryServer.create({ instance: { dbName: 'lumira-webhook-qa' } });
  const mongoUri = mongod.getUri();
  const webhookSecret = 'whsec_test_qa_secret';
  const port = 3102;

  try {
    await buildApiIfNeeded();
    const { api } = await startApi(mongoUri, port, webhookSecret);
    const apiRequire = createRequire(DIST_SERVER);

    // Insert pending ProductOrder
    const mongoose = apiRequire('mongoose');
    await mongoose.connect(mongoUri);
    const { ProductOrder } = apiRequire('./models/ProductOrder');

    const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const now = new Date();
    const doc = await ProductOrder.create({
      productId: 'mystique',
      customerEmail: 'webhook.qa@example.com',
      amount: 4700,
      currency: 'eur',
      status: 'pending',
      paymentIntentId,
      createdAt: now,
      updatedAt: now,
      metadata: { test: 'stripe-webhook-qa' },
    });
    await fs.writeFile(path.join(ARTIFACTS, 'product-order-before.json'), JSON.stringify(doc.toJSON(), null, 2));
    await mongoose.disconnect();

    // Build signed webhook event
    const Stripe = apiRequire('stripe');
    const stripe = new Stripe('sk_test_dummy', { apiVersion: '2024-06-20' });
    const eventPayload = {
      id: `evt_test_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentIntentId,
          amount: 4700,
          currency: 'eur',
          metadata: {
            customerEmail: 'webhook.qa@example.com',
            product_id: 'mystique',
            level: 'mystique',
            productName: 'Niveau Mystique'
          }
        }
      }
    };
    const payload = JSON.stringify(eventPayload);
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });

    await fs.writeFile(path.join(ARTIFACTS, 'webhook-request.json'), JSON.stringify({ headers: { 'stripe-signature': header }, body: eventPayload }, null, 2));

    const baseUrl = `http://127.0.0.1:${port}`;
    const resp = await fetch(`${baseUrl}/api/stripe/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': header }, body: payload });
    const text = await resp.text();
    let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
    await fs.writeFile(path.join(ARTIFACTS, 'webhook-response.json'), JSON.stringify({ status: resp.status, body }, null, 2));
    if (resp.status !== 200) throw new Error(`Webhook call failed: ${resp.status}`);

    // Verify ProductOrder becomes completed
    await mongoose.connect(mongoUri);
    const after = await ProductOrder.findOne({ paymentIntentId }).lean();
    await fs.writeFile(path.join(ARTIFACTS, 'product-order-after.json'), JSON.stringify(after, null, 2));
    if (!after) throw new Error('ProductOrder not found after webhook');
    if (after.status !== 'completed') throw new Error(`Expected status completed, got ${after.status}`);
    if (!after.completedAt) throw new Error('completedAt not set after webhook');

    // Idempotence: replay same event
    const resp2 = await fetch(`${baseUrl}/api/stripe/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'stripe-signature': header }, body: payload });
    if (resp2.status !== 200) throw new Error(`Webhook replay failed: ${resp2.status}`);
    const afterReplay = await ProductOrder.findOne({ paymentIntentId }).lean();
    if (afterReplay.status !== 'completed') throw new Error('Status changed away from completed after replay');
    await mongoose.disconnect();

    api.kill();
    await mongod.stop();
    console.log('Stripe Webhook QA passed. Artifacts at:', ARTIFACTS);
  } catch (e) {
    console.error('Stripe Webhook QA failed:', e);
    try { await fs.writeFile(path.join(ARTIFACTS, 'error.txt'), String(e?.stack || e?.message || e)); } catch {}
    process.exit(1);
  }
}

run();

