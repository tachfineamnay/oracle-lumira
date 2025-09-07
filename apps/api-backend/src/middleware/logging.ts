import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Middleware to add unique request ID to each request
 * Supports both header-provided and auto-generated IDs
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const headerName = process.env.REQUEST_ID_HEADER || 'x-request-id';
  req.requestId = req.get(headerName) || randomUUID();
  res.setHeader(headerName, req.requestId);
  next();
};

/**
 * Structured logger with request correlation
 * Outputs JSON format suitable for centralized logging systems
 */
export const structuredLogger = {
  info: (message: string, meta?: any, req?: Request) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      requestId: req?.requestId || 'system',
      method: req?.method,
      url: req?.url,
      userAgent: req?.get('user-agent'),
      ip: req?.ip || req?.socket?.remoteAddress,
      ...meta
    }));
  },

  error: (message: string, error?: any, req?: Request) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      requestId: req?.requestId || 'system',
      method: req?.method,
      url: req?.url,
      userAgent: req?.get('user-agent'),
      ip: req?.ip || req?.socket?.remoteAddress,
      error: error?.message || error,
      stack: error?.stack,
      code: error?.code || error?.status
    }));
  },

  warn: (message: string, meta?: any, req?: Request) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      requestId: req?.requestId || 'system',
      method: req?.method,
      url: req?.url,
      userAgent: req?.get('user-agent'),
      ip: req?.ip || req?.socket?.remoteAddress,
      ...meta
    }));
  },

  debug: (message: string, meta?: any, req?: Request) => {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      console.debug(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        requestId: req?.requestId || 'system',
        method: req?.method,
        url: req?.url,
        ...meta
      }));
    }
  }
};

/**
 * HTTP request logging middleware
 * Logs request start and completion with timing
 */
export const httpLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request start
  structuredLogger.info('HTTP Request Started', {
    method: req.method,
    url: req.url,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    contentLength: req.get('content-length'),
    contentType: req.get('content-type')
  }, req);

  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any): Response {
    const duration = Date.now() - start;
    
    structuredLogger.info('HTTP Request Completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      performance: {
        fast: duration < 100,
        slow: duration > 1000
      }
    }, req);

    return originalEnd(chunk, encoding, cb);
  } as any;

  next();
};

/**
 * Error logging middleware
 * Should be placed after all other middlewares
 */
export const errorLoggerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  structuredLogger.error('Unhandled Error', err, req);
  
  // Don't expose internal errors in production
  const isDev = process.env.NODE_ENV !== 'production';
  const errorResponse = {
    error: 'Internal Server Error',
    requestId: req.requestId,
    ...(isDev && {
      message: err.message,
      stack: err.stack
    })
  };

  res.status(err.status || 500).json(errorResponse);
};

/**
 * Database operation logger
 * For logging MongoDB operations with performance tracking
 */
export const dbLogger = {
  query: (collection: string, operation: string, query?: any, duration?: number, req?: Request) => {
    structuredLogger.info('Database Query', {
      collection,
      operation,
      query: process.env.NODE_ENV !== 'production' ? query : '[REDACTED]',
      duration: duration ? `${duration}ms` : undefined,
      performance: duration ? {
        fast: duration < 50,
        slow: duration > 500
      } : undefined
    }, req);
  },

  error: (collection: string, operation: string, error: any, req?: Request) => {
    structuredLogger.error('Database Error', {
      collection,
      operation,
      error: error.message || error,
      code: error.code || error.status
    }, req);
  }
};

/**
 * Security event logger
 * For logging authentication, authorization, and security events
 */
export const securityLogger = {
  auth: (event: string, userId?: string, success: boolean = true, meta?: any, req?: Request) => {
    const level = success ? 'info' : 'warn';
    structuredLogger[level]('Security Event', {
      event,
      userId,
      success,
      category: 'authentication',
      ...meta
    }, req);
  },

  accessDenied: (resource: string, userId?: string, reason?: string, req?: Request) => {
    structuredLogger.warn('Access Denied', {
      event: 'access_denied',
      resource,
      userId,
      reason,
      category: 'authorization'
    }, req);
  },

  suspiciousActivity: (activity: string, details?: any, req?: Request) => {
    structuredLogger.error('Suspicious Activity Detected', {
      event: 'suspicious_activity',
      activity,
      details,
      category: 'security_alert',
      requiresInvestigation: true
    }, req);
  }
};

export default {
  requestIdMiddleware,
  httpLoggerMiddleware,
  errorLoggerMiddleware,
  structuredLogger,
  dbLogger,
  securityLogger
};
