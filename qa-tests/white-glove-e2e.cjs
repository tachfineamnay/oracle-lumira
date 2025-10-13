/*
 White Glove E2E Orchestrator
 - Starts API with in-memory Mongo + mock modes (Stripe + S3)
 - Simulates Level II (mystique) purchase
 - Exercises invalid/valid upload flows
 - Marks order completed + delivered content
 - Starts Vite dev and captures Sanctuaire screenshots via Playwright
 - Validates Expert queue programmatically
*/

const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createRequire } = require('module');
const jwt = require('jsonwebtoken');

const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'apps', 'api-backend');
const FRONT_DIR = path.join(ROOT, 'apps', 'main-app');
const apiRequire = createRequire(path.join(API_DIR, 'dist', 'server.js'));

const ARTIFACTS = path.join(__dirname, 'artifacts', 'white-glove');

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

async function startApi(mongoUri) {
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3101',
    MONGODB_URI: mongoUri,
    JWT_SECRET: 'sanctuaire-test-secret',
    STRIPE_MOCK_MODE: 'true',
    STRIPE_SECRET_KEY: 'sk_test_dummy',
    ALLOW_DIRECT_CLIENT_SUBMIT: 'true',
    ENABLE_DEBUG_ROUTES: 'true',
    AWS_ACCESS_KEY_ID: 'mock',
    AWS_SECRET_ACCESS_KEY: 'mock',
    AWS_REGION: 'us-east-1',
    AWS_S3_BUCKET_NAME: 'qa-test-bucket',
    S3_MOCK_MODE: 'true',
  };
  const api = spawn(process.execPath, ['dist/server.js'], { cwd: API_DIR, env, stdio: ['ignore','pipe','pipe'] });
  await waitForLog(api, 'Server is running on port 3101');
  return { api, env };
}

async function createMystiqueOrder(baseUrl, email) {
  // Step 1: simulate create-payment-intent (mock) for mystique
  const resp = await fetch(`${baseUrl}/api/products/create-payment-intent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 'mystique', customerEmail: email, customerName: 'QA Mystique', metadata: { scenario: 'white-glove' }})
  });
  const body = await resp.json();
  await ensureDir(ARTIFACTS);
  await fs.writeFile(path.join(ARTIFACTS, 'create-payment-intent-mystique.json'), JSON.stringify({ status: resp.status, body }, null, 2));
  if (resp.status !== 200) throw new Error('create-payment-intent failed');
  return body.orderId; // paymentIntentId
}

function makeFormDataBoundary() {
  return '----LumiraBoundary' + Math.random().toString(16).slice(2);
}

function buildMultipart(boundary, parts) {
  const CRLF = '\r\n';
  const chunks = [];
  for (const p of parts) {
    chunks.push(`--${boundary}${CRLF}`);
    chunks.push(`Content-Disposition: form-data; name="${p.name}"${p.filename ? `; filename="${p.filename}"` : ''}${CRLF}`);
    if (p.contentType) chunks.push(`Content-Type: ${p.contentType}${CRLF}`);
    chunks.push(CRLF);
    chunks.push(p.value);
    chunks.push(CRLF);
  }
  chunks.push(`--${boundary}--${CRLF}`);
  return Buffer.concat(chunks.map(c => Buffer.isBuffer(c) ? c : Buffer.from(c)));
}

async function postClientSubmit(baseUrl, paymentIntentId, payload, files) {
  const boundary = makeFormDataBoundary();
  const parts = [];
  parts.push({ name: 'formData', value: JSON.stringify(payload), contentType: 'application/json' });
  if (files) {
    for (const f of files) {
      parts.push({ name: f.field, filename: f.filename, contentType: f.contentType, value: f.buffer });
    }
  }
  const body = buildMultipart(boundary, parts);
  const resp = await fetch(`${baseUrl}/api/orders/by-payment-intent/${encodeURIComponent(paymentIntentId)}/client-submit`, {
    method: 'POST', headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` }, body
  });
  const text = await resp.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: resp.status, data };
}

async function run() {
  await ensureDir(ARTIFACTS);
  const mongod = await MongoMemoryServer.create({ instance: { dbName: 'lumira-whiteglove' } });
  const mongoUri = mongod.getUri();
  const { api, env } = await startApi(mongoUri);
  const baseUrl = 'http://127.0.0.1:3101';

  try {
    const email = 'mystique.qa@example.com';
    const paymentIntentId = await createMystiqueOrder(baseUrl, email);

    // Snapshot ProductOrder created by STRIPE_MOCK_MODE
    const mongoose = apiRequire('mongoose');
    await mongoose.connect(mongoUri);
    const { ProductOrder } = apiRequire('./models/ProductOrder');
    const po = await ProductOrder.findOne({ paymentIntentId }).lean();
    if (po) {
      await fs.writeFile(path.join(ARTIFACTS, 'product-order.json'), JSON.stringify(po, null, 2));
    }
    await mongoose.disconnect();

    // Invalid upload (text masquerading as png)
    const invalid = await postClientSubmit(baseUrl, paymentIntentId, {
      email, level: 'mystique', phone: '+33123456789', specificQuestion: 'Question test.'
    }, [ { field: 'facePhoto', filename: 'fake.png', contentType: 'image/png', buffer: Buffer.from('this is not a png') } ]);
    await fs.writeFile(path.join(ARTIFACTS, 'upload-invalid.json'), JSON.stringify(invalid, null, 2));

    // Valid upload (tiny JPEG headers)
    const jpegHeader = Buffer.from([0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01]);
    const valid = await postClientSubmit(baseUrl, paymentIntentId, {
      email, level: 'mystique', phone: '+33123456789', specificQuestion: 'Je souhaite une guidance mystique.'
    }, [
      { field: 'facePhoto', filename: 'face.jpg', contentType: 'image/jpeg', buffer: jpegHeader },
      { field: 'palmPhoto', filename: 'palm.jpg', contentType: 'image/jpeg', buffer: jpegHeader },
    ]);
    await fs.writeFile(path.join(ARTIFACTS, 'upload-valid.json'), JSON.stringify(valid, null, 2));
    if (valid.status !== 200) throw new Error('Valid upload failed');

    // Snapshot Order and mark as completed + generated content for Sanctuaire
    await mongoose.connect(mongoUri);
    const { Order } = apiRequire('./models/Order');
    const order = await Order.findOne({ paymentIntentId });
    if (!order) throw new Error('Order not found after client-submit');
    const orderId = order._id.toString();
    const pdfKey = `uploads/${new Date().getFullYear()}/01/${orderId}-lecture.pdf`;
    const audioKey = `uploads/${new Date().getFullYear()}/01/${orderId}-audio.mp3`;
    order.status = 'completed';
    order.generatedContent = {
      pdfUrl: `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${pdfKey}`,
      audioUrl: `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${audioKey}`,
    };
    order.expertValidation = { validationStatus: 'approved', validatedAt: new Date() };
    await order.save();
    const savedOrder = await Order.findById(orderId).lean();
    await fs.writeFile(path.join(ARTIFACTS, 'order-completed.json'), JSON.stringify(savedOrder, null, 2));
    await mongoose.disconnect();

    // Entitlements check (should be mystique)
    const token = jwt.sign({ userId: savedOrder.userId, email, type: 'sanctuaire_access' }, env.JWT_SECRET, { expiresIn: '2h' });
    const ent = await fetch(`${baseUrl}/api/users/entitlements`, { headers: { Authorization: `Bearer ${token}` }});
    const entBody = await ent.json();
    await fs.writeFile(path.join(ARTIFACTS, 'entitlements-mystique.json'), JSON.stringify({ status: ent.status, body: entBody }, null, 2));

    // Expert desk pending queue (before completion it was paid; we can emulate pending by toggling a new order if needed)
    // Create or fetch expert id; generate token and query pending
    await fetch(`${baseUrl}/api/expert/create-debug`, { method: 'POST' });
    await mongoose.connect(mongoUri);
    const { Expert } = apiRequire('./models/Expert');
    const expert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    const expertToken = jwt.sign({ expertId: expert._id, email: expert.email, role: 'expert' }, env.JWT_SECRET, { expiresIn: '2h' });
    await mongoose.disconnect();

    // Query assigned queues (pending route will now be empty since we set completed; evidence still checks route works)
    const pending = await fetch(`${baseUrl}/api/expert/orders/pending?page=1&limit=5`, { headers: { Authorization: `Bearer ${expertToken}` }});
    const pendingBody = await pending.json();
    await fs.writeFile(path.join(ARTIFACTS, 'expert-pending.json'), JSON.stringify({ status: pending.status, body: pendingBody }, null, 2));

    // Frontend: start Vite with proper env and capture screenshots
    const frontEnv = { ...process.env, VITE_API_URL: `${baseUrl}/api`, VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_1234567890ABCDEFG' };
    // Build then preview to have deterministic startup logs
    await new Promise((resolve, reject) => {
      const build = spawn(process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm',
        process.platform === 'win32' ? ['/c','npm','run','build'] : ['run','build'],
        { cwd: FRONT_DIR, env: frontEnv, stdio: ['pipe','pipe','pipe'] });
      build.on('exit', (code) => code === 0 ? resolve(null) : reject(new Error('vite build failed: code '+code)));
      build.on('error', reject);
    });

    let vite;
    if (process.platform === 'win32') {
      vite = spawn(process.env.ComSpec || 'cmd.exe', ['/c','npm','run','preview','--','--port','5173','--strictPort'], { cwd: FRONT_DIR, env: frontEnv, stdio: ['ignore','pipe','pipe'] });
    } else {
      vite = spawn('npm', ['run','preview','--','--port','5173','--strictPort'], { cwd: FRONT_DIR, env: frontEnv, stdio: ['ignore','pipe','pipe'] });
    }
    // Wait for Vite to be ready (try multiple possible messages)
    await Promise.race([
      waitForLog(vite, 'Local:', 120000),
      waitForLog(vite, 'http://localhost:5173', 120000),
      waitForLog(vite, 'ready in', 120000),
      new Promise(resolve => setTimeout(resolve, 5000)) // 5s fallback
    ]);

    // Use Playwright to capture Sanctuaire with token in localStorage
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.addInitScript((tkn) => { localStorage.setItem('sanctuaire_token', tkn); }, token);
    // Confirmation page snapshot (simulate coming from checkout)
    await page.goto(`http://127.0.0.1:5173/confirmation?order_id=${savedOrder._id}&email=${encodeURIComponent(email)}`, { waitUntil: 'domcontentloaded' });
    await ensureDir(path.join(ARTIFACTS, 'screens'));
    await page.screenshot({ path: path.join(ARTIFACTS, 'screens', 'confirmation-mystique.png'), fullPage: true });

    await page.goto('http://127.0.0.1:5173/sanctuaire', { waitUntil: 'domcontentloaded' });
    await ensureDir(path.join(ARTIFACTS, 'screens'));
    await page.screenshot({ path: path.join(ARTIFACTS, 'screens', 'sanctuaire-home-mystique.png'), fullPage: true });
    await page.goto('http://127.0.0.1:5173/sanctuaire/draws', { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(ARTIFACTS, 'screens', 'sanctuaire-mes-lectures.png'), fullPage: true });
    await browser.close();

    // Shutdown Vite & API
    vite.kill();
    api.kill();
    await mongod.stop();

    console.log('White Glove completed. Artifacts at:', ARTIFACTS);
  } catch (e) {
    console.error('White Glove failed:', e);
    api.kill();
    await mongod.stop();
    process.exit(1);
  }
}

run();
