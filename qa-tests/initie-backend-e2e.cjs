const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');
const { createRequire } = require('module');

const ROOT_DIR = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT_DIR, 'apps', 'api-backend');
const apiRequire = createRequire(path.join(API_DIR, 'dist', 'server.js'));
const jwt = apiRequire('jsonwebtoken');
const mongoose = apiRequire('mongoose');
const { MongoMemoryServer } = apiRequire('mongodb-memory-server');

const ARTIFACT_ROOT = path.join(__dirname, 'artifacts');
const BACKEND_ARTIFACTS = path.join(ARTIFACT_ROOT, 'backend');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function appendFileSafe(filePath, content) {
  return fs.appendFile(filePath, content).catch((err) => {
    console.warn('Failed to append to log file:', err.message);
  });
}

function waitForServerReady(child, logFile, readyText, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error(`Server did not emit "${readyText}" within ${timeoutMs}ms`));
      }
    }, timeoutMs);

    const handleStdout = (chunk) => {
      const text = chunk.toString();
      appendFileSafe(logFile, text);
      if (!resolved && text.includes(readyText)) {
        resolved = true;
        clearTimeout(timeout);
        cleanup();
        resolve();
      }
    };

    const handleStderr = (chunk) => {
      appendFileSafe(logFile, chunk.toString());
    };

    const handleExit = (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`Server exited prematurely with code ${code}`));
      }
    };

    const cleanup = () => {
      child.stdout?.off('data', handleStdout);
      child.stderr?.off('data', handleStderr);
      child.off('exit', handleExit);
    };

    child.stdout?.on('data', handleStdout);
    child.stderr?.on('data', handleStderr);
    child.once('exit', handleExit);
  });
}

async function seedInitiateUser(mongoUri) {
  await mongoose.connect(mongoUri);
  const { User } = require(path.join(API_DIR, 'dist', 'models', 'User'));
  const { ProductOrder } = require(path.join(API_DIR, 'dist', 'models', 'ProductOrder'));

  const userId = new mongoose.Types.ObjectId();
  const now = new Date();

  const user = await User.create({
    _id: userId,
    email: 'initie@example.com',
    firstName: 'Ines',
    lastName: 'Initie',
    subscriptionStatus: 'active',
    totalOrders: 1,
    createdAt: now,
    updatedAt: now
  });

  await ProductOrder.create({
    productId: 'initie',
    customerEmail: 'initie@example.com',
    amount: 2700,
    currency: 'eur',
    status: 'completed',
    paymentIntentId: `pi_test_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
    metadata: {
      source: 'qa-script',
      note: 'Seeded for initié entitlements test'
    }
  });

  await mongoose.disconnect();
  return user;
}

async function runBackendEntitlementsScenario() {
  await ensureDir(BACKEND_ARTIFACTS);
  const serverLogPath = path.join(BACKEND_ARTIFACTS, 'api-server.log');
  await fs.writeFile(serverLogPath, ''); // reset log

  const mongod = await MongoMemoryServer.create({
    instance: { dbName: 'lumira-sanctuaire' }
  });

  const mongoUri = mongod.getUri();

  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3101',
    MONGODB_URI: mongoUri,
    JWT_SECRET: 'sanctuaire-test-secret',
    STRIPE_SECRET_KEY: 'sk_test_dummy',
    STRIPE_WEBHOOK_SECRET: 'whsec_dummy',
    STRIPE_MOCK_MODE: 'true',
    AWS_REGION: 'us-east-1',
    AWS_S3_BUCKET_NAME: 'qa-test-bucket',
    AWS_ACCESS_KEY_ID: 'test-access-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret-key',
    CORS_ORIGIN: 'http://localhost:5173,http://localhost:4173'
  };

  const serverProcess = spawn(
    process.execPath,
    ['dist/server.js'],
    {
      cwd: API_DIR,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    }
  );

  try {
    await waitForServerReady(
      serverProcess,
      serverLogPath,
      'Server is running on port 3101'
    );

    const user = await seedInitiateUser(mongoUri);

    const baseUrl = 'http://127.0.0.1:3101';
    const proofsDir = path.join(BACKEND_ARTIFACTS, 'entitlements');
    await ensureDir(proofsDir);

    const unauthResponse = await fetch(`${baseUrl}/api/users/entitlements`, {
      method: 'GET'
    });
    const unauthBody = await unauthResponse.json().catch(async () => {
      const text = await unauthResponse.text();
      return { raw: text };
    });
    await fs.writeFile(
      path.join(proofsDir, 'step1-unauthenticated.json'),
      JSON.stringify({
        status: unauthResponse.status,
        body: unauthBody
      }, null, 2)
    );

    const token = jwt.sign(
      {
        userId: user._id.toHexString(),
        email: user.email,
        type: 'sanctuaire_access'
      },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    const authResponse = await fetch(`${baseUrl}/api/users/entitlements`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const authBody = await authResponse.json();
    await fs.writeFile(
      path.join(proofsDir, 'step2-authenticated.json'),
      JSON.stringify({
        status: authResponse.status,
        body: authBody
      }, null, 2)
    );

    return {
      mongoUri,
      token,
      user,
      authBody,
      serverLogPath,
      proofsDir,
      mongod,
      serverProcess
    };
  } catch (error) {
    serverProcess.kill();
    await mongod.stop();
    throw error;
  }
}

async function simulatePurchaseFlow(baseUrl, mongoUri) {
  const purchaseDir = path.join(BACKEND_ARTIFACTS, 'purchase');
  await ensureDir(purchaseDir);

  const payload = {
    productId: 'initie',
    customerEmail: 'initiated.qa@example.com',
    customerName: 'QA Initiée',
    customerPhone: '+33123456789',
    metadata: {
      scenario: 'initié-purchase-flow',
      initiatedBy: 'qa-script'
    }
  };

  let response;
  try {
    response = await fetch(`${baseUrl}/api/products/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    const failurePath = path.join(purchaseDir, 'create-payment-intent-network-error.json');
    await fs.writeFile(
      failurePath,
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }, null, 2)
    );
    console.error('Network failure during purchase simulation:', error);
    return { status: null, body: null, artifact: failurePath };
  }

  let body;
  const rawText = await response.text();
  try {
    body = JSON.parse(rawText);
  } catch {
    body = { raw: rawText };
  }

  const artifactPath = path.join(purchaseDir, 'create-payment-intent-response.json');
  await fs.writeFile(
    artifactPath,
    JSON.stringify({
      status: response.status,
      body,
      requestPayload: payload
    }, null, 2)
  );

  let productOrderSnapshot = null;
  if (response.status === 200) {
    try {
      await mongoose.connect(mongoUri);
      const { ProductOrder } = apiRequire('./models/ProductOrder');
      const recentOrder = await ProductOrder.findOne({ paymentIntentId: body.orderId }).lean();
      if (recentOrder) {
        productOrderSnapshot = {
          productId: recentOrder.productId,
          status: recentOrder.status,
          amount: recentOrder.amount,
          currency: recentOrder.currency,
          metadata: recentOrder.metadata,
          createdAt: recentOrder.createdAt,
          updatedAt: recentOrder.updatedAt,
          completedAt: recentOrder.completedAt,
        };
        await fs.writeFile(
          path.join(purchaseDir, 'product-order.json'),
          JSON.stringify(productOrderSnapshot, null, 2)
        );
      }
    } catch (error) {
      console.error('Failed to snapshot ProductOrder:', error);
    } finally {
      await mongoose.disconnect().catch(() => {});
    }
  }

  return { status: response.status, body, artifact: artifactPath, productOrderSnapshot };
}

async function main() {
  try {
    const context = await runBackendEntitlementsScenario();

    console.log('Backend entitlements scenario completed successfully.');
    console.log(`Proof artifacts stored at: ${context.proofsDir}`);
    console.log(`Authenticated capabilities: ${JSON.stringify(context.authBody, null, 2)}`);

    const purchaseResult = await simulatePurchaseFlow('http://127.0.0.1:3101', context.mongoUri);
    console.log('Purchase simulation result:', purchaseResult);

    context.serverProcess.kill();
    await context.mongod.stop();
  } catch (error) {
    console.error('E2E backend scenario failed:', error);
    process.exitCode = 1;
  }
}

main();
