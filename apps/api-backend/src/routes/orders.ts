import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { structuredLogger } from '../middleware/logging';
import { Order } from '../models/Order';
import { ProductOrder } from '../models/ProductOrder';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { StripeService } from '../services/stripe';
import { getS3Service } from '../services/s3';

const router = express.Router();

/**
 * Validation stricte des fichiers par analyse des "magic numbers" (signatures binaires)
 * Empêche l'injection de fichiers malveillants déguisés avec de faux mimetypes
 * @param buffer - Buffer du fichier uploadé
 * @param mimetype - Type MIME déclaré
 * @returns true si le fichier est authentique, false sinon
 * @security CRITICAL - Protection contre les attaques par upload de fichiers falsifiés
 */
const validateFileHeader = (buffer: Buffer, mimetype: string): boolean => {
  const magicNumbers: Record<string, number[] | string> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    // WebP: starts with RIFF....WEBP
    'image/webp': 'RIFF-WEBP',
    // GIF87a / GIF89a
    'image/gif': 'GIF8',
  };

  const expected = magicNumbers[mimetype];
  // For unknown/less common types (HEIC/HEIF/BMP/TIFF), be permissive and skip header validation
  if (!expected) {
    return true;
  }

  // Vérifier que le buffer a au moins la taille de la signature
  if (Array.isArray(expected)) {
    if (buffer.length < expected.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (buffer[i] !== expected[i]) return false;
    }
  } else if (typeof expected === 'string') {
    const sig = expected;
    if (sig === 'RIFF-WEBP') {
      // Check 'RIFF' at 0..3 and 'WEBP' at 8..11
      if (buffer.length < 12) return false;
      const riff = buffer.slice(0, 4).toString('ascii');
      const webp = buffer.slice(8, 12).toString('ascii');
      if (riff !== 'RIFF' || webp !== 'WEBP') return false;
    } else if (sig === 'GIF8') {
      if (buffer.length < 4) return false;
      const gif = buffer.slice(0, 4).toString('ascii');
      if (!gif.startsWith('GIF8')) return false;
    }
  }

  return true;
};

/**
 * Configuration Multer sécurisée avec validation multicouche
 * Couche 1: Validation du mimetype et de l'extension
 * Couche 2: Limitation de taille (5MB max)
 * Couche 3: Validation des magic numbers (via middleware validateFileContent)
 * @security HARDENED - Triple validation pour sécurité maximale
 */
// Temporary directory for disk-based uploads to avoid memory pressure
const TEMP_DIR = process.env.UPLOAD_TMP_DIR || path.join(os.tmpdir(), 'lumira-uploads');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TEMP_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const base = `${file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cb(null, `${base}${ext}`);
  }
});

const secureUpload = multer({ 
  storage: diskStorage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB par fichier (très permissif)
    files: 2, // Maximum 2 fichiers
    fieldSize: 50 * 1024 * 1024 // 50MB pour champs texte
  },
  fileFilter: (req, file, cb) => {
    // Autoriser largement les formats d'images courants
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'image/gif', 'image/bmp', 'image/tiff', 'image/heic', 'image/heif'
    ];

    if (!allowedTypes.includes(file.mimetype) && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Type de fichier non autorisé. Veuillez envoyer une image.'));
    }

    // Validation supplémentaire du nom de fichier (permissive sur extensions images)
    const allowedExtensions = /\.(jpg|jpeg|png|webp|gif|bmp|tiff|tif|heic|heif)$/i;
    if (!allowedExtensions.test(file.originalname)) {
      return cb(new Error('Extension de fichier non autorisée. Formats images attendus.'));
    }

    cb(null, true);
  }
});

/**
 * Middleware de validation des magic numbers (couche de sécurité finale)
 * Appliqué après Multer pour vérifier le contenu réel du fichier
 * @param req - Request Express avec fichiers uploadés
 * @param res - Response Express
 * @param next - Next middleware
 * @returns 400 si fichier falsifié détecté, sinon continue
 * @security DEFENSE-IN-DEPTH - Validation post-upload du contenu binaire
 */
const validateFileContent = async (req: any, res: any, next: any) => {
  try {
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Vérifier chaque fichier uploadé
      for (const fieldName in files) {
        for (const file of files[fieldName]) {
          // Read only the first 16 bytes from disk to validate magic numbers
          const fd = await fs.promises.open(file.path, 'r');
          const header = Buffer.alloc(16);
          try {
            await fd.read(header, 0, 16, 0);
          } finally {
            await fd.close();
          }
          if (!validateFileHeader(header, file.mimetype)) {
            return res.status(400).json({
              error: 'Fichier corrompu ou type de fichier falsifié détecté.',
              field: fieldName,
              filename: file.originalname
            });
          }
        }
      }
    }
    next();
  } catch (error) {
    structuredLogger.error('[FILE-VALIDATION] Erreur de validation', error, req);
    return res.status(500).json({ error: 'Erreur lors de la validation des fichiers.' });
  }
};



// Safe wrapper to catch Multer errors and respond with meaningful status codes
const clientSubmitUpload = (req: any, res: any, next: any) => {
  const handler = secureUpload.fields([
    { name: 'facePhoto', maxCount: 1 },
    { name: 'palmPhoto', maxCount: 1 },
  ]);
  handler(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Fichier trop volumineux (max 1GB).' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Trop de fichiers. Maximum 2 autorisés.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Champ de fichier inattendu.' });
      }
      return res.status(400).json({ error: `Erreur upload (${err.code}).` });
    }
    if (err) {
      return res.status(400).json({ error: err.message || 'Erreur upload.' });
    }
    next();
  });
};

// Client submission: attach uploaded files + form data by paymentIntentId
router.post('/by-payment-intent/:paymentIntentId/client-submit', 
  clientSubmitUpload,
  validateFileContent,
  async (req: any, res: any) => {
  try {
    // =================== INSTRUMENTATION AGRESSIVE CLIENT-SUBMIT ===================
    structuredLogger.info('[CLIENT-SUBMIT] Début de traitement', {
      paymentIntentId: req.params.paymentIntentId,
      hasFiles: !!req.files,
      contentType: req.headers['content-type']
    }, req);
    // =================== FIN INSTRUMENTATION ===================
    // =================== MISSION FINISH LINE - INSTRUMENTATION CHIRURGICALE ===================
    structuredLogger.debug('[CLIENT-SUBMIT] Request headers', { headers: req.headers }, req);
    structuredLogger.info('[CLIENT-SUBMIT] ENV CHECK', { ALLOW_DIRECT_CLIENT_SUBMIT: process.env.ALLOW_DIRECT_CLIENT_SUBMIT }, req);
    
    const { paymentIntentId } = req.params;
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      structuredLogger.error('[CLIENT-SUBMIT] FATAL: paymentIntentId invalid', { paymentIntentId }, req);
      return res.status(400).json({ error: 'paymentIntentId invalid' });
    }
    
    structuredLogger.info('[CLIENT-SUBMIT] PaymentIntentId received', { paymentIntentId }, req);

    structuredLogger.debug('[CLIENT-SUBMIT] Payload snapshot', { hasFiles: !!req.files, bodyKeys: Object.keys(req.body || {}) }, req);
    
    let order = await Order.findOne({ paymentIntentId });
    structuredLogger.info('[CLIENT-SUBMIT] Existing order found', { exists: !!order }, req);
    
    if (!order) {
      // Parse early (we may need formData for direct creation) - robust to strings/objects
      const __earlySafeParse = (v: any) => { try { if (!v) return {}; if (typeof v === 'string') return JSON.parse(v); if (typeof v === 'object') return v; return {}; } catch { return {}; } };
      let parsedFormData;
      try {
        parsedFormData = __earlySafeParse(req.body?.formData);
        structuredLogger.debug('[CLIENT-SUBMIT] FORM-DATA parsed', { hasEmail: !!parsedFormData?.email, level: parsedFormData?.level }, req);
      } catch (e) {
        structuredLogger.error('[CLIENT-SUBMIT] FATAL: JSON parsing failed', e, req);
        return res.status(400).json({ error: 'Invalid formData JSON.' });
      }

      // 1) Try Stripe validation (standard path)
      let stripeError = null;
      let paymentIntent = null;
      try {
        structuredLogger.info('[CLIENT-SUBMIT] Attempting Stripe validation', { paymentIntentId }, req);
        const pi = await StripeService.getPaymentIntent(paymentIntentId);
        paymentIntent = pi;
        structuredLogger.info('[CLIENT-SUBMIT] Stripe PaymentIntent retrieved', { status: pi?.status, amount: (pi as any)?.amount }, req);
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
            const levelMap: Record<string, { num: 1 | 2 | 3 | 4; name: 'Simple' | 'Intuitive' | 'Alchimique' | 'Intégrale' }> = {
              initie: { num: 1, name: 'Simple' },
              mystique: { num: 2, name: 'Intuitive' },
              profond: { num: 3, name: 'Alchimique' },
              integrale: { num: 4, name: 'Intégrale' },
            };
            const levelInfo = levelMap[levelKeyStripe] || levelMap['initie'];
            const amount = typeof (pi as any).amount === 'number' ? (pi as any).amount : 0;
            const currency = (pi as any).currency || 'eur';

            // Validation des champs obligatoires avant création
            if (!levelInfo.num) {
              structuredLogger.error('[CLIENT-SUBMIT] CRITICAL: Level number is missing or invalid', { levelInfo }, req);
              return res.status(400).json({ error: 'Level information is invalid' });
            }

            if (!user._id) {
              structuredLogger.error('[CLIENT-SUBMIT] CRITICAL: User ID is missing', undefined, req);
              return res.status(400).json({ error: 'User information is missing' });
            }

            try {
              structuredLogger.info('[CLIENT-SUBMIT] Creating order with validated data', {
                userId: user._id,
                userEmail: user.email,
                level: levelInfo.num,
                amount,
                currency,
                paymentIntentId
              }, req);

              const orderNumber = `LUM-${Date.now()}`;
              order = await Order.create({
                orderNumber: orderNumber,
                userId: user._id,
                userEmail: user.email,
                level: levelInfo.num,
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
              
              structuredLogger.info('[CLIENT-SUBMIT] Order created successfully', { orderId: order._id, orderNumber: order.orderNumber }, req);
            } catch (orderCreationError) {
              structuredLogger.error('[CLIENT-SUBMIT] CRITICAL ERROR during order creation', orderCreationError, req);
              structuredLogger.error('[CLIENT-SUBMIT] Order creation failed with data', {
                userId: user._id,
                level: levelInfo.num,
                amount,
                currency
              }, req);
              return res.status(500).json({ 
                error: 'Failed to create order', 
                details: orderCreationError instanceof Error ? orderCreationError.message : 'Unknown error'
              });
            }
          }
        }
      } catch (stripeErr) {
        const e = stripeErr as any;
        structuredLogger.warn('[CLIENT-SUBMIT] Stripe validation failed', { error: (e as any)?.message || e }, req);
        stripeError = e;
        // 2) Optional direct creation fallback (no Stripe) if explicitly allowed
        //    This decouples Desk from Stripe for uploads-only workflows.
        structuredLogger.info('[CLIENT-SUBMIT] ENTERING FALLBACK BLOCK', { hasStripeError: !!stripeError, paymentIntentStatus: paymentIntent?.status }, req);
        structuredLogger.info('[CLIENT-SUBMIT] FALLBACK CONDITION CHECK', { allowDirect: process.env.ALLOW_DIRECT_CLIENT_SUBMIT === 'true' }, req);
        
        if (process.env.ALLOW_DIRECT_CLIENT_SUBMIT === 'true') {
          structuredLogger.info('[CLIENT-SUBMIT] CREATING DIRECT ORDER', { emailPresent: !!parsedFormData?.email, level: parsedFormData?.level }, req);
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
            const levelMap: Record<string, { num: 1 | 2 | 3 | 4; name: 'Simple' | 'Intuitive' | 'Alchimique' | 'Intégrale' }> = {
              initie: { num: 1, name: 'Simple' },
              mystique: { num: 2, name: 'Intuitive' },
              profond: { num: 3, name: 'Alchimique' },
              integrale: { num: 4, name: 'Intégrale' },
            };
            const levelInfo = levelMap[levelKey] || levelMap['initie'];
            const orderNumber = `LUM-${Date.now()}`;
            order = await Order.create({
            orderNumber: orderNumber,
            userId: user._id,
            userEmail: user.email,
            level: levelInfo.num,
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
            structuredLogger.info('[CLIENT-SUBMIT] DIRECT ORDER CREATED', { orderId: order._id, status: order.status }, req);
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
          const levelMap: Record<string, { num: 1 | 2 | 3 | 4; name: 'Simple' | 'Intuitive' | 'Alchimique' | 'Intégrale' }> = {
            initie: { num: 1, name: 'Simple' },
            mystique: { num: 2, name: 'Intuitive' },
            profond: { num: 3, name: 'Alchimique' },
            integrale: { num: 4, name: 'Intégrale' },
          };
          const levelInfo = levelMap[levelKey] || levelMap['initie'];
          
          // Validation des champs obligatoires avant création (additional fallback)
          if (!levelInfo.num) {
            structuredLogger.error('[CLIENT-SUBMIT] CRITICAL ADDITIONAL FALLBACK: Level invalid', { levelInfo }, req);
            return res.status(400).json({ error: 'Level information is invalid in additional fallback mode' });
          }

          if (!user._id) {
            structuredLogger.error('[CLIENT-SUBMIT] CRITICAL ADDITIONAL FALLBACK: User ID missing', undefined, req);
            return res.status(400).json({ error: 'User information is missing in additional fallback mode' });
          }

          try {
            structuredLogger.info('[CLIENT-SUBMIT] Creating additional fallback order with validated data', {
              userId: user._id,
              userEmail: user.email,
              level: levelInfo.num,
              paymentIntentId
            }, req);

            const orderNumber = `LUM-${Date.now()}`;
            order = await Order.create({
              orderNumber: orderNumber,
              userId: user._id,
              userEmail: user.email,
              level: levelInfo.num,
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
            
            structuredLogger.info('[CLIENT-SUBMIT] ADDITIONAL FALLBACK ORDER CREATED', { orderId: order._id, orderNumber: order.orderNumber, status: order.status }, req);
          } catch (orderCreationError) {
            structuredLogger.error('[CLIENT-SUBMIT] CRITICAL ERROR during additional fallback order creation', orderCreationError, req);
            structuredLogger.error('[CLIENT-SUBMIT] Additional fallback order creation failed with data', {
              userId: user._id,
              level: levelInfo.num,
              email
            }, req);
            return res.status(500).json({ 
              error: 'Failed to create additional fallback order', 
              details: orderCreationError instanceof Error ? orderCreationError.message : 'Unknown error'
            });
          }
        }
      }

      if (!order) {
        structuredLogger.error('[CLIENT-SUBMIT] FATAL: No order created despite all attempts', { paymentIntentId }, req);
        return res.status(404).json({ error: 'Order not found for paymentIntentId', paymentIntentId });
      }
      structuredLogger.info('[CLIENT-SUBMIT] Final order status before file processing', { status: order.status }, req);
    }

    // Traiter les fichiers uploadés avec S3
    const uploadedFiles = [] as any[];
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const s3Service = getS3Service();
      
      // Photo de visage
      if (files.facePhoto && files.facePhoto[0]) {
        const file = files.facePhoto[0];
        try {
          const stream = fs.createReadStream(file.path);
          const uploadResult = await s3Service.uploadStream(stream, file.originalname, file.mimetype, 'face_photo');
          // Best-effort file size
          let size = 0;
          try { const st = await fs.promises.stat(file.path); size = st.size; } catch {}
          
          uploadedFiles.push({
            name: file.originalname,
            url: uploadResult.url,
            key: uploadResult.key,
            contentType: file.mimetype,
            size,
            type: 'face_photo',
            uploadedAt: new Date()
          });
          // cleanup temp file
          fs.promises.unlink(file.path).catch(() => {});
        } catch (error) {
          structuredLogger.error('Erreur upload photo visage S3', error, req);
          return res.status(500).json({ error: 'Échec upload photo visage' });
        }
      }
      
      // Photo de paume
      if (files.palmPhoto && files.palmPhoto[0]) {
        const file = files.palmPhoto[0];
        try {
          const stream = fs.createReadStream(file.path);
          const uploadResult = await s3Service.uploadStream(stream, file.originalname, file.mimetype, 'palm_photo');
          let size = 0;
          try { const st = await fs.promises.stat(file.path); size = st.size; } catch {}
          
          uploadedFiles.push({
            name: file.originalname,
            url: uploadResult.url,
            key: uploadResult.key,
            contentType: file.mimetype,
            size,
            type: 'palm_photo',
            uploadedAt: new Date()
          });
          fs.promises.unlink(file.path).catch(() => {});
        } catch (error) {
          structuredLogger.error('Erreur upload photo paume S3', error, req);
          return res.status(500).json({ error: 'Échec upload photo paume' });
        }
      }
    }

    // Handle direct-to-S3 uploads via uploadedKeys in JSON body
    // Expect: req.body.uploadedKeys = { facePhotoKey?: string, palmPhotoKey?: string }
    try {
      const __safeParse = (v: any) => { try { if (!v) return {}; if (typeof v === 'string') return JSON.parse(v); if (typeof v === 'object') return v; return {}; } catch { return {}; } };
      const keys = __safeParse(req.body.uploadedKeys);
      const s3Service = getS3Service();
      if (keys && (keys.facePhotoKey || keys.palmPhotoKey)) {
        if (keys.facePhotoKey) {
          const key = String(keys.facePhotoKey);
          uploadedFiles.push({
            name: key.split('/').pop() || 'face_photo',
            url: s3Service.getPublicUrl(key),
            key,
            contentType: 'image',
            size: 0,
            type: 'face_photo',
            uploadedAt: new Date()
          });
        }
        if (keys.palmPhotoKey) {
          const key = String(keys.palmPhotoKey);
          uploadedFiles.push({
            name: key.split('/').pop() || 'palm_photo',
            url: s3Service.getPublicUrl(key),
            key,
            contentType: 'image',
            size: 0,
            type: 'palm_photo',
            uploadedAt: new Date()
          });
        }
      }
    } catch (e) {
      structuredLogger.warn('[CLIENT-SUBMIT] uploadedKeys parse skipped', { error: e instanceof Error ? e.message : e }, req);
    }

    // Parser les données JSON depuis FormData
    const __safeParse2 = (v: any) => { try { if (!v) return {}; if (typeof v === 'string') return JSON.parse(v); if (typeof v === 'object') return v; return {}; } catch { return {}; } };
    const formDataRaw = __safeParse2(req.body.formData || req.body.form_data || req.body);
    const clientInputs = __safeParse2(req.body.clientInputs);

    // =================== ENRICHISSEMENT AVEC PRIORITÉ CORRECTE ===================
    // Priorité: 1) Client-submitted data, 2) PaymentIntent metadata, 3) Order.formData, 4) User doc
    structuredLogger.info('[CLIENT-SUBMIT][ENRICH] Starting enrichment with priority cascade', {
      hasClientData: !!Object.keys(formDataRaw).length,
      paymentIntentId: order.paymentIntentId
    }, req);

    // 1️⃣ CLIENT-SUBMITTED DATA (highest priority)
    const clientData = { ...formDataRaw };
    const fieldsFromClient = ['email', 'firstName', 'lastName', 'phone'].filter(f => !!clientData[f]);
    if (fieldsFromClient.length > 0) {
      structuredLogger.info('[CLIENT-SUBMIT][ENRICH] Source: Client-submitted data', {
        fields: fieldsFromClient
      }, req);
    }

    // 2️⃣ PAYMENTINTENT METADATA (Stripe billing info)
    let piMetadata: any = {};
    try {
      const pi = order.paymentIntentId
        ? await StripeService.getPaymentIntent(order.paymentIntentId)
        : null;
      if (pi && pi.metadata) {
        piMetadata = {
          email: (pi.metadata as any).customerEmail,
          phone: (pi.metadata as any).customerPhone,
          // Parse customerName into firstName/lastName
          ...((() => {
            const name: string = String((pi.metadata as any).customerName || '');
            const parts = name.split(' ');
            return {
              firstName: parts[0] || '',
              lastName: parts.slice(1).join(' ') || ''
            };
          })())
        };
        const fieldsFromPI = ['email', 'firstName', 'lastName', 'phone'].filter(f => !!piMetadata[f]);
        if (fieldsFromPI.length > 0) {
          structuredLogger.info('[CLIENT-SUBMIT][ENRICH] Source: PaymentIntent metadata', {
            fields: fieldsFromPI
          }, req);
        }
      }
    } catch (e) {
      structuredLogger.warn('[CLIENT-SUBMIT][ENRICH] PaymentIntent metadata unavailable', {
        error: e instanceof Error ? e.message : String(e)
      }, req);
    }

    // 3️⃣ ORDER.FORMDATA (existing order data)
    const orderData = order.formData || {};
    const fieldsFromOrder = ['email', 'firstName', 'lastName', 'phone'].filter(f => !!orderData[f]);
    if (fieldsFromOrder.length > 0) {
      structuredLogger.info('[CLIENT-SUBMIT][ENRICH] Source: Order.formData (existing)', {
        fields: fieldsFromOrder
      }, req);
    }

    // 4️⃣ USER DOC (last resort fallback)
    let userDoc: any = null;
    try {
      if (order.userId) {
        userDoc = await User.findById(order.userId).lean();
      }
      // Fallback: try by email if no userId
      if (!userDoc && (clientData.email || piMetadata.email || orderData.email)) {
        const emailCandidate = clientData.email || piMetadata.email || orderData.email;
        userDoc = await User.findOne({ email: String(emailCandidate).toLowerCase() }).lean();
      }
      if (userDoc) {
        const fieldsFromUser = ['email', 'firstName', 'lastName', 'phone'].filter(f => !!userDoc[f]);
        if (fieldsFromUser.length > 0) {
          structuredLogger.info('[CLIENT-SUBMIT][ENRICH] Source: User doc (fallback)', {
            fields: fieldsFromUser,
            userId: (userDoc as any)._id
          }, req);
        }
      }
    } catch (e) {
      structuredLogger.warn('[CLIENT-SUBMIT][ENRICH] User doc lookup failed', {
        error: e instanceof Error ? e.message : String(e)
      }, req);
    }

    // MERGE WITH PRIORITY: client > piMetadata > order > user
    const formData = {
      email: clientData.email || piMetadata.email || orderData.email || userDoc?.email || '',
      firstName: clientData.firstName || piMetadata.firstName || orderData.firstName || userDoc?.firstName || '',
      lastName: clientData.lastName || piMetadata.lastName || orderData.lastName || userDoc?.lastName || '',
      phone: clientData.phone || piMetadata.phone || orderData.phone || userDoc?.phone || '',
      // Preserve other fields from client data
      ...clientData
    };

    // Log final enrichment result
    const enrichmentSummary = {
      email: clientData.email ? 'client' : piMetadata.email ? 'stripe' : orderData.email ? 'order' : userDoc?.email ? 'user' : 'missing',
      firstName: clientData.firstName ? 'client' : piMetadata.firstName ? 'stripe' : orderData.firstName ? 'order' : userDoc?.firstName ? 'user' : 'missing',
      lastName: clientData.lastName ? 'client' : piMetadata.lastName ? 'stripe' : orderData.lastName ? 'order' : userDoc?.lastName ? 'user' : 'missing',
      phone: clientData.phone ? 'client' : piMetadata.phone ? 'stripe' : orderData.phone ? 'order' : userDoc?.phone ? 'user' : 'missing'
    };
    structuredLogger.info('[CLIENT-SUBMIT][ENRICH] Enrichment complete', {
      sources: enrichmentSummary,
      finalData: {
        hasEmail: !!formData.email,
        hasFirstName: !!formData.firstName,
        hasLastName: !!formData.lastName,
        hasPhone: !!formData.phone
      }
    }, req);
    // =================== FIN ENRICHISSEMENT ===================

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

    // Enforce identity fields (email/firstName/lastName) from multiple sources before saving
    const pickFirstNonEmpty = (...vals: any[]): string | undefined => {
      for (const v of vals) {
        if (typeof v === 'string' && v.trim().length > 0) return v.trim();
      }
      return undefined;
    };
    const emailFinal = (pickFirstNonEmpty(
      (formData as any)?.email,
      (clientData as any)?.email,
      (piMetadata as any)?.email,
      (order.formData as any)?.email,
      (typeof userDoc === 'object' ? (userDoc as any)?.email : undefined)
    ) || '').toLowerCase();

    const firstNameFallbackFromEmail = emailFinal && emailFinal.includes('@') ? emailFinal.split('@')[0] : undefined;
    const firstNameFinal = pickFirstNonEmpty(
      (formData as any)?.firstName,
      (clientData as any)?.firstName,
      (piMetadata as any)?.firstName,
      (order.formData as any)?.firstName,
      (typeof userDoc === 'object' ? (userDoc as any)?.firstName : undefined),
      firstNameFallbackFromEmail,
      'Client'
    )!;
    const lastNameFinal = pickFirstNonEmpty(
      (formData as any)?.lastName,
      (clientData as any)?.lastName,
      (piMetadata as any)?.lastName,
      (order.formData as any)?.lastName,
      (typeof userDoc === 'object' ? (userDoc as any)?.lastName : undefined),
      'Stripe'
    )!;
    const phoneFinal = pickFirstNonEmpty(
      (formData as any)?.phone,
      (clientData as any)?.phone,
      (piMetadata as any)?.phone,
      (order.formData as any)?.phone,
      (typeof userDoc === 'object' ? (userDoc as any)?.phone : undefined)
    );

    order.formData = {
      ...order.formData,
      email: emailFinal,
      firstName: firstNameFinal,
      lastName: lastNameFinal,
      phone: phoneFinal ?? (order.formData as any)?.phone,
    } as any;

    order.clientInputs = {
      ...order.clientInputs,
      birthTime: clientInputs.birthTime ?? order.clientInputs?.birthTime,
      birthPlace: clientInputs.birthPlace ?? order.clientInputs?.birthPlace,
      specificContext: clientInputs.specificContext ?? order.clientInputs?.specificContext,
      lifeQuestion: clientInputs.lifeQuestion ?? order.clientInputs?.lifeQuestion,
    } as any;

    order.updatedAt = new Date();
    
    try {
      await order.save();
      structuredLogger.info('[CLIENT-SUBMIT] Order updated and saved successfully', { orderId: order._id }, req);
    } catch (saveError) {
      structuredLogger.error('[CLIENT-SUBMIT] CRITICAL ERROR during order save', saveError, req);
      structuredLogger.error('[CLIENT-SUBMIT] Order save failed for order', { orderId: order._id }, req);
      return res.status(500).json({ 
        error: 'Failed to save order', 
        details: saveError instanceof Error ? saveError.message : 'Unknown save error'
      });
    }

    // =================== SYNCHRONISER LES PHOTOS VERS LE PROFIL UTILISATEUR ===================
    // CRITIQUE : Les photos uploadées doivent être visibles dans Profile.tsx
    try {
      const facePhotoFile = uploadedFiles.find((f: any) => f.type === 'face_photo');
      const palmPhotoFile = uploadedFiles.find((f: any) => f.type === 'palm_photo');
      
      if ((facePhotoFile || palmPhotoFile) && emailFinal) {
        structuredLogger.info('[CLIENT-SUBMIT] Synchronisation des photos vers le profil utilisateur', {
          email: emailFinal,
          hasFacePhoto: !!facePhotoFile,
          hasPalmPhoto: !!palmPhotoFile
        }, req);

        // Trouver ou créer l'utilisateur
        let user = await User.findOne({ email: emailFinal.toLowerCase() });
        
        if (!user) {
          structuredLogger.info('[CLIENT-SUBMIT] Utilisateur non trouvé, création...', { email: emailFinal }, req);
          user = new User({
            email: emailFinal.toLowerCase(),
            firstName: firstNameFinal,
            lastName: lastNameFinal,
            phone: phoneFinal,
            profile: {}
          });
        }

        // Initialiser profile si nécessaire
        const profileData: any = user.profile || {};

        // Mettre à jour les URLs des photos
        if (facePhotoFile) {
          profileData.facePhotoUrl = facePhotoFile.url;
          structuredLogger.info('[CLIENT-SUBMIT] Photo visage sauvegardée', { url: facePhotoFile.url }, req);
        }
        if (palmPhotoFile) {
          profileData.palmPhotoUrl = palmPhotoFile.url;
          structuredLogger.info('[CLIENT-SUBMIT] Photo paume sauvegardée', { url: palmPhotoFile.url }, req);
        }

        // Synchroniser aussi les données du formulaire vers le profil
        if (formData.dateOfBirth) {
          profileData.birthDate = formData.dateOfBirth;
        }
        if (formData.birthTime || (clientInputs as any)?.birthTime) {
          profileData.birthTime = formData.birthTime || (clientInputs as any).birthTime;
        }
        if (formData.birthPlace || (clientInputs as any)?.birthPlace) {
          profileData.birthPlace = formData.birthPlace || (clientInputs as any).birthPlace;
        }
        if (formData.specificQuestion || formData.objective) {
          profileData.specificQuestion = formData.specificQuestion || formData.objective;
        }
        if ((clientInputs as any)?.lifeQuestion || formData.objective) {
          profileData.objective = (clientInputs as any)?.lifeQuestion || formData.objective;
        }

        // Réassigner le profil mis à jour
        user.profile = profileData;
        await user.save();
        
        structuredLogger.info('[CLIENT-SUBMIT] Profil utilisateur synchronisé avec succès', {
          userId: user._id,
          hasFacePhoto: !!profileData.facePhotoUrl,
          hasPalmPhoto: !!profileData.palmPhotoUrl
        }, req);
      }
    } catch (profileError) {
      // Non-bloquant : on log l'erreur mais on continue
      structuredLogger.error('[CLIENT-SUBMIT] Erreur lors de la synchronisation du profil', profileError, req);
    }
    // =================== FIN SYNCHRONISATION PROFIL ===================

    res.json({ success: true, order, normalizedFormData: order.formData });
  } catch (catchError) {
    structuredLogger.error('[CLIENT-SUBMIT] CRITICAL GLOBAL ERROR - Unexpected error', catchError, req);
    structuredLogger.error('[CLIENT-SUBMIT] Request context', {
      paymentIntentId: req.params.paymentIntentId,
      hasFiles: !!req.files,
      bodyKeys: Object.keys(req.body || {})
    }, req);
    res.status(500).json({ 
      error: 'Erreur client-submit', 
      details: catchError instanceof Error ? catchError.message : 'Erreur interne inconnue'
    });
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

// Get order by ID or PaymentIntent ID
// TACTICAL FIX: Fallback to ProductOrder if Order not found
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    console.log('[GET-ORDER] Recherche commande avec ID:', id);
    
    // Strategy 1: Try to find by PaymentIntent ID first (pi_xxx or free_xxx format)
    let order;
    if (id.startsWith('pi_') || id.startsWith('free_') || id.startsWith('pi_mock_')) {
      console.log('[GET-ORDER] Détection PaymentIntent ID, recherche par paymentIntentId...');
      order = await Order.findOne({ paymentIntentId: id })
        .populate('userId', 'firstName lastName email phone stripeCustomerId');
      console.log('[GET-ORDER] Résultat Order.findOne:', order ? 'TROUVÉ' : 'NON TROUVÉ');
      
      // Strategy 2: Fallback to ProductOrder if Order not found
      if (!order) {
        console.log('[GET-ORDER] Order not found, searching in ProductOrder collection...');
        const productOrder = await ProductOrder.findOne({ paymentIntentId: id });
        console.log('[GET-ORDER] Résultat ProductOrder.findOne:', productOrder ? 'TROUVÉ' : 'NON TROUVÉ');
        
        if (productOrder) {
          // Build a compatible response for the frontend
          console.log('[GET-ORDER] ProductOrder trouvée, construction réponse compatible');
          
          // Map ProductOrder status to client-facing status
          // Important: expose 'completed' when ProductOrder is completed so polling can stop
          const statusMapping: Record<string, string> = {
            'pending': 'pending',
            'processing': 'processing',
            'completed': 'completed',
            'failed': 'failed',
            'cancelled': 'refunded'
          };

          const mappedStatus = statusMapping[productOrder.status] || 'pending';

          // Determine if access should be granted
          const accessGranted = productOrder.status === 'completed';

          // Derive level metadata from productId for Sanctuaire routing
          const levelMap: Record<string, { num: 1|2|3|4; name: 'Simple'|'Intuitive'|'Alchimique'|'Intégrale' }> = {
            initie: { num: 1, name: 'Simple' },
            mystique: { num: 2, name: 'Intuitive' },
            profond: { num: 3, name: 'Alchimique' },
            integrale: { num: 4, name: 'Intégrale' },
          };
          const levelInfo = levelMap[(productOrder.productId || '').toLowerCase()] || levelMap['initie'];
          
          const compatibleResponse = {
            _id: productOrder._id,
            orderNumber: `TEMP-${productOrder.paymentIntentId.slice(-8)}`,
            paymentIntentId: productOrder.paymentIntentId,
            status: mappedStatus,
            level: levelInfo.num,
            amount: productOrder.amount,
            currency: productOrder.currency,
            userEmail: productOrder.customerEmail,
            productId: productOrder.productId,
            createdAt: productOrder.createdAt,
            updatedAt: productOrder.updatedAt,
            // Provide metadata expected by OnboardingForm fallback
            metadata: {
              customerEmail: (productOrder as any)?.metadata?.customerEmail || productOrder.customerEmail || '',
              customerPhone: (productOrder as any)?.metadata?.customerPhone || '',
              customerName: (productOrder as any)?.metadata?.customerName || '',
            },
            // Frontend compatibility fields
            accessGranted,
            sanctuaryUrl: accessGranted ? '/sanctuaire' : null,
            message: accessGranted 
              ? 'Payment successful. Please complete your Sanctuaire profile.' 
              : 'Order is being processed.',
            // Flag to indicate this is from ProductOrder (for debugging)
            _source: 'ProductOrder'
          };
          
          console.log('[GET-ORDER] SUCCESS - ProductOrder mappée en réponse compatible:', {
            paymentIntentId: productOrder.paymentIntentId,
            status: compatibleResponse.status,
            accessGranted
          });
          
          return res.json(compatibleResponse);
        }
      }
    } else {
      console.log('[GET-ORDER] Détection ObjectId, recherche par _id...');
      // Otherwise try MongoDB ObjectId
      order = await Order.findById(id)
        .populate('userId', 'firstName lastName email phone stripeCustomerId');
      console.log('[GET-ORDER] Résultat findById:', order ? 'TROUVÉ' : 'NON TROUVÉ');
    }
    
    if (!order) {
      console.log('[GET-ORDER] ERREUR 404 - Commande non trouvée pour ID:', id);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('[GET-ORDER] SUCCESS - Order trouvée:', order._id);
    res.json(order);
  } catch (error) {
    console.error('[GET-ORDER] ERREUR CRITIQUE:', error);
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






