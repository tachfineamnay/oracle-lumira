/**
 * FormData Validation Middleware
 * 
 * Validates required fields for client-submit endpoint
 * Returns detailed error messages with missing fields list
 */

import { Request, Response, NextFunction } from 'express';

interface FormDataValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidFields: Array<{ field: string; reason: string }>;
}

// Required fields for complete onboarding form
const REQUIRED_FIELDS = [
  'email',
  'firstName',
  'lastName',
  'birthDate',
  'birthTime',
  'birthPlace',
  'specificQuestion',
  'objective'
] as const;

// Optional fields
const OPTIONAL_FIELDS = [
  'phone',
  'deliveryFormat',
  'audioVoice'
] as const;

/**
 * Validates formData structure and required fields
 * @param formData - Parsed formData object
 * @returns Validation result with missing/invalid fields
 */
export function validateFormData(formData: any): FormDataValidationResult {
  const missing: string[] = [];
  const invalid: Array<{ field: string; reason: string }> = [];

  // Check required fields presence
  for (const field of REQUIRED_FIELDS) {
    const value = formData[field];
    
    if (value === undefined || value === null || value === '') {
      missing.push(field);
      continue;
    }

    // Type-specific validation
    switch (field) {
      case 'email':
        if (typeof value !== 'string' || !isValidEmail(value)) {
          invalid.push({ field, reason: 'Invalid email format' });
        }
        break;

      case 'firstName':
      case 'lastName':
      case 'birthPlace':
      case 'specificQuestion':
      case 'objective':
        if (typeof value !== 'string' || value.trim().length === 0) {
          invalid.push({ field, reason: 'Must be a non-empty string' });
        }
        break;

      case 'birthDate':
        if (!isValidDate(value)) {
          invalid.push({ field, reason: 'Invalid date format (expected YYYY-MM-DD or Date object)' });
        }
        break;

      case 'birthTime':
        if (typeof value !== 'string' || !isValidTime(value)) {
          invalid.push({ field, reason: 'Invalid time format (expected HH:MM)' });
        }
        break;
    }
  }

  // Validate optional phone if present
  if (formData.phone && typeof formData.phone === 'string' && formData.phone.trim().length > 0) {
    if (!isValidPhone(formData.phone)) {
      invalid.push({ field: 'phone', reason: 'Invalid phone format' });
    }
  }

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missingFields: missing,
    invalidFields: invalid
  };
}

/**
 * Express middleware for validating formData in client-submit requests
 * Parses formData from JSON or multipart and validates before processing
 * 
 * NOTE: This is a NON-BLOCKING validation - warnings only
 * Missing fields will be enriched from PaymentIntent metadata, Order, or User doc
 * Only CRITICAL validation errors (invalid format) will block the request
 */
export function validateFormDataMiddleware(req: Request, res: Response, next: NextFunction): any {
  try {
    // Parse formData (handle both JSON and string formats)
    const safeParse = (v: any): any => {
      if (!v) return {};
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return {};
        }
      }
      if (typeof v === 'object') return v;
      return {};
    };

    const formData = safeParse((req.body as any).formData || (req.body as any).form_data || req.body);

    // Validate
    const validation = validateFormData(formData);

    // ONLY block on INVALID fields (format errors), not missing fields
    // Missing fields will be enriched from PaymentIntent/Order/User
    if (validation.invalidFields.length > 0) {
      return res.status(400).json({
        error: 'Invalid form data',
        invalidFields: validation.invalidFields,
        message: `Some fields have invalid values: ${validation.invalidFields.map(f => f.field).join(', ')}`
      });
    }

    // Log warnings for missing fields (will be enriched)
    if (validation.missingFields.length > 0) {
      console.warn('[VALIDATE-FORMDATA] Missing fields will be enriched:', validation.missingFields);
    }

    // Validation passed, attach parsed formData to request for next middleware
    (req as any).validatedFormData = formData;
    next();
  } catch (error) {
    console.error('[VALIDATE-FORMDATA] Unexpected error:', error);
    return res.status(500).json({
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Unknown error during validation'
    });
  }
}

// =================== HELPER VALIDATION FUNCTIONS ===================

function isValidEmail(email: string): boolean {
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(value: any): boolean {
  // Accept Date objects, ISO strings, or YYYY-MM-DD format
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  if (typeof value === 'string') {
    // Try parsing as date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      // Verify it's a reasonable birthdate (between 1900 and today)
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear;
    }
  }
  
  return false;
}

function isValidTime(time: string): boolean {
  // Accept HH:MM or HH:MM:SS format
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/;
  return timeRegex.test(time);
}

function isValidPhone(phone: string): boolean {
  // Accept international format with optional + and spaces/dashes
  // Examples: +33612345678, 06 12 34 56 78, +1-555-123-4567
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format (simplified)
  const cleanPhone = phone.replace(/[\s\-().]/g, ''); // Remove formatting
  return phoneRegex.test(cleanPhone);
}

// Export validation result type for use in other modules
export type { FormDataValidationResult };
