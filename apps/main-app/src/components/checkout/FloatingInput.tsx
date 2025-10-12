import { InputHTMLAttributes, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  valid?: boolean;
  icon?: React.ReactNode;
}

/**
 * FloatingInput Component - Modern 2025 UX Pattern
 * 
 * Features:
 * - Label flotte vers le haut au focus ou quand champ rempli
 * - Validation visuelle en temps réel (border + icon)
 * - Animations fluides Framer Motion
 * - Accessible (ARIA labels, keyboard nav)
 * - Match le style mystique de l'app
 */
export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, value, error, valid, icon, className, required, ...props }, ref) => {
    const hasValue = Boolean(value);
    const showFloatingLabel = hasValue || props.placeholder;

    return (
      <div className="relative">
        {/* Input Field */}
        <input
          ref={ref}
          {...props}
          value={value}
          className={cn(
            // Base styles - Match Stripe Elements appearance
            'peer w-full px-4 pt-6 pb-2',
            'bg-[#0F0B19] backdrop-blur-sm',
            'border border-[#D4AF37]/30 rounded-xl',
            'text-gray-100 text-base',
            'placeholder-transparent',
            'transition-all duration-300 ease-out',

            // Focus states
            'focus:border-[#D4AF37] focus:outline-none',
            'focus:ring-2 focus:ring-[#D4AF37]/30',

            // Hover state
            'hover:border-[#D4AF37]/60',

            // Validation states
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30',
            valid && 'border-green-500/50 focus:border-green-500 focus:ring-green-500/30',

            // Icon padding
            (icon || valid || error) && 'pr-12',

            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
        />

        {/* Floating Label */}
        <label
          htmlFor={props.id}
          className={cn(
            'absolute left-4 top-4',
            'text-gray-400 text-base',
            'transition-all duration-200 ease-out',
            'pointer-events-none select-none',
            'tracking-wide',

            // Float up on focus or when has value
            'peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#D4AF37] peer-focus:font-medium',
            (hasValue || showFloatingLabel) && 'top-2 text-xs font-medium',

            // Validation colors when floating
            error && (hasValue || showFloatingLabel) && 'text-red-400',
            valid && (hasValue || showFloatingLabel) && 'text-green-500'
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {/* Custom Icon (if provided) */}
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Validation Icons (auto) */}
        {valid && !icon && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
          </motion.div>
        )}

        {error && !icon && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${props.id}-error`}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-red-400 mt-1.5 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success Hint (optional) */}
        {valid && !error && props.id === 'email' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-green-500/80 mt-1.5 flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            <span>Parfait ! Nous vous enverrons votre lecture ici.</span>
          </motion.p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
