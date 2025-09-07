// Oracle Lumira - Environment Diagnostic Route (Development Only)
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/env-check
 * Debug endpoint to check environment variables (DEVELOPMENT ONLY)
 */
router.get('/env-check', (req: Request, res: Response) => {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    PORT: process.env.PORT || 'undefined',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 
      `set (${process.env.STRIPE_SECRET_KEY.length} chars, starts with: ${process.env.STRIPE_SECRET_KEY.substring(0, 7)}...)` : 
      'undefined',
    MONGODB_URI: process.env.MONGODB_URI ? 
      `set (${process.env.MONGODB_URI.length} chars, starts with: mongodb...)` : 
      'undefined',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 
      `set (${process.env.STRIPE_WEBHOOK_SECRET.length} chars)` : 
      'undefined',
    VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 
      `set (${process.env.VITE_STRIPE_PUBLISHABLE_KEY.length} chars, starts with: pk_...)` : 
      'undefined',
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'undefined',
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('STRIPE') || 
      key.includes('MONGODB') || 
      key.includes('VITE_') ||
      ['NODE_ENV', 'PORT'].includes(key)
    ).sort()
  };

  res.json({
    environment: envCheck,
    timestamp: new Date().toISOString(),
  });
});

export default router;
