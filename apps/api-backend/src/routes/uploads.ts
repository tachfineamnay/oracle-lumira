import express from 'express';
import { getS3Service } from '../services/s3';

const router = express.Router();

// POST /api/uploads/presign
// Body: { type: 'face_photo'|'palm_photo', contentType: string, originalName?: string }
router.post('/presign', async (req: any, res: any) => {
  try {
    const { type, contentType, originalName } = req.body || {};

    if (!type || (type !== 'face_photo' && type !== 'palm_photo')) {
      return res.status(400).json({ error: 'Invalid type. Expected face_photo or palm_photo' });
    }
    if (!contentType || typeof contentType !== 'string') {
      return res.status(400).json({ error: 'contentType is required' });
    }

    // Build a deterministic key similar to server-side uploads
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const ts = Date.now();

    const guessExt = (ct: string, fallback = 'jpg') => {
      if (/jpeg/i.test(ct)) return 'jpg';
      if (/png/i.test(ct)) return 'png';
      if (/webp/i.test(ct)) return 'webp';
      if (/gif/i.test(ct)) return 'gif';
      if (/bmp/i.test(ct)) return 'bmp';
      if (/tiff?/i.test(ct)) return 'tiff';
      if (/heic/i.test(ct)) return 'heic';
      if (/heif/i.test(ct)) return 'heif';
      return fallback;
    };

    const ext = (originalName && /\.([a-zA-Z0-9]+)$/.exec(originalName))?.[1] || guessExt(contentType);
    const random = Math.random().toString(36).slice(2, 10);
    const key = `uploads/${yyyy}/${mm}/${ts}-${random}-${type}.${ext}`;

    const s3 = getS3Service();
    const uploadUrl = await s3.getPresignedPutUrl(key, contentType, 900);
    const publicUrl = s3.getPublicUrl(key);

    console.log('[UPLOADS] Presign success:', { key, publicUrl, type });

    return res.json({ key, uploadUrl, publicUrl, contentType, expiresIn: 900 });
  } catch (error: any) {
    console.error('[UPLOADS] presign error:', error);
    return res.status(500).json({ error: 'Failed to presign upload URL', details: error?.message });
  }
});

export default router;

