import express from 'express';
import { User } from '../models/User';

const router = express.Router();

// Get all users (with pagination)
router.get('/', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters: any = {};
    
    // Apply filters
    if (req.query.email) {
      filters.email = new RegExp(req.query.email, 'i');
    }
    
    if (req.query.status) {
      filters.subscriptionStatus = req.query.status;
    }
    
    const users = await User.find(filters)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filters);
    
    res.json({
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.patch('/:id', async (req: any, res: any) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.createdAt;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ error: 'Failed to update user', details: error });
  }
});

// Get user statistics
router.get('/:id/stats', async (req: any, res: any) => {
  try {
    const userId = req.params.id;
    const { Order } = require('../models/Order');
    
    const [user, orders] = await Promise.all([
      User.findById(userId),
      Order.find({ userId }).sort({ createdAt: -1 })
    ]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stats = {
      user: user,
      orderStats: {
        total: orders.length,
        completed: orders.filter((o: any) => o.status === 'completed').length,
        pending: orders.filter((o: any) => o.status === 'pending').length,
        totalSpent: orders.reduce((sum: number, o: any) => sum + o.amount, 0)
      },
      recentOrders: orders.slice(0, 5),
      levelDistribution: orders.reduce((acc: any, order: any) => {
        acc[order.level] = (acc[order.level] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export { router as userRoutes };
