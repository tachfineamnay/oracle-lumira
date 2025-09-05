import express from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseHealth();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        api: 'healthy'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
      details: process.env.NODE_ENV === 'development' ? error : undefined
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
