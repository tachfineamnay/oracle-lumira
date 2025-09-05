import express from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';

const router = express.Router();

// Get all orders (with pagination and filtering)
router.get('/', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filters: any = {};
    
    // Apply filters
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.level) {
      filters.level = parseInt(req.query.level);
    }
    
    if (req.query.email) {
      filters.userEmail = new RegExp(req.query.email, 'i');
    }
    
    if (req.query.dateFrom || req.query.dateTo) {
      filters.createdAt = {};
      if (req.query.dateFrom) {
        filters.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filters.createdAt.$lte = new Date(req.query.dateTo);
      }
    }
    
    const orders = await Order.find(filters)
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(filters);
    
    res.json({
      orders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    });
    
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone stripeCustomerId');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get order by order number
router.get('/number/:orderNumber', async (req: any, res: any) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('userId', 'firstName lastName email phone');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.patch('/:id/status', async (req: any, res: any) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'processing', 'completed', 'failed', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update expert review
router.patch('/:id/expert-review', async (req: any, res: any) => {
  try {
    const { expertId, status, notes } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'revision_needed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid expert review status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        'expertReview.expertId': expertId,
        'expertReview.status': status,
        'expertReview.notes': notes,
        'expertReview.reviewedAt': new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Update expert review error:', error);
    res.status(500).json({ error: 'Failed to update expert review' });
  }
});

// Update generated content
router.patch('/:id/content', async (req: any, res: any) => {
  try {
    const { generatedContent } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        generatedContent,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Update generated content error:', error);
    res.status(500).json({ error: 'Failed to update generated content' });
  }
});

// Mark order as delivered
router.patch('/:id/delivered', async (req: any, res: any) => {
  try {
    const { deliveryMethod } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        deliveredAt: new Date(),
        deliveryMethod,
        status: 'completed',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Mark order delivered error:', error);
    res.status(500).json({ error: 'Failed to mark order as delivered' });
  }
});

// Get orders statistics
router.get('/stats/overview', async (req: any, res: any) => {
  try {
    const stats = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'paid' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      }),
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
      ])
    ]);
    
    const levelStats = await Order.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      orderCounts: {
        pending: stats[0],
        paid: stats[1],
        processing: stats[2],
        completed: stats[3],
        today: stats[4]
      },
      totalRevenue: stats[5][0]?.totalRevenue || 0,
      levelStats
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export { router as orderRoutes };
