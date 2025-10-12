console.log('? [API] server.ts - Script started');

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

// Import routes
import { stripeRoutes } from './routes/stripe';
import { orderRoutes } from './routes/orders';
import { userRoutes } from './routes/users';
import { healthRoutes } from './routes/health';
import readyRoutes from './routes/ready';
import expertTestRoutes from './routes/expert-test';
import { expertRoutes } from './routes/expert';
import paymentRoutes from './routes/payments';
import productRoutes from './routes/products';
import envDebugRoutes from './routes/env-debug';

console.log('? [API] server.ts - Imports loaded');

dotenv.config();

// Logger setup - Console only for containerized environments
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.colorize(),
    format.simple()
  ),
  transports: [
    new transports.Console()
  ]
});

console.log('? [API] server.ts - Logger configured');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Rate limiting - Increased limit to handle higher traffic spikes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased from 100 to 500 to handle traffic spikes
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use a more specific key if behind a proxy, otherwise fallback to IP
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor && typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }
    return req.ip || 'unknown';
  },
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

console.log('? [API] server.ts - Helmet configured');

// CORS config from env or defaults
const envCors = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean) || [];
const allowedOrigins = envCors.length > 0 ? envCors : [
  'https://oraclelumira.com',
  'https://desk.oraclelumira.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

// Production-ready CORS configuration
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  credentials: false, // No cookies needed for API
  optionsSuccessStatus: 204, // Proper preflight response
};

app.use(cors(corsOptions));

// Explicit OPTIONS handler for preflight requests
app.options('*', (req, res) => {
  res.sendStatus(204);
});

console.log('? [API] server.ts - CORS configured for production');

// Apply general rate limiting to all requests
app.use(apiLimiter);

// Webhook routes MUST come before body parsing middleware
// Stripe webhooks need raw body for signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use('/api/products/webhook', express.raw({ type: 'application/json' }));
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
// n8n callback requires raw body for HMAC verification
app.use('/api/expert/n8n-callback', express.raw({ type: 'application/json' }));

// Body parsing middleware (after webhook routes)
// Skip JSON parsing for upload routes to avoid conflicts with Multer
app.use((req, res, next) => {
  // Skip JSON parsing for routes that handle file uploads
  if (req.path.includes('client-submit')) {
    console.log('[MIDDLEWARE] Skipping JSON parsing for client-submit route:', req.path);
    return next();
  }
  return express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  // Skip URL encoding for routes that handle file uploads
  if (req.path.includes('client-submit')) {
    return next();
  }
  return express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

console.log('? [API] server.ts - Middleware configured');

// Simple healthcheck endpoint for Coolify
app.get('/api/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check routes (before other routes)
app.use('/api/health', healthRoutes);
app.use('/api', readyRoutes);

// API Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/debug', envDebugRoutes);
// Mount real expert routes (production-ready)
app.use('/api/expert', expertRoutes);

// Test/debug routes only in non-production environments
if (process.env.NODE_ENV !== 'production') {
  // Mount test endpoints under separate path to avoid conflicts
  app.use('/api/expert-test', expertTestRoutes);
  logger.info('Expert test routes mounted under /api/expert-test (non-production environment)');
} else {
  logger.info('Expert test routes disabled in production environment');
}

console.log('? [API] server.ts - Routes configured');

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ message: 'Internal Server Error' });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  logger.warn('?? MONGODB_URI is not defined - Using mock MongoDB mode for development');
  console.warn('?? [API] MONGODB_URI is not defined - Using mock MongoDB mode for development');
  
  // Start server without MongoDB in mock mode
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`? [API] Server is running on port ${PORT} (all interfaces) - MOCK MODE`);
    logger.info(`Server is running on port ${PORT} (all interfaces) - MOCK MODE`);
  });
} else {
  console.log('? [API] server.ts - Connecting to MongoDB...');
  logger.info('Connecting to MongoDB...');

  // Disable autoIndex in production for performance
  if (process.env.NODE_ENV === 'production') {
    mongoose.set('autoIndex', false);
    logger.info('MongoDB autoIndex disabled in production');
  }

  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('? [API] server.ts - MongoDB connected successfully');
      logger.info('MongoDB connected successfully');
      
      // Listen on all interfaces for Docker compatibility
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`? [API] Server is running on port ${PORT} (all interfaces)`);
        logger.info(`Server is running on port ${PORT} (all interfaces)`);
      });
    })
    .catch(err => {
      console.error('? [API] server.ts - MongoDB connection error:', err.message);
      logger.error('MongoDB connection error:', { error: err.message, stack: err.stack });
      process.exit(1);
    });
}
