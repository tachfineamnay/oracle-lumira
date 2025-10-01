import express from 'express';
import jwt from 'jsonwebtoken';
import { Expert } from '../models/Expert';
import { Order } from '../models/Order';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import axios from 'axios';
import bcrypt from 'bcryptjs';

const router = express.Router();

// DEBUG: Check if expert exists in database
router.get('/check', async (req, res) => {
  if (!(process.env.ENABLE_DEBUG_ROUTES === 'true' && process.env.NODE_ENV !== 'production')) {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const expert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    if (expert) {
      console.log('🔍 Expert found:', {
        email: expert.email,
        hasPassword: !!expert.password,
        passwordLength: expert.password ? expert.password.length : 0,
        passwordPreview: expert.password ? expert.password.substring(0, 10) + '...' : 'none'
      });
      res.json({
        exists: true,
        email: expert.email,
        hasPassword: !!expert.password,
        passwordLength: expert.password ? expert.password.length : 0
      });
    } else {
      console.log('❌ Expert not found in database');
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('❌ Error checking expert:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DEBUG: Create expert if not exists
router.post('/create-debug', async (req, res) => {
  if (!(process.env.ENABLE_DEBUG_ROUTES === 'true' && process.env.NODE_ENV !== 'production')) {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    // Vérifier si expert existe déjà
    const existingExpert = await Expert.findOne({ email: 'expert@oraclelumira.com' });
    
    if (existingExpert) {
      console.log('🔍 Expert already exists, updating password');
      // set plain password; schema pre-save will hash it
      existingExpert.password = 'Lumira2025L';
      existingExpert.isActive = true;
      await existingExpert.save();
      res.json({ message: 'Expert password updated', exists: true });
    } else {
      console.log('🆕 Creating new expert');
      // use pre-save hashing for default password
      
      const expert = new Expert({
        email: 'expert@oraclelumira.com',
        password: 'Lumira2025L',
        name: 'Oracle Expert',
        expertise: ['tarot', 'oracle', 'spiritualité'],
        isActive: true
      });

      await expert.save();
      console.log('✅ Expert created successfully');
      res.json({ message: 'Expert created successfully', exists: true });
    }

  } catch (error) {
    console.error('❌ Error creating expert:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Database error', details: errorMessage });
  }
});

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

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required()
});

// REGISTER ENDPOINT
router.post('/register', async (req: any, res: any) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name } = req.body;
    
    // Check if expert already exists
    const existingExpert = await Expert.findOne({ email: email.toLowerCase() });
    if (existingExpert) {
      return res.status(409).json({ error: 'Un expert avec cet email existe déjà' });
    }

    // Create new expert
    const expert = new Expert({
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      name,
      role: 'expert',
      isActive: true
    });

    await expert.save();
    console.log('✅ New expert registered:', expert.email);

    // Generate JWT
    const token = jwt.sign(
      { 
        expertId: expert._id, 
        email: expert.email,
        name: expert.name,
        role: expert.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Expert créé avec succès',
      token,
      expert: {
        id: expert._id,
        email: expert.email,
        name: expert.name,
        role: expert.role,
        isActive: expert.isActive
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'enregistrement',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
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
    let expert = await Expert.findOne({ email: email.toLowerCase(), isActive: true });
    
    // AUTO-CREATE EXPERT IF NOT EXISTS (for expert@oraclelumira.com only)
    if (!expert && email.toLowerCase() === 'expert@oraclelumira.com' && process.env.ENABLE_AUTO_CREATE_EXPERT === 'true' && process.env.NODE_ENV !== 'production') {
      console.log('🆕 Auto-creating expert for first login');
      // default password will be hashed by schema pre-save
      
      expert = new Expert({
        email: 'expert@oraclelumira.com',
        password: process.env.DEFAULT_EXPERT_PASSWORD || 'Lumira2025L',
        name: 'Oracle Expert',
        expertise: ['tarot', 'oracle', 'spiritualité'],
        isActive: true
      });
      
      await expert.save();
      console.log('✅ Expert auto-created successfully');
    }
    
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

// ROUTE DE DEBUG CONDITIONNELLE - DÉSACTIVÉE EN PRODUCTION
if (process.env.ENABLE_DEBUG_ROUTES === 'true') {
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
}

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
    const { orderId, success, generatedContent, files, error, isRevision } = req.body;
    
    console.log('📨 Callback n8n reçu:', { orderId, success, isRevision });
    
    // Récupérer la commande pour vérifier le contexte
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('❌ Order introuvable:', orderId);
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (success && generatedContent) {
      // Stocker le contenu généré
      updateData.generatedContent = {
        archetype: generatedContent.archetype || '',
        reading: generatedContent.reading || generatedContent.text || generatedContent,
        audioUrl: generatedContent.audioUrl || files?.find((f: any) => f.type === 'audio')?.url || '',
        pdfUrl: generatedContent.pdfUrl || files?.find((f: any) => f.type === 'pdf')?.url || '',
        mandalaSvg: generatedContent.mandalaSvg || '',
        ritual: generatedContent.ritual || '',
        blockagesAnalysis: generatedContent.blockagesAnalysis || '',
        soulProfile: generatedContent.soulProfile || ''
      };

      // Logique conditionnelle pour la validation
      if (isRevision && order.expertValidation?.validationStatus === 'rejected') {
        // Si c'est une révision après rejet, remettre en attente de validation
        updateData.status = 'awaiting_validation';
        updateData.expertValidation = {
          ...order.expertValidation,
          validationStatus: 'pending',
          validationNotes: 'Contenu régénéré après rejet - En attente de validation',
          validatedAt: undefined
        };
        updateData.revisionCount = (order.revisionCount || 0) + 1;
        console.log(`✅ Order ${orderId} régénéré → awaiting_validation (révision #${updateData.revisionCount})`);
      } else {
        // Première génération → validation Expert
        updateData.status = 'awaiting_validation';
        updateData.expertValidation = {
          validationStatus: 'pending',
          validationNotes: 'Contenu généré par IA - En attente de validation Expert'
        };
        console.log(`✅ Order ${orderId} généré → awaiting_validation (première génération)`);
      }
      
    } else if (error) {
      // Erreur de génération
      updateData.status = 'failed';
      updateData.error = error;
      console.log(`❌ Order ${orderId} → failed (erreur génération)`);
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    
    if (updatedOrder) {
      res.json({ 
        success: true, 
        orderId, 
        status: updateData.status,
        needsValidation: updateData.status === 'awaiting_validation'
      });
    } else {
      console.error('❌ Échec mise à jour Order:', orderId);
      res.status(500).json({ error: 'Échec mise à jour commande' });
    }
    
  } catch (error) {
    console.error('❌ Erreur callback n8n:', error);
    res.status(500).json({ error: 'Erreur traitement callback' });
  }
});

// ROUTES SPÉCIFIQUES AVANT LES ROUTES GÉNÉRIQUES
// Get orders awaiting validation - DOIT ÊTRE AVANT /orders/:id
router.get('/orders/validation-queue', authenticateExpert, async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      status: 'awaiting_validation',
      'expertValidation.validationStatus': 'pending'
    })
    .populate('userId', 'firstName lastName email phone')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Order.countDocuments({
      status: 'awaiting_validation',
      'expertValidation.validationStatus': 'pending'
    });

    console.log(`📋 ${orders.length} commandes en attente de validation`);

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
    console.error('❌ Get validation queue error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de la queue de validation' });
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

    // Send to n8n webhook - configurable via env
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('N8N webhook URL not configured (N8N_WEBHOOK_URL)');
      // Revert order status if webhook cannot be used
      order.status = 'pending';
      await order.save();
      return res.status(503).json({ error: "Service non configur	 (N8N_WEBHOOK_URL manquant)" });
    }
    
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

    } catch (webhookError) {
      console.error('❌ n8n webhook error:', webhookError);
      const errorMessage = webhookError instanceof Error ? webhookError.message : 'Unknown webhook error';
      
      // Revert order status if webhook fails
      order.status = 'pending';
      await order.save();

      res.status(500).json({
        error: 'Échec de l\'envoi vers l\'assistant IA',
        details: errorMessage
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
      Order.countDocuments({ status: 'awaiting_validation' }),
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
      awaitingValidation: stats[3],
      completed: stats[4],
      treatedToday: stats[5],
      totalTreated: stats[6]
    });

  } catch (error) {
    console.error('Get expert stats error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des statistiques' });
  }
});

// Get pending orders for expert
router.get('/orders/pending', authenticateExpert, async (req: any, res: any) => {
  try {
    console.log('📋 Expert /orders/pending requested by:', req.expert.email);
    
    // Rechercher les commandes avec statuts paid ou pending, non assignées
    const query = {
      status: { $in: ['paid', 'pending'] },
      // Only orders that haven't been assigned to an expert yet, or assigned to this expert
      $or: [
        { 'expertReview.expertId': { $exists: false } },
        { 'expertReview.expertId': null },
        { 'expertReview.expertId': req.expert._id.toString() }
      ]
    };

    console.log('🔍 Query pour pending orders:', JSON.stringify(query, null, 2));

    const orders = await Order.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: 1 }) // Oldest first
      .limit(20); // Limit for performance

    console.log(`📋 Found ${orders.length} pending orders for expert ${req.expert.email}`);
    
    if (orders.length > 0) {
      console.log('🔍 First few orders details:');
      orders.slice(0, 3).forEach(order => {
        console.log(`  - Order ${order._id}: status=${order.status}, level=${order.level}, email=${order.userEmail}, created=${order.createdAt}`);
      });
    } else {
      // Debug: Vérifier s'il y a des orders en général
      const totalOrders = await Order.countDocuments({});
      const paidOrders = await Order.countDocuments({ status: 'paid' });
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      
      console.log('🔍 Debug - Total orders in DB:', {
        total: totalOrders,
        paid: paidOrders,
        pending: pendingOrders
      });
      
      // Afficher quelques exemples d'orders récents
      const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
      console.log('🔍 Recent orders in DB:');
      recentOrders.forEach(order => {
        console.log(`  - Order ${order._id}: status=${order.status}, level=${order.level || 'N/A'}, email=${order.userEmail}, created=${order.createdAt}`);
      });
    }
    
    res.json({ orders });
    
  } catch (error) {
    console.error('❌ Get pending orders error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Erreur lors du chargement des commandes',
      details: errorMessage 
    });
  }
});

// Get all orders assigned to this expert
router.get('/orders/assigned', authenticateExpert, async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      'expertReview.expertId': req.expert._id.toString()
    })
    .populate('userId', 'firstName lastName email phone')
    .sort({ 'expertReview.assignedAt': -1 }) // Most recent first
    .skip(skip)
    .limit(limit);

    const total = await Order.countDocuments({
      'expertReview.expertId': req.expert._id.toString()
    });

    res.json({ 
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Get assigned orders error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Erreur lors du chargement des commandes assignées',
      details: errorMessage 
    });
  }
});

// Assign order to expert (take order)
router.post('/orders/:orderId/assign', authenticateExpert, async (req: any, res: any) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Check if order is already assigned
    if (order.expertReview?.expertId) {
      return res.status(409).json({ error: 'Cette commande est déjà assignée à un expert' });
    }

    // Assign order to current expert
    order.expertReview = {
      ...order.expertReview,
      expertId: req.expert._id.toString(),
      expertName: req.expert.name,
      assignedAt: new Date(),
      status: 'pending'
    };
    
    // Update order status
    if (order.status === 'paid') {
      order.status = 'processing';
    }

    await order.save();

    console.log(`✅ Order ${orderId} assigned to expert ${req.expert.email}`);
    
    res.json({ 
      message: 'Commande assignée avec succès',
      order 
    });
    
  } catch (error) {
    console.error('❌ Assign order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Erreur lors de l\'assignation de la commande',
      details: errorMessage 
    });
  }
});

// Get expert profile
router.get('/profile', authenticateExpert, async (req: any, res: any) => {
  try {
    res.json({
      expert: {
        id: req.expert._id,
        email: req.expert.email,
        name: req.expert.name,
        role: req.expert.role,
        isActive: req.expert.isActive,
        joinedAt: req.expert.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du profil' });
  }
});

// NOUVELLES ROUTES DE VALIDATION EXPERT DESK

// Validate content (approve or reject)
router.post('/validate-content', authenticateExpert, async (req: any, res: any) => {
  try {
    const { orderId, action, validationNotes, rejectionReason } = req.body;

    // Validation des paramètres
    if (!orderId || !action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        error: 'Paramètres invalides',
        details: 'orderId et action (approve/reject) sont requis'
      });
    }

    // Récupérer la commande
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Vérifier que la commande est en attente de validation
    if (order.status !== 'awaiting_validation' || order.expertValidation?.validationStatus !== 'pending') {
      return res.status(400).json({ 
        error: 'Cette commande n\'est pas en attente de validation',
        currentStatus: order.status,
        validationStatus: order.expertValidation?.validationStatus
      });
    }

    const now = new Date();

    if (action === 'approve') {
      // VALIDATION APPROUVÉE → Livraison au sanctuaire client
      order.status = 'completed';
      order.expertValidation = {
        ...order.expertValidation,
        validatorId: req.expert._id.toString(),
        validatorName: req.expert.name,
        validationStatus: 'approved',
        validationNotes: validationNotes || 'Contenu validé et approuvé pour livraison',
        validatedAt: now
      };
      order.deliveredAt = now;
      
      console.log(`✅ Order ${orderId} APPROUVÉ → completed (livraison sanctuaire)`);
      
      await order.save();
      
      res.json({
        success: true,
        message: 'Contenu validé et livré au sanctuaire du client',
        orderId,
        status: 'completed',
        action: 'approved'
      });
      
    } else if (action === 'reject') {
      // VALIDATION REJETÉE → Retour vers n8n pour régénération
      order.status = 'processing'; // Retour en traitement
      order.expertValidation = {
        ...order.expertValidation,
        validatorId: req.expert._id.toString(),
        validatorName: req.expert.name,
        validationStatus: 'rejected',
        validationNotes: validationNotes || 'Contenu rejeté - Nécessite régénération',
        rejectionReason: rejectionReason || 'Qualité insuffisante',
        validatedAt: now
      };
      
      // Incrémenter le compteur de révisions
      order.revisionCount = (order.revisionCount || 0) + 1;
      
      console.log(`❌ Order ${orderId} REJETÉ → processing (révision #${order.revisionCount})`);
      
      await order.save();
      
      // Relancer le processus n8n avec le contexte de révision
      try {
        const revisionPayload = {
          orderId: order._id,
          orderNumber: order.orderNumber,
          isRevision: true,
          revisionCount: order.revisionCount,
          rejectionReason,
          validationNotes,
          originalPrompt: order.expertPrompt,
          originalInstructions: order.expertInstructions,
          level: order.level,
          levelName: order.levelName,
          client: {
            firstName: order.formData.firstName,
            lastName: order.formData.lastName,
            email: order.formData.email
          },
          expert: {
            id: req.expert._id,
            name: req.expert.name,
            email: req.expert.email
          },
          timestamp: new Date().toISOString()
        };
        
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        if (!webhookUrl) {
          console.error('N8N webhook URL not configured (N8N_WEBHOOK_URL)');
          return res.status(503).json({ error: "Service non configur	 (N8N_WEBHOOK_URL manquant)" });
        }
        const n8nResponse = await axios.post(webhookUrl, revisionPayload, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Oracle-Lumira-Expert-Validation/1.0'
          }
        });
        
        console.log(`🚀 Révision envoyée à n8n:`, n8nResponse.status);
        
        res.json({
          success: true,
          message: 'Contenu rejeté et envoyé pour régénération',
          orderId,
          status: 'processing',
          action: 'rejected',
          revisionCount: order.revisionCount,
          n8nStatus: n8nResponse.status
        });
        
      } catch (webhookError) {
        console.error('❌ Erreur webhook révision:', webhookError);
        res.status(500).json({
          error: 'Échec de l\'envoi pour régénération',
          details: webhookError instanceof Error ? webhookError.message : 'Unknown error'
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Validate content error:', error);
    res.status(500).json({ error: 'Erreur lors de la validation du contenu' });
  }
});

// Fonction utilitaire pour calculer les statistiques
async function calculateAverageRevisions(): Promise<number> {
  try {
    const pipeline = [
      { $match: { revisionCount: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avgRevisions: { $avg: '$revisionCount' } } }
    ];
    
    const result = await Order.aggregate(pipeline);
    return result.length > 0 ? Math.round(result[0].avgRevisions * 10) / 10 : 0;
  } catch (error) {
    console.error('Erreur calcul moyenne révisions:', error);
    return 0;
  }
}

export { router as expertRoutes };
