// Oracle Lumira - Products Route Tests
import request from 'supertest';
import express from 'express';
import productRoutes from '../routes/products';
import { PRODUCT_CATALOG } from '../catalog';

// Mock Stripe Service
jest.mock('../services/stripe', () => ({
  StripeService: {
    createPaymentIntent: jest.fn(),
  },
}));

const { StripeService } = require('../services/stripe');

describe('POST /api/products/create-payment-intent', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/products', productRoutes);

    // Reset mocks
    jest.clearAllMocks();

    // Set required environment variable
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_123';
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  describe('Happy Path', () => {
    it('should create payment intent successfully for valid mystique product', async () => {
      // Mock successful Stripe response
      const mockPaymentData = {
        clientSecret: 'pi_test_client_secret_123',
        paymentIntentId: 'pi_test_payment_intent_123',
        amount: 9900,
        currency: 'eur',
        productName: 'Niveau Mystique',
      };
      StripeService.createPaymentIntent.mockResolvedValue(mockPaymentData);

      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send({
          productId: 'mystique',
          customerEmail: 'test@example.com',
        })
        .expect(200);

      expect(response.body).toEqual({
        clientSecret: 'pi_test_client_secret_123',
        orderId: 'pi_test_payment_intent_123',
        amount: 9900,
        currency: 'eur',
        productName: 'Niveau Mystique',
      });

      expect(StripeService.createPaymentIntent).toHaveBeenCalledWith({
        productId: 'mystique',
        customerEmail: 'test@example.com',
        metadata: expect.objectContaining({
          source: 'spa-checkout',
          timestamp: expect.any(String),
          requestId: expect.any(String),
        }),
      });
    });

    it('should work without customer email', async () => {
      const mockPaymentData = {
        clientSecret: 'pi_test_client_secret_456',
        paymentIntentId: 'pi_test_payment_intent_456',
        amount: 4900,
        currency: 'eur',
        productName: 'Niveau Initié',
      };
      StripeService.createPaymentIntent.mockResolvedValue(mockPaymentData);

      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send({
          productId: 'initie',
        })
        .expect(200);

      expect(response.body.orderId).toBe('pi_test_payment_intent_456');
    });
  });

  describe('Validation Errors (4xx)', () => {
    it('should return 400 for missing productId', async () => {
      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send({
          customerEmail: 'test@example.com',
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Product ID is required',
        code: 'MISSING_PRODUCT_ID',
        message: 'The productId field is required and must be a non-empty string',
        validProductIds: Object.keys(PRODUCT_CATALOG),
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('should return 404 for unknown product', async () => {
      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send({
          productId: 'unknown-product',
          customerEmail: 'test@example.com',
        })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND',
        message: "Product 'unknown-product' does not exist",
        validProductIds: Object.keys(PRODUCT_CATALOG),
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send({
          productId: 'mystique',
          customerEmail: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL',
        message: 'Customer email must be a valid email address',
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send('invalid-json-string')
        .expect(400);

      expect(response.body.error).toBe('Invalid request body');
      expect(response.body.code).toBe('INVALID_REQUEST_BODY');
    });
  });

  describe('Stripe Errors (502)', () => {
    it('should return 502 for missing STRIPE_SECRET_KEY', async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send({
          productId: 'mystique',
          customerEmail: 'test@example.com',
        })
        .expect(502);

      expect(response.body).toEqual({
        error: 'Payment service configuration error',
        code: 'STRIPE_CONFIG_ERROR',
        message: 'Payment processing is temporarily unavailable',
        timestamp: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('should return 502 for Stripe service errors', async () => {
      const stripeError = new Error('Stripe API error: Invalid API key');
      StripeService.createPaymentIntent.mockRejectedValue(stripeError);

      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send({
          productId: 'mystique',
          customerEmail: 'test@example.com',
        })
        .expect(502);

      expect(response.body.error).toBe('Payment service error');
      expect(response.body.code).toBe('STRIPE_SERVICE_ERROR');
    });
  });

  describe('Server Errors (500)', () => {
    it('should return 500 for unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      StripeService.createPaymentIntent.mockRejectedValue(unexpectedError);

      const response = await request(app)
        .post('/api/products/create-payment-intent')
        .send({
          productId: 'mystique',
          customerEmail: 'test@example.com',
        })
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
      expect(response.body.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
