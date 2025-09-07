console.log('✅ [API] server.ts - Script started');

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
import paymentRoutes from './routes/payments';

console.log('✅ [API] server.ts - Imports loaded');

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

console.log('✅ [API] server.ts - Logger configured');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
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

console.log('✅ [API] server.ts - Helmet configured');

const allowedOrigins = [
  'https://oraclelumira.com',
  'https://desk.oraclelumira.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      logger.error(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

console.log('✅ [API] server.ts - CORS configured');

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

console.log('✅ [API] server.ts - Middleware configured');

// Health check routes (before other routes)
app.use('/api/health', healthRoutes);
app.use('/api', readyRoutes);

// API Routes
app.use('/api/stripe', stripeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Test/debug routes only in non-production environments
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/expert', expertTestRoutes);
  logger.info('Expert test routes mounted (non-production environment)');
} else {
  logger.info('Expert test routes disabled in production environment');
}

console.log('✅ [API] server.ts - Routes configured');

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
  logger.error('❌ MONGODB_URI is not defined in .env file');
  console.error('❌ [API] MONGODB_URI is not defined in .env file. The application will now exit.');
  process.exit(1);
}

console.log('✅ [API] server.ts - Connecting to MongoDB...');
logger.info('Connecting to MongoDB...');

// Disable autoIndex in production for performance
if (process.env.NODE_ENV === 'production') {
  mongoose.set('autoIndex', false);
  logger.info('MongoDB autoIndex disabled in production');
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ [API] server.ts - MongoDB connected successfully');
    logger.info('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`✅ [API] Server is running on port ${PORT}`);
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ [API] server.ts - MongoDB connection error:', err.message);
    logger.error('MongoDB connection error:', { error: err.message, stack: err.stack });
    process.exit(1);
  });
