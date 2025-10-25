import express from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { authenticateToken, requireRole } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { getS3Service } from '../services/s3';
import { aggregateCapabilities, getHighestLevel, getLevelMetadata } from '../config/entitlements';
import { getLevelNameSafely } from '../utils/orderUtils';

// Helper local pour résoudre le niveau depuis les métadonnées
const resolveLevelFromOrder = (order: any): number => {
  // 1. Priorité : champ level direct
  if (typeof order.level === 'number' && order.level >= 1 && order.level <= 4) {
    return order.level;
  }
  
  // 2. Fallback : metadata.level ou productId
  const levelKey = order.metadata?.level || order.productId || '';
  const mapping: Record<string, number> = {
    'initie': 1,
    'mystique': 2,
    'profond': 3,
    'integrale': 4
  };
  
  const normalized = String(levelKey).toLowerCase();
  return mapping[normalized] || 1; // Défaut: niveau 1
};

// Helper pour obtenir les produits accordés par niveau
const getGrantedProductsByLevel = (level: number): string[] => {
  const products: Record<number, string[]> = {
    1: ['initie'],
    2: ['initie', 'mystique'],
    3: ['initie', 'mystique', 'profond'],
    4: ['initie', 'mystique', 'profond', 'integrale']
  };
  return products[level] || products[1];
};

const router = express.Router();

// Get all users (with pagination)
router.get('/', authenticateToken, requireRole(['admin']), async (req: any, res: any) => {
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

// SANCTUAIRE CLIENT ENDPOINTS

// Authentification sanctuaire par email (génère un token temporaire)
router.post('/auth/sanctuaire', async (req: any, res: any) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    // Rechercher l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Vérifier qu'il a au moins une commande complétée
    const completedOrders = await Order.find({ 
      userId: user._id, 
      status: 'completed' 
    }).countDocuments();
    
    if (completedOrders === 0) {
      return res.status(403).json({ 
        error: 'Aucune commande complétée trouvée',
        message: 'Vous devez avoir au moins une lecture complétée pour accéder au sanctuaire'
      });
    }
    
    // Générer token temporaire (24h)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error: JWT secret missing' });
    }
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        type: 'sanctuaire_access'
      },
      secret,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        level: completedOrders // Niveau basé sur nombre de commandes
      }
    });
    
  } catch (error) {
    console.error('Sanctuaire auth error:', error);
    res.status(500).json({ error: 'Erreur authentification sanctuaire' });
  }
});

// Auth Sanctuaire v2: unified Order-based access
router.post('/auth/sanctuaire-v2', async (req: any, res: any) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const lowerEmail = String(email).toLowerCase();
    let user = await User.findOne({ email: lowerEmail });

    if (!user) {
      const latestOrder = await Order.findOne({
        $or: [
          { userEmail: lowerEmail },
          { 'checkout.customer.email': lowerEmail },
          { 'formData.email': lowerEmail },
        ],
        status: { $in: ['paid', 'completed'] },
      })
        .sort({ createdAt: -1 })
        .lean();

      if (!latestOrder) {
        return res.status(404).json({ error: 'Utilisateur non trouve' });
      }

      const formData = (latestOrder as any).formData || {};
      const firstName =
        formData.firstName ||
        lowerEmail.split('@')[0] ||
        'Client';
      const lastName = formData.lastName || 'Lumira';
      const phone = formData.phone;

      user = await User.create({ email: lowerEmail, firstName, lastName, phone });
    }

    // CORRECTION CRITIQUE : Assouplir la vérification pour accepter les commandes en transition
    // Les webhooks Stripe peuvent prendre quelques secondes pour mettre à jour le statut final
    // On autorise donc : 'paid' (paiement reçu), 'processing' (en traitement), et 'completed'
    const accessibleOrders = await Order.find({
      $or: [
        { userId: user._id },
        { userEmail: lowerEmail },
        { 'checkout.customer.email': lowerEmail },
        { 'formData.email': lowerEmail },
      ],
      status: { $in: ['paid', 'processing', 'completed'] },
    });

    if (accessibleOrders.length === 0) {
      return res.status(403).json({
        error: 'Aucune commande trouvee',
        message: 'Vous devez avoir au moins une commande validée pour accéder au sanctuaire. Si vous venez de payer, veuillez patienter quelques instants.',
      });
    }

    let highestLevel = 0;
    const grantedProducts = new Set<string>();

    for (const order of accessibleOrders) {
      const level = resolveLevelFromOrder(order);
      highestLevel = Math.max(highestLevel, level);

      const products = getGrantedProductsByLevel(level);
      products.forEach((productId: string) => grantedProducts.add(productId));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error: JWT secret missing' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, type: 'sanctuaire_access' },
      secret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        level: highestLevel,
      },
      products: Array.from(grantedProducts),
    });
  } catch (error) {
    console.error('Sanctuaire auth v2 error:', error);
    res.status(500).json({ error: 'Erreur authentification sanctuaire' });
  }
});

// Middleware pour authentifier les utilisateurs sanctuaire
const authenticateSanctuaire = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error: JWT secret missing' });
    }
    const decoded = jwt.verify(token, secret) as any;
    
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

// =================== ENDPOINT PROFILE - GESTION PROFIL UTILISATEUR ===================
// GET /api/users/profile - Récupère le profil complet de l'utilisateur connecté
router.get('/profile', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user._id).select('email firstName lastName phone profile');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profile: user.profile || {
        profileCompleted: false
      }
    });
  } catch (error) {
    console.error('[PROFILE] Erreur GET:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// PATCH /api/users/profile - Met à jour le profil utilisateur
router.patch('/profile', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const updates = req.body;
    
    // Validation des champs autorisés
    const allowedFields = [
      'birthDate', 'birthTime', 'birthPlace',
      'specificQuestion', 'objective',
      'facePhotoUrl', 'palmPhotoUrl',
      'profileCompleted', 'submittedAt'
    ];
    
    const profileUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        profileUpdates[key] = updates[key];
      }
    });
    
    // Si profileCompleted passe à true, ajouter submittedAt automatiquement
    if (profileUpdates.profileCompleted === true && !profileUpdates.submittedAt) {
      profileUpdates.submittedAt = new Date();
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          profile: profileUpdates
        },
        updatedAt: new Date()
      },
      { new: true, runValidators: false }
    ).select('email firstName lastName phone profile');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('[PROFILE] Profil mis à jour pour userId:', req.user._id);
    
    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profile: user.profile
    });
  } catch (error) {
    console.error('[PROFILE] Erreur PATCH:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// =================== ENDPOINT ENTITLEMENTS - SOURCE DE VÉRITÉ ===================
// GET /api/users/entitlements - Récupère les capacités débloquées de l'utilisateur
router.get('/entitlements', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    
    console.log('[ENTITLEMENTS] Requête pour userId:', userId, 'email:', userEmail);

    const normalizedEmail = String(userEmail || '').toLowerCase();
    const scopedOrders = await Order.find({
      $or: [
        { userId },
        { userEmail: normalizedEmail },
        { 'checkout.customer.email': normalizedEmail },
        { 'formData.email': normalizedEmail },
      ],
      status: { $in: ['paid', 'completed'] },
    });

    console.log('[ENTITLEMENTS] Orders trouvées:', scopedOrders.length);

    if (scopedOrders.length === 0) {
      return res.json({
        capabilities: [],
        products: [],
        highestLevel: null,
        levelMetadata: null,
        message: 'Aucune commande complétée trouvée'
      });
    }
    
    const productIds = new Set<string>();
    const levels: number[] = [];

    for (const order of scopedOrders) {
      const level = resolveLevelFromOrder(order);
      levels.push(level);

      const products = getGrantedProductsByLevel(level);
      products.forEach((productId: string) => productIds.add(productId));
    }

    const productsArray = Array.from(productIds);

    const capabilities = aggregateCapabilities(productsArray);
    const highestLevel = productsArray.length > 0 ? getHighestLevel(productsArray) : null;
    const levelMetadata = highestLevel ? getLevelMetadata(highestLevel) : null;
    
    console.log('[ENTITLEMENTS] Capacités débloquées:', capabilities.length);
    console.log('[ENTITLEMENTS] Niveau le plus élevé:', highestLevel);
    
    res.json({
      capabilities,
      products: productsArray,
      highestLevel,
      levelMetadata,
      orderCount: scopedOrders.length,
    });
    
  } catch (error) {
    console.error('[ENTITLEMENTS] Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entitlements' });
  }
});

// Récupérer les commandes complétées de l'utilisateur (SANCTUAIRE)
router.get('/orders/completed', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ 
      userId: userId,
      status: 'completed',
      // Seulement les commandes avec contenu validé par l'expert
      'expertValidation.validationStatus': 'approved'
    })
    .populate('userId', 'firstName lastName email')
    .sort({ deliveredAt: -1, updatedAt: -1 })
    .limit(20);

    // Formater les données pour le sanctuaire
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
        level: order.level,
        levelName: getLevelNameSafely(order.level),
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      generatedContent: order.generatedContent,
      expertValidation: order.expertValidation,
      formData: {
        firstName: order.formData?.firstName,
        lastName: order.formData?.lastName,
        specificQuestion: order.formData?.specificQuestion
      }
    }));
    
    res.json({
      orders: formattedOrders,
      total: formattedOrders.length,
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone || undefined,
        level: formattedOrders.length
      }
    });
    
  } catch (error) {
    console.error('Get user completed orders error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

// Récupérer les statistiques sanctuaire de l'utilisateur
router.get('/sanctuaire/stats', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ userId: userId });
    const completedOrders = orders.filter(o => o.status === 'completed');
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid');
    
    const stats = {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.amount, 0),
      currentLevel: completedOrders.length,
      maxLevel: Math.max(...completedOrders.map(o => o.level), 0),
      levelProgress: Math.round((completedOrders.length / 4) * 100),
      lastOrderDate: orders.length > 0 ? orders[orders.length - 1].createdAt : null,
      availableContent: {
        readings: completedOrders.filter(o => o.generatedContent?.reading).length,
        audios: completedOrders.filter(o => o.generatedContent?.audioUrl).length,
        pdfs: completedOrders.filter(o => o.generatedContent?.pdfUrl).length,
        mandalas: completedOrders.filter(o => o.generatedContent?.mandalaSvg).length
      }
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Get sanctuaire stats error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Get user by ID
router.get('/:id([0-9a-fA-F]{24})', authenticateToken, requireRole(['admin']), async (req: any, res: any) => {
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
router.patch('/:id([0-9a-fA-F]{24})', authenticateToken, requireRole(['admin']), async (req: any, res: any) => {
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
router.get('/:id([0-9a-fA-F]{24})/stats', authenticateToken, requireRole(['admin']), async (req: any, res: any) => {
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

// ===== Sanctuaire file presign endpoint (private S3 access) =====
// GET /api/users/files/presign?url=... or ?key=uploads/..
router.get('/files/presign', async (req: any, res: any) => {
  try {
    // Require valid JWT (sanctuaire client or expert)
    const auth = req.header('Authorization') || '';
    if (!auth) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    const token = auth.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error: JWT secret missing' });
    }
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret) as any;
    } catch {
      return res.status(401).json({ error: 'Token invalide' });
    }

    const { url, key, expiresIn } = req.query as { url?: string; key?: string; expiresIn?: string };
    if (!url && !key) {
      return res.status(400).json({ error: 'url or key is required' });
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME || '';
    const extractKeyFromUrl = (u: string): string => {
      try {
        const decoded = decodeURIComponent(u);
        const idxBucketSlash = decoded.indexOf(`/${bucket}/`);
        if (bucket && idxBucketSlash !== -1) {
          return decoded.substring(idxBucketSlash + bucket.length + 2);
        }
        const hostSplit = decoded.split('.amazonaws.com/');
        if (hostSplit.length === 2) {
          return hostSplit[1];
        }
        if (bucket) {
          const idx = decoded.indexOf(`${bucket}/`);
          if (idx !== -1) return decoded.substring(idx + bucket.length + 1);
        }
        const upIdx = decoded.indexOf('/uploads/');
        if (upIdx !== -1) return decoded.substring(upIdx + 1);
        return decoded;
      } catch {
        return u;
      }
    };

    const objectKey = key || extractKeyFromUrl(url!);
    if (!objectKey || !objectKey.startsWith('uploads/')) {
      return res.status(400).json({ error: 'Invalid object key' });
    }

    // Authorization: experts can presign any uploads/*; sanctuaire clients only for their delivered/approved content
    const isExpert = !!decoded?.expertId;
    const isSanctuaire = decoded?.type === 'sanctuaire_access' && !!decoded?.userId;

    if (!isExpert && !isSanctuaire) {
      return res.status(401).json({ error: 'Unauthorized token' });
    }

    if (isSanctuaire) {
      // Load user orders and verify requested key matches one of the generatedContent assets
      const userId = decoded.userId;
      const orders = await Order.find({
        userId,
        status: 'completed',
        'expertValidation.validationStatus': 'approved'
      });

      const bucket = process.env.AWS_S3_BUCKET_NAME || '';
      const collectedKeys = new Set<string>();
      const addKey = (u?: string) => {
        if (!u) return;
        const k = extractKeyFromUrl(u);
        if (k && k.startsWith('uploads/')) collectedKeys.add(k);
      };
      for (const o of orders) {
        addKey(o.generatedContent?.pdfUrl as any);
        addKey(o.generatedContent?.audioUrl as any);
        addKey(o.generatedContent?.mandalaSvg as any);
      }

      if (!collectedKeys.has(objectKey)) {
        return res.status(403).json({ error: 'Access denied for requested object' });
      }
    }

    const exp = Math.min(Math.max(parseInt(String(expiresIn || '900'), 10) || 900, 60), 3600);
    const s3 = getS3Service();
    const signedUrl = await s3.getPresignedGetUrl(objectKey, exp);
    res.json({ signedUrl, expiresIn: exp });
  } catch (error) {
    console.error('Sanctuaire presign error:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});
