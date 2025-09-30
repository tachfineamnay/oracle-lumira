import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Order } from '../models/Order';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { StripeService } from '../services/stripe';

const router = express.Router();

// Configuration Multer pour upload de fichiers
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Permissive uploader (accept all images) to avoid failing on unknown mimetypes
const uploadPermissive = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Client submission: attach uploaded files + form data by paymentIntentId
router.post('/by-payment-intent/:paymentIntentId/client-submit', 
  uploadPermissive.fields([{ name: 'facePhoto', maxCount: 1 }, { name: 'palmPhoto', maxCount: 1 }]),
  async (req: any, res: any) => {
  try {
    // =================== MISSION FINISH LINE - INSTRUMENTATION CHIRURGICALE ===================
    console.log('[CLIENT-SUBMIT] START - Request received. Headers:', req.headers);
    console.log('[CLIENT-SUBMIT] ENV CHECK - ALLOW_DIRECT_CLIENT_SUBMIT:', process.env.ALLOW_DIRECT_CLIENT_SUBMIT);
    
    const { paymentIntentId } = req.params;
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      console.error('[CLIENT-SUBMIT] FATAL: paymentIntentId invalid:', paymentIntentId);
      return res.status(400).json({ error: 'paymentIntentId invalid' });
    }
    
    console.log('[CLIENT-SUBMIT] PaymentIntentId received:', paymentIntentId);

    console.log('[CLIENT-SUBMIT] FILES RECEIVED:', req.files);
    console.log('[CLIENT-SUBMIT] BODY:', req.body);
    console.log('[CLIENT-SUBMIT] FORM-DATA RAW:', req.body?.formData);
    
    let order = await Order.findOne({ paymentIntentId });
    console.log('[CLIENT-SUBMIT] Existing order found:', !!order);
    
    if (!order) {
      // Parse early (we may need formData for direct creation) - robust to strings/objects
      const __earlySafeParse = (v: any) => { try { if (!v) return {}; if (typeof v === 'string') return JSON.parse(v); if (typeof v === 'object') return v; return {}; } catch { return {}; } };
      let parsedFormData;
      try {
        parsedFormData = __earlySafeParse(req.body?.formData);
        console.log('[CLIENT-SUBMIT] FORM-DATA PARSED:', parsedFormData);
        console.log('[CLIENT-SUBMIT] EMAIL CHECK:', parsedFormData?.email);
        console.log('[CLIENT-SUBMIT] LEVEL CHECK:', parsedFormData?.level);
      } catch (e) {
        console.error('[CLIENT-SUBMIT] FATAL: JSON parsing failed:', e);
        return res.status(400).json({ error: 'Invalid formData JSON.' });
      }

      // 1) Try Stripe validation (standard path)
      let stripeError = null;
      let paymentIntent = null;
      try {
        console.log('[CLIENT-SUBMIT] Attempting Stripe validation for PaymentIntent:', paymentIntentId);
        const pi = await StripeService.getPaymentIntent(paymentIntentId);
        paymentIntent = pi;
        console.log('[CLIENT-SUBMIT] Stripe PaymentIntent retrieved:', { status: pi?.status, amount: pi?.amount });
        if (pi && pi.status === 'succeeded') {
          const emailCandidate = (pi.metadata as any)?.customerEmail || parsedFormData?.email;
          if (emailCandidate) {
            const email = String(emailCandidate).toLowerCase();
            let user = await User.findOne({ email });
            if (!user) {
              const local = email.split('@')[0];
              user = await User.create({
                email,
                firstName: local.substring(0, 1).toUpperCase() + local.substring(1, Math.min(local.length, 20)) || 'Client',
                lastName: 'Stripe'
              });
            }

            const levelKeyStripe = String((pi.metadata as any)?.level || 'initie').toLowerCase();
            const levelMap: Record<string, { num: 1 | 2 | 3 | 4; name: 'Simple' | 'Intuitive' | 'Alchimique' | 'Int�grale' }> = {
              initie: { num: 1, name: 'Simple' },
              mystique: { num: 2, name: 'Intuitive' },
              profond: { num: 3, name: 'Alchimique' },
              integrale: { num: 4, name: 'Int�grale' },
            };
            const levelInfo = levelMap[levelKeyStripe] || levelMap['initie'];
            const amount = typeof (pi as any).amount === 'number' ? (pi as any).amount : 0;
            const currency = (pi as any).currency || 'eur';

            order = await Order.create({
              userId: user._id,
              userEmail: user.email,
              level: levelInfo.num,
              levelName: levelInfo.name,
              amount,
              currency,
              status: 'paid',
              paymentIntentId,
              paidAt: new Date(),
              formData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: parsedFormData?.phone || '',
                dateOfBirth: parsedFormData?.dateOfBirth ? new Date(parsedFormData.dateOfBirth) : undefined,
                specificQuestion: parsedFormData?.specificQuestion || parsedFormData?.objective || '',
                preferences: { audioVoice: 'feminine', deliveryFormat: 'email' },
              },
            });
          }
        }
      } catch (stripeErr) {
        const e = stripeErr as any;
        console.log('[CLIENT-SUBMIT] Stripe validation failed:', e?.message || e);
        stripeError = e;
        // 2) Optional direct creation fallback (no Stripe) if explicitly allowed
        //    This decouples Desk from Stripe for uploads-only workflows.
        console.log('[CLIENT-SUBMIT] ENTERING FALLBACK BLOCK - StripeError:', !!stripeError, 'PaymentIntentStatus:', paymentIntent?.status);
        console.log('[CLIENT-SUBMIT] FALLBACK CONDITION CHECK - ALLOW_DIRECT_CLIENT_SUBMIT === "true"?', process.env.ALLOW_DIRECT_CLIENT_SUBMIT === 'true');
        
        if (process.env.ALLOW_DIRECT_CLIENT_SUBMIT === 'true') {
          console.log('[CLIENT-SUBMIT] CREATING DIRECT ORDER with data:', { email: parsedFormData?.email, level: parsedFormData?.level });
          const email = parsedFormData?.email ? String(parsedFormData.email).toLowerCase() : undefined;
          const levelKey = String(parsedFormData?.level || 'initie').toLowerCase();
          if (email) {
            let user = await User.findOne({ email });
            if (!user) {
              const local = email.split('@')[0];
              user = await User.create({
                email,
                firstName: local.substring(0, 1).toUpperCase() + local.substring(1, Math.min(local.length, 20)) || 'Client',
                lastName: 'Client'
              });
            }
            const levelMap: Record<string, { num: 1 | 2 | 3 | 4; name: 'Simple' | 'Intuitive' | 'Alchimique' | 'Int�grale' }> = {
              initie: { num: 1, name: 'Simple' },
              mystique: { num: 2, name: 'Intuitive' },
              profond: { num: 3, name: 'Alchimique' },
              integrale: { num: 4, name: 'Int�grale' },
            };
            const levelInfo = levelMap[levelKey] || levelMap['initie'];
            order = await Order.create({
              userId: user._id,
              userEmail: user.email,
              level: levelInfo.num,
              levelName: levelInfo.name,
              amount: 0,
              currency: 'eur',
              status: 'paid',
              paymentIntentId,
              paidAt: new Date(),
              formData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: parsedFormData?.phone || '',
                dateOfBirth: parsedFormData?.dateOfBirth ? new Date(parsedFormData.dateOfBirth) : undefined,
                specificQuestion: parsedFormData?.specificQuestion || parsedFormData?.objective || '',
                preferences: { audioVoice: 'feminine', deliveryFormat: 'email' },
              },
            });
            console.log('[CLIENT-SUBMIT] DIRECT ORDER CREATED:', order._id, 'Status:', order.status);
          }
        }
      }

      // Additional fallback: create a paid order directly when allowed and no order yet
      if (!order && process.env.ALLOW_DIRECT_CLIENT_SUBMIT === 'true') {
        const email = (parsedFormData && parsedFormData.email) ? String(parsedFormData.email).toLowerCase() : undefined;
        const levelKey = String(parsedFormData?.level || 'initie').toLowerCase();
        if (email) {
          let user = await User.findOne({ email });
          if (!user) {
            const local = email.split('@')[0];
            user = await User.create({
              email,
              firstName: local.substring(0, 1).toUpperCase() + local.substring(1, Math.min(local.length, 20)) || 'Client',
              lastName: 'Client'
            });
          }
          const levelMap: Record<string, { num: 1 | 2 | 3 | 4; name: 'Simple' | 'Intuitive' | 'Alchimique' | 'Int?grale' }> = {
            initie: { num: 1, name: 'Simple' },
            mystique: { num: 2, name: 'Intuitive' },
            profond: { num: 3, name: 'Alchimique' },
            integrale: { num: 4, name: 'Int?grale' },
          };
          const levelInfo = levelMap[levelKey] || levelMap['initie'];
          order = await Order.create({
            userId: user._id,
            userEmail: user.email,
            level: levelInfo.num,
            levelName: levelInfo.name,
            amount: 0,
            currency: 'eur',
            status: 'paid',
            paymentIntentId,
            paidAt: new Date(),
            formData: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: parsedFormData?.phone || '',
              dateOfBirth: parsedFormData?.dateOfBirth ? new Date(parsedFormData.dateOfBirth) : undefined,
              specificQuestion: parsedFormData?.specificQuestion || parsedFormData?.objective || '',
              preferences: { audioVoice: 'feminine', deliveryFormat: 'email' },
            },
          });
          console.log('[CLIENT-SUBMIT] ADDITIONAL FALLBACK ORDER CREATED:', order._id, 'Status:', order.status);
        }
      }

      if (!order) {
        console.error('[CLIENT-SUBMIT] FATAL: No order created despite all attempts');
        return res.status(404).json({ error: 'Order not found for paymentIntentId', paymentIntentId });
      }
      console.log('[CLIENT-SUBMIT] Final order status before file processing:', order.status);
    }

    // Traiter les fichiers uploadés
    const uploadedFiles = [];
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Photo de visage
      if (files.facePhoto && files.facePhoto[0]) {
        const file = files.facePhoto[0];
        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          path: '/uploads/' + file.filename,
          mimetype: file.mimetype,
          size: file.size,
          type: 'face_photo',
          uploadedAt: new Date()
        });
      }
      
      // Photo de paume
      if (files.palmPhoto && files.palmPhoto[0]) {
        const file = files.palmPhoto[0];
        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          path: '/uploads/' + file.filename,
          mimetype: file.mimetype,
          size: file.size,
          type: 'palm_photo',
          uploadedAt: new Date()
        });
      }
    }

    // Parser les données JSON depuis FormData
    const __safeParse = (v: any) => { try { if (!v) return {}; if (typeof v === 'string') return JSON.parse(v); if (typeof v === 'object') return v; return {}; } catch { return {}; } };
    const formData = __safeParse(req.body.formData);
    const clientInputs = __safeParse(req.body.clientInputs);

    // Fusionner les fichiers existants avec les nouveaux
    const existing = order.files || [];
    const combined = [...existing, ...uploadedFiles];
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
    console.error('[CLIENT-SUBMIT] CATCH BLOCK - An error occurred:', error);
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
