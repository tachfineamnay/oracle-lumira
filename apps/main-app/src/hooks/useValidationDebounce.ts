import { useEffect } from 'react';

export interface FieldState {
  value: string;
  touched: boolean;
  error: string | null;
  valid: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * useValidationDebounce Hook
 * 
 * Applique une validation avec debounce pour éviter de valider à chaque frappe.
 * Idéal pour validation email, phone, etc. avec API calls ou regex complexes.
 * 
 * @param field - L'état actuel du champ
 * @param setField - Fonction pour mettre à jour l'état
 * @param validator - Fonction de validation qui retourne {valid, error}
 * @param delay - Délai en ms avant validation (défaut: 300ms)
 * 
 * @example
 * ```tsx
 * const [email, setEmail] = useState<FieldState>({
 *   value: '',
 *   touched: false,
 *   error: null,
 *   valid: false,
 * });
 * 
 * useValidationDebounce(email, setEmail, validateEmail, 300);
 * ```
 */
export const useValidationDebounce = (
  field: FieldState,
  setField: React.Dispatch<React.SetStateAction<FieldState>>,
  validator: (value: string) => ValidationResult,
  delay = 300
) => {
  useEffect(() => {
    // Ne valide que si le champ a été touché et n'est pas vide
    if (!field.touched || !field.value) {
      return;
    }

    const timer = setTimeout(() => {
      const { valid, error } = validator(field.value);
      
      setField((prev) => ({
        ...prev,
        valid,
        error: error || null,
      }));
    }, delay);

    // Cleanup: annule la validation si l'utilisateur tape à nouveau
    return () => clearTimeout(timer);
  }, [field.value, field.touched, validator, setField, delay]);
};

/**
 * Validators prêts à l'emploi
 */

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { valid: false, error: "L'email est requis" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Format d'email invalide" };
  }

  // Vérifications supplémentaires
  if (email.length > 254) {
    return { valid: false, error: "L'email est trop long" };
  }

  const [local, domain] = email.split('@');
  if (local.length > 64) {
    return { valid: false, error: "L'email est invalide" };
  }

  // Check for common typos
  const commonTypos = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com'];
  if (commonTypos.some(typo => domain.includes(typo))) {
    return { valid: false, error: "Vérifiez l'orthographe de votre email" };
  }

  return { valid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { valid: false, error: 'Le numéro de téléphone est requis' };
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // French phone numbers: 10 digits starting with 0, or +33 followed by 9 digits
  const frenchPhoneRegex = /^(?:(?:\+33|0)[1-9]\d{8})$/;
  const frenchPhoneWithSpaces = /^(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}$/;

  if (cleaned.length < 10) {
    return { valid: false, error: 'Numéro trop court (10 chiffres minimum)' };
  }

  if (cleaned.length > 13) {
    return { valid: false, error: 'Numéro trop long' };
  }

  if (!frenchPhoneRegex.test(cleaned) && !frenchPhoneWithSpaces.test(phone)) {
    return { valid: false, error: 'Format invalide (ex: 06 12 34 56 78)' };
  }

  return { valid: true };
};

export const validateName = (name: string, fieldName = 'Ce champ'): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: `${fieldName} est requis` };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} doit contenir au moins 2 caractères` };
  }

  if (name.length > 50) {
    return { valid: false, error: `${fieldName} est trop long` };
  }

  // Allow letters, spaces, hyphens, apostrophes (for international names)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { valid: false, error: 'Caractères invalides détectés' };
  }

  return { valid: true };
};

/**
 * Format automatique du numéro de téléphone français
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');

  // Format français: 06 12 34 56 78
  if (cleaned.startsWith('0') && cleaned.length <= 10) {
    const match = cleaned.match(/^(\d{2})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4], match[5]]
        .filter(Boolean)
        .join(' ');
    }
  }

  // Format international: +33 6 12 34 56 78
  if (cleaned.startsWith('33') && cleaned.length <= 11) {
    const match = cleaned.match(/^(\d{2})(\d{1})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);
    if (match) {
      return ['+' + match[1], match[2], match[3], match[4], match[5], match[6]]
        .filter(Boolean)
        .join(' ');
    }
  }

  return value;
};
