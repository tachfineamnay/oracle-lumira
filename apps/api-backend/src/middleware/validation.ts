// Oracle Lumira - Validation Middleware
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Centralized validation middleware
 * Handles express-validator errors uniformly
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
      })),
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  next();
};

/**
 * Helper to create validation middleware chain
 */
export const createValidationChain = (validators: ValidationChain[]) => {
  return [...validators, validateRequest];
};

/**
 * Assert environment variable exists
 */
export const assertEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/**
 * Sanitize error for client response (no sensitive data)
 */
export const sanitizeError = (error: unknown): { message: string; code?: string } => {
  if (error instanceof Error) {
    // Log full error server-side but return sanitized version
    console.error('Server error:', error.stack);
    
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      return { message: 'Internal server error' };
    }
    
    return { message: error.message };
  }
  
  return { message: 'Unknown error occurred' };
};
