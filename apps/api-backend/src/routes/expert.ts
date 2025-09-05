import express from 'express';
import jwt from 'jsonwebtoken';
import { Expert } from '../models/Expert';
import { Order } from '../models/Order';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import axios from 'axios';
import bcrypt from 'bcryptjs';

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

// ROUTE DE DEBUG TEMPORAIRE - À SUPPRIMER APRÈS RÉSOLUTION
router.post('/debug-login', async (req: any, res: any) => {
  try {
    console.log('🔍 DEBUG LOGIN - Début diagnostic');
    console.log('Body reçu:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ 
        error: 'Email et mot de passe requis',
        debug: { email: !!email, password: !!password }
      });
    }
    
    // Recherche de l'expert
    console.log('🔍 Recherche expert avec email:', email);
    const expert = await Expert.findOne({ email: email.toLowerCase() });
    
    if (!expert) {
      console.log('❌ Expert non trouvé');
      console.log('🔍 Experts disponibles:');
      const allExperts = await Expert.find({}, 'email name isActive');
      console.log(allExperts);
      return res.status(401).json({ 
        error: 'Expert non trouvé',
        debug: { 
          emailSearched: email.toLowerCase(),
          availableExperts: allExperts.map(e => ({ email: e.email, isActive: e.isActive }))
        }
      });
    }
    
    console.log('✅ Expert trouvé:', {
      id: expert._id,
      email: expert.email,
      name: expert.name,
      role: expert.role,
      isActive: expert.isActive,
      createdAt: expert.createdAt
    });
    
    // Test du mot de passe avec bcrypt direct
    console.log('🔐 Test mot de passe...');
    console.log('Mot de passe fourni:', password);
    console.log('Hash stocké (premiers 20 chars):', expert.password.substring(0, 20) + '...');
    
    const isValidMethod = await expert.comparePassword(password);
    const isValidDirect = await bcrypt.compare(password, expert.password);
    
    console.log('Résultat méthode comparePassword:', isValidMethod);
    console.log('Résultat bcrypt.compare direct:', isValidDirect);
    
    if (!isValidMethod && !isValidDirect) {
      console.log('❌ Mot de passe incorrect');
      
      // Test avec différentes variantes
      const variants = [
        password,
        password.trim(),
        'Lumira2025L',
        'lumira2025l'
      ];
      
      console.log('🔍 Test de variantes:');
      for (const variant of variants) {
        const testResult = await bcrypt.compare(variant, expert.password);
        console.log(`"${variant}":`, testResult);
      }
      
      return res.status(401).json({
        error: 'Mot de passe incorrect',
        debug: {
          methodResult: isValidMethod,
          directResult: isValidDirect,
          expertFound: true,
          isActive: expert.isActive,
          testedVariants: variants.length
        }
      });
    }
    
    if (!expert.isActive) {
      console.log('❌ Compte expert désactivé');
      return res.status(401).json({
        error: 'Compte désactivé',
        debug: { isActive: expert.isActive }
      });
    }
    
    console.log('✅ Authentification réussie!');
    
    // Génération du token comme dans la vraie route
    const token = jwt.sign(
      { 
        expertId: expert._id, 
        email: expert.email,
        name: expert.name 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );
    
    return res.json({
      success: true,
      token,
      expert: {
        id: expert._id,
        email: expert.email,
        name: expert.name,
        role: expert.role
      },
      debug: {
        methodResult: isValidMethod,
        directResult: isValidDirect,
        isActive: expert.isActive,
        message: 'Authentification complètement réussie!',
        tokenGenerated: true
      }
    });
    
  } catch (error: any) {
    console.error('❌ Erreur dans debug-login:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      debug: {
        message: error?.message || 'Unknown error',
        stack: error?.stack
      }
    });
  }
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
    .limit(limit);

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

// Add callback route for n8n
router.post('/n8n-callback', async (req: any, res: any) => {
  try {
    const { orderId, success, generatedContent, files, error } = req.body;
    
    console.log('📨 Callback n8n reçu:', { orderId, success });
    
    const updateData: any = {
      status: success ? 'ready' : 'failed',
      updatedAt: new Date()
    };
    
    if (success && generatedContent) {
      updateData.generatedContent = {
        rawText: generatedContent.text || generatedContent,
        files: files || [],
        levelContent: generatedContent.levelData || {}
      };
      updateData.deliveredAt = new Date();
    } else if (error) {
      updateData.error = error;
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    
    if (updatedOrder) {
      console.log(`✅ Order ${orderId} mis à jour → ${updateData.status}`);
      res.json({ success: true, orderId, status: updateData.status });
    } else {
      console.error('❌ Order introuvable:', orderId);
      res.status(404).json({ error: 'Commande introuvable' });
    }
    
  } catch (error) {
    console.error('❌ Erreur callback n8n:', error);
    res.status(500).json({ error: 'Erreur traitement callback' });
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

    const { orderId, expertPrompt, expertInstructions } = req.body;

    // Find order
    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ error: 'Cette commande a déjà été traitée' });
    }

    // Update order with expert data
    order.status = 'processing';
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

    // Send to n8n webhook - WEBHOOK FIXE
    const webhookUrl = 'https://n8automate.ialexia.fr/webhook/10e13491-51ac-46f6-a734-89c1068cc7ec';
    
    try {
      console.log('🚀 Envoi vers n8n:', webhookUrl);
      const n8nResponse = await axios.post(webhookUrl, n8nPayload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Oracle-Lumira-Expert-Desk/1.0'
        }
      });

      console.log('✅ n8n webhook response:', n8nResponse.status);

      res.json({
        success: true,
        message: 'Commande envoyée avec succès à l\'assistant IA',
        orderId: order._id,
        orderNumber: order.orderNumber,
        n8nStatus: n8nResponse.status
      });

    } catch (webhookError: any) {
      console.error('❌ n8n webhook error:', webhookError.message);
      
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
      Order.countDocuments({ status: 'processing' }),
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
