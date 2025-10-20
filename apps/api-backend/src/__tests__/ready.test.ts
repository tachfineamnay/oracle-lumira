/**
 * 🧪 TESTS UNITAIRES - ENDPOINT DE READINESS
 * Oracle Lumira - Tests complets pour /api/ready
 * 
 * Commandes de test:
 * - npm test ready.test.ts
 * - npm run test:watch ready.test.ts  
 * - npm run test:coverage
 */

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';

// Increase default timeout for async timer-based cases
jest.setTimeout(20000);

// Mock des dépendances
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1,
    db: {
      admin: () => ({
        ping: jest.fn()
      })
    },
    host: 'localhost',
    name: 'test_db'
  }
}));

jest.mock('stripe');

describe('🚀 Endpoint de Readiness - /api/ready', () => {
  let app: express.Application;
  let mockStripeAccount: jest.Mock;
  let mockMongoPing: jest.Mock;
  let readyRoutes: any;

  beforeEach(() => {
    // Configuration de l'app de test
    app = express();
    app.use(express.json());
    // Import route after mocks to ensure dependencies are mocked
    readyRoutes = require('../routes/ready').default;
    app.use('/api', readyRoutes);

    // Reset des mocks
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Mock Stripe
    mockStripeAccount = jest.fn();
    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      accounts: {
        retrieve: mockStripeAccount
      }
    } as any));

    // Mock MongoDB ping
    const mockMongoose = mongoose as any;
    // Create a stable ping mock and force admin() to return it so route code
    // uses the same function instance we control in tests
    mockMongoPing = jest.fn();
    mockMongoose.connection.db.admin = () => ({ ping: mockMongoPing });

    // Variables d'environnement pour tests
    process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
    process.env.NODE_ENV = 'test';
    process.env.npm_package_version = '1.0.0';
    delete process.env.READY_GLOBAL_TIMEOUT_TEST;
    delete process.env.READY_MONGO_TIMEOUT_TEST;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers(); // Nettoie les fake timers après chaque test
  });

  describe('✅ Cas de succès - Tous les services OK', () => {
    beforeEach(() => {
      // Mock succès MongoDB
      (mongoose.connection as any).readyState = 1;
      mockMongoPing.mockResolvedValue({ ok: 1 });

      // Mock succès Stripe
      mockStripeAccount.mockResolvedValue({ id: 'acct_test123' });
    });

    it('devrait retourner 200 OK quand tous les services sont opérationnels', async () => {
      const response = await request(app)
        .get('/api/ready')
        .expect(200);

      expect(response.body).toMatchObject({
        ready: true,
        services: {
          mongodb: {
            connected: true
          },
          stripe: {
            initialized: true
          },
          memory: {
            status: expect.stringMatching(/ok|warning|critical/),
            used: expect.any(Number),
            free: expect.any(Number),
            percentage: expect.any(Number)
          },
          uptime: expect.any(Number)
        },
        version: '1.0.0',
        environment: 'test'
      });

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.services.mongodb.responseTime).toBeGreaterThanOrEqual(0);
      expect(response.body.services.stripe.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('devrait inclure les headers de cache et debug', async () => {
      const response = await request(app)
        .get('/api/ready')
        .expect(200);

      expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');
      expect(response.headers['x-ready-status']).toBe('ok');
      expect(response.headers['x-response-time']).toMatch(/\d+ms/);
    });
  });

  describe('❌ Cas d\'échec - Services indisponibles', () => {
    it('devrait retourner 503 quand MongoDB est déconnecté', async () => {
      // Mock MongoDB déconnecté
      (mongoose.connection as any).readyState = 0;

      const response = await request(app)
        .get('/api/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        ready: false,
        services: {
          mongodb: {
            connected: false,
            error: expect.stringContaining('MongoDB connection state: 0')
          }
        }
      });

      expect(response.headers['x-ready-status']).toBe('not-ready');
    });

    it('devrait retourner 503 quand Stripe n\'est pas configuré', async () => {
      // Mock Stripe non configuré
      delete process.env.STRIPE_SECRET_KEY;

      // MongoDB OK
      (mongoose.connection as any).readyState = 1;
      mockMongoPing.mockResolvedValue({ ok: 1 });

      const response = await request(app)
        .get('/api/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        ready: false,
        services: {
          mongodb: {
            connected: true
          },
          stripe: {
            initialized: false,
            error: 'STRIPE_SECRET_KEY not configured'
          }
        }
      });
    });

    it('devrait retourner 503 quand MongoDB ping échoue', async () => {
      // Mock MongoDB connecté mais ping échoue
      (mongoose.connection as any).readyState = 1;
      mockMongoPing.mockRejectedValue(new Error('Network timeout'));

      // Stripe OK
      mockStripeAccount.mockResolvedValue({ id: 'acct_test123' });

      const response = await request(app)
        .get('/api/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        ready: false,
        services: {
          mongodb: {
            connected: false,
            error: 'Network timeout'
          },
          stripe: {
            initialized: true
          }
        }
      });
    });

    it('devrait retourner 503 quand Stripe API échoue', async () => {
      // Mock MongoDB OK
      (mongoose.connection as any).readyState = 1;
      mockMongoPing.mockResolvedValue({ ok: 1 });

      // Mock Stripe API échoue
      mockStripeAccount.mockRejectedValue(new Error('Invalid API key'));

      const response = await request(app)
        .get('/api/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        ready: false,
        services: {
          mongodb: {
            connected: true
          },
          stripe: {
            initialized: false,
            error: 'Invalid API key'
          }
        }
      });
    });
  });

  describe('⏱️ Gestion des timeouts', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('devrait retourner 408 en cas de timeout global', async () => {
      process.env.READY_GLOBAL_TIMEOUT_TEST = 'true';
      // Mock MongoDB qui traîne
      (mongoose.connection as any).readyState = 1;
      mockMongoPing.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10000)) // 10s
      );

      const responsePromise = request(app).get('/api/ready');
      // Avancer le temps pour déclencher le timeout (async timers)
      // Use async variant to ensure timers that schedule microtasks are processed
      // and flush any pending timers before awaiting the response
      await jest.advanceTimersByTimeAsync(6000);
      const response = await responsePromise;
      expect(response.status).toBe(408);
      expect(response.body.ready).toBe(false);
      delete process.env.READY_GLOBAL_TIMEOUT_TEST;
    });

    it('devrait retourner 503 en cas de timeout MongoDB spécifique', async () => {
      delete process.env.READY_GLOBAL_TIMEOUT_TEST;
      process.env.READY_MONGO_TIMEOUT_TEST = 'true';
      // Mock MongoDB timeout
      (mongoose.connection as any).readyState = 1;
      mockMongoPing.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 3000)) // 3s > MONGO_PING_TIMEOUT
      );

      // Stripe OK
      mockStripeAccount.mockResolvedValue({ id: 'acct_test123' });

      const responsePromise = request(app).get('/api/ready');
      // Avancer le temps pour déclencher le timeout MongoDB
      await jest.advanceTimersByTimeAsync(2500);
      const response = await responsePromise;
      expect(response.status).toBe(503);
      expect(response.body.services.mongodb.connected).toBe(false);
      expect(response.body.services.mongodb.error).toContain('timeout');
      delete process.env.READY_MONGO_TIMEOUT_TEST;
    });
  });

  describe('🔍 Endpoint verbose - /api/ready/verbose', () => {
    beforeEach(() => {
      // Mock succès pour tous les services
      (mongoose.connection as any).readyState = 1;
      (mongoose.connection as any).host = 'localhost';
      (mongoose.connection as any).name = 'lumira_test';
      mockMongoPing.mockResolvedValue({ ok: 1 });
      mockStripeAccount.mockResolvedValue({ id: 'acct_test123' });
    });

    it('devrait retourner des informations détaillées en mode développement', async () => {
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/api/ready/verbose')
        .expect(200);

      expect(response.body).toMatchObject({
        ready: true,
        services: {
          mongodb: {
            connected: true,
            connectionState: 1,
            host: 'localhost',
            name: 'lumira_test'
          },
          stripe: {
            initialized: true,
            keyConfigured: true,
            keyPrefix: 'sk_test'
          },
          memory: {
            status: expect.any(String),
            detailed: expect.objectContaining({
              rss: expect.any(Number),
              heapTotal: expect.any(Number),
              heapUsed: expect.any(Number)
            })
          }
        },
        environment: {
          node_version: expect.stringMatching(/^v\d+\.\d+\.\d+/),
          platform: expect.any(String),
          arch: expect.any(String),
          env: 'development'
        }
      });
    });

    it('devrait refuser l\'accès verbose en production', async () => {
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/ready/verbose')
        .expect(403);

      expect(response.body).toMatchObject({
        error: 'Verbose readiness check not available in production',
        hint: 'Use /api/ready instead'
      });
    });
  });

  describe('📊 Analyse mémoire', () => {
    it('devrait calculer correctement les métriques mémoire', async () => {
      // Mock MongoDB et Stripe OK
      (mongoose.connection as any).readyState = 1;
      mockMongoPing.mockResolvedValue({ ok: 1 });
      mockStripeAccount.mockResolvedValue({ id: 'acct_test123' });

      const response = await request(app)
        .get('/api/ready')
        .expect(200);

      const memory = response.body.services.memory;
      
      expect(memory.used).toBeGreaterThan(0);
      expect(memory.free).toBeGreaterThan(0);
      expect(memory.percentage).toBeGreaterThan(0);
      expect(memory.percentage).toBeLessThanOrEqual(100);
      expect(['ok', 'warning', 'critical']).toContain(memory.status);
    });
  });

  describe('🚨 Gestion d\'erreurs', () => {
    it('devrait gérer les erreurs inattendues', async () => {
      // Mock erreur inattendue
      mockMongoPing.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .get('/api/ready')
        .expect(503);

      expect(response.body.ready).toBe(false);
      expect(response.headers['x-ready-status']).toBe('error');
    });

    it('devrait inclure le temps de réponse même en cas d\'erreur', async () => {
      mockMongoPing.mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .get('/api/ready')
        .expect(503);

      expect(response.headers['x-response-time']).toMatch(/\d+ms/);
      expect(response.body.services.mongodb.responseTime).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * 🧪 TESTS D'INTÉGRATION SUPPLÉMENTAIRES
 * Ces tests nécessitent une vraie base MongoDB et Stripe configurés
 */
describe('🔗 Tests d\'intégration (optionnels)', () => {
  // Ces tests sont skippés par défaut et nécessitent une configuration manuelle
  describe.skip('Base MongoDB réelle', () => {
    it('devrait se connecter à MongoDB en local', async () => {
      // Test avec vraie MongoDB locale
      // Nécessite: docker run -d -p 27017:27017 mongo:7
    });
  });

  describe.skip('API Stripe réelle', () => {
    it('devrait valider la clé API Stripe de test', async () => {
      // Test avec vraie API Stripe
      // Nécessite: STRIPE_SECRET_KEY=sk_test_xxx
    });
  });
});
