import express from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { ProductOrder } from '../models/ProductOrder';
import { authenticateToken, requireRole } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { getS3Service } from '../services/s3';
import { aggregateCapabilities, getHighestLevel, getLevelMetadata } from '../config/entitlements';

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

// =================== ENDPOINT ENTITLEMENTS - SOURCE DE VÉRITÉ ===================
// GET /api/users/entitlements - Récupère les capacités débloquées de l'utilisateur
router.get('/entitlements', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    
    console.log('[ENTITLEMENTS] Requête pour userId:', userId, 'email:', userEmail);
    
    // Récupérer toutes les commandes complétées de l'utilisateur
    const completedOrders = await Order.find({
      userId: userId,
      status: 'completed'
    }).select('level orderNumber paymentIntentId');
    
    // Récupérer aussi les ProductOrder complétées (nouveau système)
    const completedProductOrders = await ProductOrder.find({
      customerEmail: userEmail.toLowerCase(),
      status: 'completed'
    }).select('productId paymentIntentId');
    
    console.log('[ENTITLEMENTS] Orders trouvées:', completedOrders.length);
    console.log('[ENTITLEMENTS] ProductOrders trouvées:', completedProductOrders.length);
    
    // Mapper les niveaux des Order vers productId
    const levelToProductId: Record<number, string> = {
      1: 'initie',
      2: 'mystique',
      3: 'profond',
      4: 'integrale'
    };
    
    const orderProductIds = completedOrders
      .map(order => levelToProductId[order.level])
      .filter(Boolean);
    
    const productOrderIds = completedProductOrders
      .map(po => po.productId.toLowerCase());
    
    // Fusionner les deux listes et dédupliquer
    const allProductIds = [...new Set([...orderProductIds, ...productOrderIds])];
    
    console.log('[ENTITLEMENTS] Produits détectés:', allProductIds);
    
    // Si aucun produit, retourner un tableau vide
    if (allProductIds.length === 0) {
      return res.json({
        capabilities: [],
        products: [],
        highestLevel: null,
        levelMetadata: null,
        message: 'Aucune commande complétée trouvée'
      });
    }
    
    // Agréger toutes les capacités
    const capabilities = aggregateCapabilities(allProductIds);
    
    // Déterminer le niveau le plus élevé
    const highestLevel = getHighestLevel(allProductIds);
    const levelMetadata = highestLevel ? getLevelMetadata(highestLevel) : null;
    
    console.log('[ENTITLEMENTS] Capacités débloquées:', capabilities.length);
    console.log('[ENTITLEMENTS] Niveau le plus élevé:', highestLevel);
    
    res.json({
      capabilities,
      products: allProductIds,
      highestLevel,
      levelMetadata,
      orderCount: completedOrders.length,
      productOrderCount: completedProductOrders.length
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
      levelName: order.levelName,
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
        firstName: req.user.firstName,
        lastName: req.user.lastName,
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

