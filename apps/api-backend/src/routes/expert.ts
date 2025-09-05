import express from 'express';
import jwt from 'jsonwebtoken';
import { Expert } from '../models/Expert';
import { Order } from '../models/Order';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import axios from 'axios';

const router = express.Router();

// Rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const promptSchema = Joi.object({
  orderId: Joi.string().required(),
  expertPrompt: Joi.string().min(10).required(),
  expertInstructions: Joi.string().optional(),
  n8nWebhookUrl: Joi.string().uri().optional()
});

// Auth middleware
export const authenticateExpert = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const expert = await Expert.findById(decoded.expertId).select('-password');
    
    if (!expert || !expert.isActive) {
      return res.status(401).json({ error: 'Expert non autorisé' });
    }

    req.expert = expert;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// Login expert
router.post('/login', authLimiter, async (req: any, res: any) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    
    // Find expert
    const expert = await Expert.findOne({ email: email.toLowerCase(), isActive: true });
    if (!expert) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Check password
    const validPassword = await expert.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Update last login
    expert.lastLogin = new Date();
    await expert.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        expertId: expert._id, 
        email: expert.email,
        name: expert.name 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      expert: {
        id: expert._id,
        name: expert.name,
        email: expert.email,
        lastLogin: expert.lastLogin
      }
    });

  } catch (error) {
    console.error('Expert login error:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

// Verify token (for client-side auth check)
router.get('/verify', authenticateExpert, async (req: any, res: any) => {
  res.json({
    valid: true,
    expert: {
      id: req.expert._id,
      name: req.expert.name,
      email: req.expert.email
    }
  });
});

// Get pending orders for expert
router.get('/orders/pending', authenticateExpert, async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      status: { $in: ['pending', 'paid'] }
    })
    .populate('userId', 'firstName lastName email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('orderNumber level levelName amount status formData createdAt files clientInputs');

    const total = await Order.countDocuments({
      status: { $in: ['pending', 'paid'] }
    });

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
    console.error('Get pending orders error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des commandes' });
  }
});

// Get single order details
router.get('/orders/:id', authenticateExpert, async (req: any, res: any) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de la commande' });
  }
});

// Process order - Send to n8n
router.post('/process-order', authenticateExpert, async (req: any, res: any) => {
  try {
    const { error } = promptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { orderId, expertPrompt, expertInstructions, n8nWebhookUrl } = req.body;

    // Find order
    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ error: 'Cette commande a déjà été traitée' });
    }

    // Update order with expert data
    order.status = 'ai_processing';
    order.expertPrompt = expertPrompt;
    order.expertInstructions = expertInstructions;
    order.expertReview = {
      expertId: req.expert._id.toString(),
      status: 'approved',
      reviewedAt: new Date(),
      notes: 'Envoyé à l\'assistant IA pour génération'
    };

    await order.save();

    // Prepare payload for n8n
    const n8nPayload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      level: order.level,
      levelName: order.levelName,
      client: {
        firstName: order.formData.firstName,
        lastName: order.formData.lastName,
        email: order.formData.email,
        phone: order.formData.phone,
        dateOfBirth: order.formData.dateOfBirth
      },
      formData: order.formData,
      files: order.files || [],
      expertPrompt,
      expertInstructions: expertInstructions || '',
      expert: {
        id: req.expert._id,
        name: req.expert.name,
        email: req.expert.email
      },
      timestamp: new Date().toISOString()
    };

    // Send to n8n webhook
    const webhookUrl = n8nWebhookUrl || process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/oracle-lumira-process';
    
    try {
      const n8nResponse = await axios.post(webhookUrl, n8nPayload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Oracle-Lumira-Expert-Desk/1.0'
        }
      });

      console.log('n8n webhook response:', n8nResponse.status);

      res.json({
        success: true,
        message: 'Commande envoyée avec succès à l\'assistant IA',
        orderId: order._id,
        orderNumber: order.orderNumber,
        n8nStatus: n8nResponse.status
      });

    } catch (webhookError: any) {
      console.error('n8n webhook error:', webhookError.message);
      
      // Revert order status if webhook fails
      order.status = 'pending';
      await order.save();

      res.status(500).json({
        error: 'Échec de l\'envoi vers l\'assistant IA',
        details: webhookError.message
      });
    }

  } catch (error) {
    console.error('Process order error:', error);
    res.status(500).json({ error: 'Erreur lors du traitement de la commande' });
  }
});

// Get expert stats
router.get('/stats', authenticateExpert, async (req: any, res: any) => {
  try {
    const stats = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'paid' }),
      Order.countDocuments({ status: 'ai_processing' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({
        'expertReview.expertId': req.expert._id.toString(),
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Order.countDocuments({
        'expertReview.expertId': req.expert._id.toString()
      })
    ]);

    res.json({
      pending: stats[0],
      paid: stats[1],
      processing: stats[2],
      completed: stats[3],
      treatedToday: stats[4],
      totalTreated: stats[5]
    });

  } catch (error) {
    console.error('Get expert stats error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des statistiques' });
  }
});

export { router as expertRoutes };
