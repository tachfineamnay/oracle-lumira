import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Order } from '../models/Order';

const router = express.Router();

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  commitSha?: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected';
    stripe: 'configured' | 'missing';
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Vérification base de données
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Vérification Stripe
    const stripeStatus = process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing';
    
    // Métriques mémoire
    const memUsage = process.memoryUsage();
    const memoryInfo = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    };

    // Déterminer status global
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (dbStatus === 'disconnected') status = 'unhealthy';
    if (stripeStatus === 'missing' && process.env.NODE_ENV === 'production') status = 'degraded';

    const health: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      commitSha: process.env.COMMIT_SHA,
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        stripe: stripeStatus
      },
      memory: memoryInfo
    };

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: process.env.NODE_ENV === 'development' ? message : undefined
    });
  }
});

// Deep health check
router.get('/deep', async (req, res) => {
  try {
    // Check database with actual queries
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        collections: {
          users: userCount,
          orders: orderCount,
          recentOrders: recentOrders
        }
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database check failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

async function checkDatabaseHealth(): Promise<string> {
  try {
    // Simple ping to check if MongoDB is responsive
    const mongoose = require('mongoose');
    await mongoose.connection.db.admin().ping();
    return 'connected';
  } catch (error) {
    throw new Error(`Database connection failed: ${error}`);
  }
}

export { router as healthRoutes };
