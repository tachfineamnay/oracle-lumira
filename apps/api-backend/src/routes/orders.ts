import express from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Client submission: attach uploaded files + form data by paymentIntentId
router.post('/by-payment-intent/:paymentIntentId/client-submit', async (req: any, res: any) => {
  try {
    const { paymentIntentId } = req.params;
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({ error: 'paymentIntentId invalid' });
    }

    const order = await Order.findOne({ paymentIntentId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found for paymentIntentId', paymentIntentId });
    }

    const { files = [], formData = {}, clientInputs = {} } = req.body || {};

    // Normalize and merge files; treat path as remote URL if provided
    const normalized = Array.isArray(files) ? files.map((f: any) => ({
      filename: String(f.name || f.filename || 'file'),
      originalName: String(f.originalName || f.name || 'file'),
      path: String(f.url || f.path || ''),
      mimetype: String(f.type || f.mimetype || ''),
      size: Number(f.size || 0),
      uploadedAt: new Date()
    })) : [];

    // De-duplicate by originalName+size
    const existing = order.files || [];
    const combined = [...existing];
    normalized.forEach((nf: any) => {
      const dup = existing.find((ef: any) => ef.originalName === nf.originalName && ef.size === nf.size);
      if (!dup) combined.push(nf);
    });

    order.files = combined as any;

    // Merge formData if provided; only overwrite defined fields
    order.formData = {
      ...order.formData,
      phone: formData.phone ?? order.formData?.phone,
      email: formData.email ?? order.formData?.email,
      firstName: formData.firstName ?? order.formData?.firstName,
      lastName: formData.lastName ?? order.formData?.lastName,
      specificQuestion: formData.objective ?? formData.specificQuestion ?? order.formData?.specificQuestion,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : order.formData?.dateOfBirth,
      preferences: {
        ...order.formData?.preferences,
        deliveryFormat: formData.deliveryFormat ?? order.formData?.preferences?.deliveryFormat,
        audioVoice: formData.audioVoice ?? order.formData?.preferences?.audioVoice,
      }
    } as any;

    order.clientInputs = {
      ...order.clientInputs,
      birthTime: clientInputs.birthTime ?? order.clientInputs?.birthTime,
      birthPlace: clientInputs.birthPlace ?? order.clientInputs?.birthPlace,
      specificContext: clientInputs.specificContext ?? order.clientInputs?.specificContext,
      lifeQuestion: clientInputs.lifeQuestion ?? order.clientInputs?.lifeQuestion,
    } as any;

    order.updatedAt = new Date();
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error('Client submit error:', error);
    res.status(500).json({ error: 'Failed to attach client submission' });
  }
});

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

// Middleware pour authentifier les utilisateurs sanctuaire (réutilisé depuis users.ts)
const authenticateSanctuaire = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    
    if (decoded.type !== 'sanctuaire_access') {
      return res.status(401).json({ error: 'Token invalide pour le sanctuaire' });
    }
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// ENDPOINT SANCTUAIRE - Récupérer le contenu complet d'une commande
router.get('/:id/content', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    
    // Vérifier que la commande appartient à l'utilisateur et est complétée
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
      status: 'completed',
      'expertValidation.validationStatus': 'approved'
    }).populate('userId', 'firstName lastName email');
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Commande non trouvée ou non accessible',
        message: 'Cette commande n\'existe pas ou n\'a pas encore été validée par un expert'
      });
    }
    
    // Formater la réponse avec tout le contenu validé
    const content = {
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        level: order.level,
        levelName: order.levelName,
        amount: order.amount,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt
      },
      client: {
        firstName: order.formData?.firstName,
        lastName: order.formData?.lastName,
        specificQuestion: order.formData?.specificQuestion
      },
      generatedContent: order.generatedContent,
      expertValidation: {
        validatedAt: order.expertValidation?.validatedAt,
        validationNotes: order.expertValidation?.validationNotes,
        validatorName: order.expertValidation?.validatorName
      },
      availableFormats: {
        hasReading: !!order.generatedContent?.reading,
        hasPdf: !!order.generatedContent?.pdfUrl,
        hasAudio: !!order.generatedContent?.audioUrl,
        hasMandala: !!order.generatedContent?.mandalaSvg,
        hasRitual: !!order.generatedContent?.ritual
      }
    };
    
    res.json(content);
    
  } catch (error) {
    console.error('Get order content error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du contenu' });
  }
});
