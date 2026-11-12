import express from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { ProductOrder } from '../models/ProductOrder'; // PASSAGE 8 - P0
import { authenticateToken, requireRole } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { getS3Service } from '../services/s3';
import { aggregateCapabilities } from '../config/entitlements';
import { getLevelNameSafely } from '../utils/orderUtils';
import { authenticateSanctuaire } from '../middleware/sanctuaireAuth';
import { computeEntitlements } from '../services/sanctuaireEntitlements';

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
//
// Authentication: POST /auth/sanctuaire and POST /auth/sanctuaire-v2 used to mint a
// 24h session for anyone who typed an email address (see docs/audits/SECURITY_HARDENING.md).
// They are intentionally removed: sessions are now only issued by the magic-link
// endpoints in routes/sanctuaireAuth.ts, after the mailbox has been verified.

// =================== ENDPOINT PROFILE - GESTION PROFIL UTILISATEUR ===================
// GET /api/users/me - Récupère les informations principales de l'utilisateur (firstName, lastName, phone, email)
router.get('/me', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user._id).select('email firstName lastName phone');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone
    });
  } catch (error) {
    console.error('[USER-ME] Erreur GET:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations utilisateur' });
  }
});

// PATCH /api/users/me - Met à jour les informations principales de l'utilisateur (firstName, lastName, phone, email)
router.patch('/me', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const updates = req.body;
    
    // Validation des champs autorisés pour User principal
    const allowedFields = ['firstName', 'lastName', 'phone', 'email'];
    
    const userUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        userUpdates[key] = updates[key];
      }
    });
    
    // Validation email format si fourni
    if (userUpdates.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(userUpdates.email)) {
        return res.status(400).json({ error: 'Format email invalide' });
      }
      userUpdates.email = userUpdates.email.toLowerCase();
    }
    
    // Validation téléphone si fourni
    if (userUpdates.phone) {
      const phoneRegex = /^(?:\+?[1-9]\d{6,14}|0\d{8,10})$/;
      if (!phoneRegex.test(userUpdates.phone)) {
        return res.status(400).json({ error: 'Format téléphone invalide' });
      }
    }
    
    console.log('[USER-ME] PATCH avec updates:', userUpdates);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { ...userUpdates, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).select('email firstName lastName phone');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.log('[USER-ME] Utilisateur mis à jour pour userId:', req.user._id);
    
    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone
    });
  } catch (error: any) {
    console.error('[USER-ME] Erreur PATCH:', error);
    
    // Gérer l'erreur de duplication email
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé par un autre compte' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la mise à jour des informations utilisateur' });
  }
});

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
    
    // PASSAGE 10 - P0 : Utiliser $set avec des clés spécifiques au lieu d'écraser tout le profil
    const setFields: any = { updatedAt: new Date() };
    
    // Appliquer chaque champ individuellement avec la notation pointillée
    Object.keys(profileUpdates).forEach(key => {
      setFields[`profile.${key}`] = profileUpdates[key];
    });
    
    console.log('[PROFILE] PATCH avec $set:', setFields);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: setFields },
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
    const entitlements = await computeEntitlements(req.user._id, req.user.email);

    console.log('[ENTITLEMENTS] Requête pour userId:', req.user._id, '| produits:', entitlements.products.length);

    return res.json({
      capabilities: aggregateCapabilities(entitlements.products),
      products: entitlements.products,
      highestLevel: entitlements.highestLevel,
      levelMetadata: entitlements.levelMetadata,
      orderCount: entitlements.orderCount,
      productOrderCount: entitlements.orderCount,
      message: entitlements.products.length === 0 ? 'Aucune commande complétée trouvée' : undefined,
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
    const userEmail = req.user.email?.toLowerCase() || '';
    
    // PASSAGE 13 - P0 CRITIQUE : Chercher dans Order ET ProductOrder
    // Les ProductOrder n'ont PAS de expertValidation car ce sont des produits directs
    const orders = await Order.find({ 
      userId: userId,
      status: 'completed',
      // Seulement les commandes avec contenu validé par l'expert
      'expertValidation.validationStatus': 'approved'
    })
    .populate('userId', 'firstName lastName email')
    .sort({ deliveredAt: -1, updatedAt: -1 })
    .limit(20);

    console.log('[ORDERS/COMPLETED] Orders trouvées:', orders.length);

    // PASSAGE 13 - P0 : Chercher aussi dans ProductOrder (completées = paid/processing/completed)
    const productOrders = await ProductOrder.find({
      customerEmail: userEmail,
      status: { $in: ['paid', 'processing', 'completed'] }
    })
    .sort({ createdAt: -1 })
    .limit(20);

    console.log('[ORDERS/COMPLETED] ProductOrders trouvées:', productOrders.length);

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
    
    // PASSAGE 13 - P0 : Formater aussi les ProductOrders en format compatible
    const formattedProductOrders = productOrders.map(po => {
      const levelMap: Record<string, number> = { 'initie': 1, 'mystique': 2, 'profond': 3, 'integrale': 4 };
      let level = 1;
      if (typeof po.metadata?.level === 'number') level = po.metadata.level;
      else if (typeof po.metadata?.level === 'string') level = levelMap[po.metadata.level.toLowerCase()] || 1;
      else if (po.productId) level = levelMap[po.productId.toLowerCase()] || 1;
      
      return {
        id: po._id,
        orderNumber: po.paymentIntentId,
        level: level,
        levelName: getLevelNameSafely(level),
        amount: po.amount || 0,
        status: po.status,
        createdAt: po.createdAt,
        deliveredAt: po.createdAt, // ProductOrder n'a pas deliveredAt, utiliser createdAt
        // ProductOrder n'a pas de contenu généré, donc null
        generatedContent: null,
        expertValidation: null,
        formData: {
          firstName: po.metadata?.customerName?.split(' ')[0] || '',
          lastName: po.metadata?.customerName?.split(' ').slice(1).join(' ') || '',
          specificQuestion: null
        },
        isProductOrder: true // Flag pour identifier les ProductOrders
      };
    });
    
    // Combiner et trier par date
    const allOrders = [...formattedOrders, ...formattedProductOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({
      orders: allOrders,
      total: allOrders.length,
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone || undefined,
        level: allOrders.length
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
    const lecturesBucket = process.env.AWS_LECTURES_BUCKET_NAME || 'oracle-lumira-lectures';
    const extractKeyFromUrl = (u: string): string => {
      try {
        const decoded = decodeURIComponent(u);
        
        // Cas 1: oracle-lumira-lectures bucket (PDFs générés)
        if (decoded.includes('oracle-lumira-lectures')) {
          const lectureMatch = decoded.match(/oracle-lumira-lectures\.s3\.[^\/]+\.amazonaws\.com\/(.+)/) ||
                               decoded.match(/oracle-lumira-lectures\/(.+)/);
          if (lectureMatch) return lectureMatch[1];
        }
        
        // Cas 2: oracle-lumira-uploads-tachfine-1983 bucket (uploads utilisateurs)
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
        
        // Cas 3: pattern générique /uploads/
        const upIdx = decoded.indexOf('/uploads/');
        if (upIdx !== -1) return decoded.substring(upIdx + 1);
        
        // Cas 4: pattern générique /lectures/ ou fichiers dans le bucket lectures
        const lectIdx = decoded.indexOf('/lectures/');
        if (lectIdx !== -1) return decoded.substring(lectIdx + 1);
        
        // Si le fichier est dans le bucket lectures sans préfixe
        if (decoded.includes('.pdf') && !decoded.includes('uploads/')) {
          // Extraire le nom de fichier direct depuis l'URL
          const parts = decoded.split('/');
          return parts[parts.length - 1];
        }
        
        return decoded;
      } catch {
        return u;
      }
    };

    const objectKey = key || extractKeyFromUrl(url!);
    
    // Détecter le type de bucket automatiquement
    const s3 = getS3Service();
    const bucketType = s3.detectBucketTypeFromUrl(url || objectKey);
    
    console.log('[Users] Presign request:', { 
      originalUrl: url, 
      extractedKey: objectKey, 
      bucketType 
    });
    
    // Validation de sécurité : autorise uploads/ et lectures/ (ou fichiers PDF directs dans lectures bucket)
    const isValidKey = objectKey.startsWith('uploads/') || 
                       objectKey.startsWith('lectures/') || 
                       (bucketType === 'lectures' && objectKey.endsWith('.pdf'));
    
    if (!isValidKey) {
      console.error('[Users] Presign rejected - invalid key:', objectKey);
      return res.status(400).json({ error: 'Invalid object key - must start with uploads/ or lectures/' });
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

      const collectedKeys = new Set<string>();
      const addKey = (u?: string) => {
        if (!u) return;
        const k = extractKeyFromUrl(u);
        // Accepter les clés uploads/ ET lectures/ (ou PDFs directs)
        if (k && (k.startsWith('uploads/') || k.startsWith('lectures/') || k.endsWith('.pdf'))) {
          collectedKeys.add(k);
        }
      };
      for (const o of orders) {
        addKey(o.generatedContent?.pdfUrl as any);
        addKey(o.generatedContent?.audioUrl as any);
        addKey(o.generatedContent?.mandalaSvg as any);
      }

      if (!collectedKeys.has(objectKey)) {
        console.error('[Users] Access denied:', { userId, objectKey, allowedKeys: Array.from(collectedKeys) });
        return res.status(403).json({ error: 'Access denied for requested object' });
      }
    }

    const exp = Math.min(Math.max(parseInt(String(expiresIn || '900'), 10) || 900, 60), 3600);
    const signedUrl = await s3.getPresignedGetUrl(objectKey, exp, bucketType);
    
    console.log('[Users] Presigned URL generated:', { 
      key: objectKey, 
      bucketType, 
      expiresIn: exp 
    });
    
    res.json({ signedUrl, expiresIn: exp });
  } catch (error) {
    console.error('Sanctuaire presign error:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// =================== ENDPOINT SANCTUAIRE: GET ORDER CONTENT P0 ===================
// Récupération du contenu d'une commande pour le Sanctuaire
router.get('/orders/:id/content', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log('[Users] GET /orders/:id/content - Ordre ID:', id, '| User ID:', userId);

    // Vérifier que la commande appartient à l'utilisateur
    const order = await Order.findOne({
      _id: id,
      userId: userId,
      status: { $in: ['completed', 'paid'] }
    });

    if (!order) {
      console.error('[Users] Commande non trouvée ou non accessible:', { id, userId });
      return res.status(404).json({ error: 'Commande non trouvée ou non accessible' });
    }

    // Retourner le contenu généré
    res.json({
      orderId: order._id,
      generatedContent: order.generatedContent || {},
      status: order.status,
      createdAt: order.createdAt,
      metadata: (order as any).metadata
    });

  } catch (error) {
    console.error('[Users] Erreur récupération contenu commande:', error);
    res.status(500).json({ error: 'Erreur récupération du contenu' });
  }
});

// EXPORT CRITIQUE : Sans cet export, le routeur n'est jamais monté dans server.ts
export { router as userRoutes };
