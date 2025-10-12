import { useState, useEffect, FormEvent } from 'react';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe, Appearance, StripeElementsOptions } from '@stripe/stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader2, Lock, Sparkles } from 'lucide-react';
import { FloatingInput } from './FloatingInput';
import { ExpressPaymentSection } from './ExpressPaymentSection';
import { ProductSummaryHeader } from './ProductSummaryHeader';
import {
  FieldState,
  useValidationDebounce,
  validateEmail,
  validatePhone,
  formatPhoneNumber,
} from '../../hooks/useValidationDebounce';
import ProductOrderService from '../../services/productOrder';
import { cn } from '../../lib/utils';
import { validateStripeKey } from '../../utils/api';

// Initialize Stripe (robust key resolution + validation)
const stripePromise = loadStripe(validateStripeKey());

// Stripe Appearance Config - Match Mystical Theme
const stripeAppearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#D4AF37',
    colorBackground: 'rgba(15, 11, 25, 0.4)',
    colorText: '#ffffff',
    colorDanger: '#ef4444',
    colorSuccess: '#10b981',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSizeBase: '16px',
    fontWeightNormal: '400',
    fontWeightMedium: '500',
    spacingUnit: '4px',
    spacingGridRow: '16px',
    spacingGridColumn: '16px',
    borderRadius: '12px',
    focusBoxShadow: '0 0 0 2px rgba(212, 175, 55, 0.3)',
    focusOutline: 'none',
  },
  rules: {
    '.Input': {
      backgroundColor: 'rgba(15, 11, 25, 0.4)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(212, 175, 55, 0.4)',
      padding: '24px 16px 8px 16px',
      fontSize: '16px',
      lineHeight: '1.5',
      color: '#ffffff',
      boxShadow: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    '.Input:hover': {
      borderColor: 'rgba(212, 175, 55, 0.6)',
    },
    '.Input:focus': {
      borderColor: '#D4AF37',
      boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.3)',
      outline: 'none',
    },
    '.Input--invalid': {
      borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    '.Input--invalid:focus': {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.3)',
    },
    '.Label': {
      fontSize: '12px',
      fontWeight: '500',
      color: '#D4AF37',
      marginBottom: '0',
      textTransform: 'none',
      letterSpacing: '0.025em',
    },
    '.Tab': {
      backgroundColor: 'rgba(15, 11, 25, 0.6)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '8px',
      color: '#9CA3AF',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    '.Tab:hover': {
      backgroundColor: 'rgba(212, 175, 55, 0.05)',
      borderColor: 'rgba(212, 175, 55, 0.5)',
    },
    '.Tab--selected': {
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      borderColor: '#D4AF37',
      color: '#D4AF37',
      boxShadow: '0 0 8px rgba(212, 175, 55, 0.2)',
    },
    '.TabIcon--selected': {
      fill: '#D4AF37',
    },
    '.Error': {
      color: '#ef4444',
      fontSize: '12px',
      marginTop: '4px',
    },
  },
};

interface UnifiedCheckoutFormProps {
  productId: string;
  productName: string;
  amountCents: number;
  features: string[];
  onSuccess: (orderId: string, email: string) => void;
}

/**
 * CheckoutFormInner - Formulaire Stripe avec PaymentElement
 * Séparé du wrapper pour avoir accès aux hooks Stripe
 */
interface CheckoutFormInnerProps {
  clientSecret: string;
  orderId: string;
  email: FieldState;
  phone: FieldState;
  firstName: string;
  lastName: string;
  amount: number;
  onSuccess: (orderId: string, email: string) => void;
}

const CheckoutFormInner = ({
  clientSecret,
  orderId,
  email,
  phone,
  firstName,
  lastName,
  amount,
  onSuccess,
}: CheckoutFormInnerProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isFormValid =
    email.valid &&
    phone.valid &&
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isFormValid || !clientSecret) {
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      if (orderId) {
        try {
          await ProductOrderService.updateOrderCustomer(orderId, {
            email: email.value,
            phone: phone.value.replace(/\D/g, ''),
            firstName,
            lastName,
          });
        } catch (updateError) {
          console.error('Failed to update order with customer info:', updateError);
          setPaymentError(
            "Impossible d'enregistrer vos informations. Veuillez réessayer."
          );
          setProcessing(false);
          return;
        }
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            billing_details: {
              name: `${firstName} ${lastName}`,
              email: email.value,
              phone: phone.value,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(
          error.message || 'Une erreur est survenue lors du paiement'
        );
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect
        onSuccess(orderId, email.value);
      }
    } catch (err) {
      setPaymentError('Une erreur inattendue est survenue');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Element */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 tracking-wide">
          Informations de paiement
        </label>
        <div className="relative">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence mode="wait">
        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-red-500/10 border border-red-500/50 rounded-xl p-4"
          >
            <p className="text-red-400 text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {paymentError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={processing || !isFormValid || !stripe || !clientSecret}
        whileHover={{ scale: processing ? 1 : 1.02 }}
        whileTap={{ scale: processing ? 1 : 0.98 }}
        className={cn(
          'w-full py-4 rounded-xl font-bold text-lg',
          'bg-gradient-to-r from-[#D4AF37] to-[#DAA520]',
          'text-[#0F0B19] shadow-lg',
          'transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'relative overflow-hidden'
        )}
      >
        {/* Shimmer Effect */}
        {!processing && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-200%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        <span className="relative z-10 flex items-center justify-center gap-2">
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Paiement en cours...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Payer {(amount / 100).toFixed(2)} €
            </>
          )}
        </span>
      </motion.button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-400/80 space-y-1">
        <p className="flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-mystical-gold" />
          Paiement 100% sécurisé par Stripe
        </p>
        <p className="text-xs">
          Vos données bancaires sont chiffrées et ne transitent jamais par nos serveurs
        </p>
      </div>
    </form>
  );
};

/**
 * UnifiedCheckoutForm - Composant Principal
 * 
 * Architecture 2025:
 * 1. Product Summary compact
 * 2. Express Payments (Apple/Google Pay) EN PREMIER
 * 3. Divider "ou payer par carte"
 * 4. Formulaire unifié (email → phone → name → payment)
 * 5. Validation temps réel avec floating labels
 */
export const UnifiedCheckoutForm = ({
  productId,
  productName,
  amountCents,
  features,
  onSuccess,
}: UnifiedCheckoutFormProps) => {
  // PaymentIntent state
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // Form fields with validation state
  const [email, setEmail] = useState<FieldState>({
    value: '',
    touched: false,
    error: null,
    valid: false,
  });

  const [phone, setPhone] = useState<FieldState>({
    value: '',
    touched: false,
    error: null,
    valid: false,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Validation hooks with debounce
  useValidationDebounce(email, setEmail, validateEmail, 300);
  useValidationDebounce(phone, setPhone, validatePhone, 300);

  // Initialize PaymentIntent (or retry on demand)
  useEffect(() => {
    let isCancelled = false;

    const initPaymentIntent = async () => {
      if (!productId) {
        setClientSecret('');
        setOrderId('');
        setLoading(false);
        setIntentError('Produit invalide.');
        return;
      }

      setLoading(true);
      setIntentError(null);
      setClientSecret('');
      setOrderId('');

      try {
        const result = await ProductOrderService.createPaymentIntent(productId);

        if (isCancelled) {
          return;
        }

        setClientSecret(result.clientSecret);
        setOrderId(result.orderId);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('Failed to create PaymentIntent:', error);
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Impossible d'initialiser le paiement pour le moment.";
        setIntentError(message);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    initPaymentIntent();

    return () => {
      isCancelled = true;
    };
  }, [productId, retryNonce]);

  const handleRetry = () => {
    setLoading(true);
    setIntentError(null);
    setRetryNonce((prev) => prev + 1);
  };

  // Note: Customer info will be sent with the payment confirmation

  // Stripe Elements options
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: stripeAppearance,
    locale: 'fr',
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="space-y-6 animate-pulse">
          {/* Product Summary Skeleton */}
          <div className="bg-gray-700/50 rounded-xl p-6 space-y-4">
            <div className="h-6 bg-gray-600/50 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600/50 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-600/50 rounded"></div>
              <div className="h-3 bg-gray-600/50 rounded w-5/6"></div>
            </div>
          </div>
          
          {/* Form Skeleton */}
          <div className="bg-gray-700/50 rounded-xl p-6 space-y-4">
            <div className="h-4 bg-gray-600/50 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-600/50 rounded-xl"></div>
              <div className="h-12 bg-gray-600/50 rounded-xl"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-600/50 rounded-xl"></div>
                <div className="h-12 bg-gray-600/50 rounded-xl"></div>
              </div>
              <div className="h-20 bg-gray-600/50 rounded-xl"></div>
              <div className="h-12 bg-gray-600/50 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && intentError) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <ProductSummaryHeader
          name={productName}
          amount={amountCents}
          features={features}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-500/10 border border-red-500/40 rounded-2xl p-6 backdrop-blur-md"
        >
          <div className="flex items-start gap-4 text-red-200">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white/90">
                Impossible d'initialiser le paiement
              </h3>
              <p className="text-sm text-red-100/90 leading-relaxed">
                {intentError}
              </p>
              <p className="text-xs text-red-100/70">
                Vérifiez votre connexion internet, puis réessayez. Si le problème persiste, contactez le support Oracle Lumira.
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            onClick={handleRetry}
            disabled={loading}
            className={cn(
              'mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold',
              'bg-gradient-to-r from-[#D4AF37] to-[#DAA520]',
              'text-[#0F0B19] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Loader2 className={cn('w-4 h-4', loading ? 'animate-spin' : '')} />
            Réessayer
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Product Summary Header */}
      <ProductSummaryHeader
        name={productName}
        amount={amountCents}
        features={features}
      />

      {/* Express Payment Section (Priority) */}
      {clientSecret && (
        <Elements stripe={stripePromise} options={elementsOptions}>
          <ExpressPaymentSection
            clientSecret={clientSecret}
            orderId={orderId}
            amount={amountCents}
            onSuccess={onSuccess}
          />
        </Elements>
      )}

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-mystical-gold/30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0A0514] text-gray-400 tracking-wide">
            ou payer par carte bancaire
          </span>
        </div>
      </div>

      {/* Unified Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gradient-to-br from-mystical-night/60 to-mystical-purple/40 backdrop-blur-md border border-mystical-gold/40 rounded-2xl p-6 shadow-spiritual relative overflow-hidden"
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-mystical-gold/4 to-mystical-sage/4 rounded-2xl"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative z-10 space-y-5">
          <h3 className="text-xl font-bold text-white/95 mb-6 tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-mystical-gold" />
            Informations de paiement
          </h3>

          {/* Email Field (First - Less intimidating) */}
          <FloatingInput
            id="email"
            type="email"
            label="Adresse email"
            value={email.value}
            onChange={(e) =>
              setEmail((prev) => ({
                ...prev,
                value: e.target.value,
                touched: true,
              }))
            }
            error={email.error}
            valid={email.valid}
            required
            autoComplete="email"
          />

          {/* Phone Field */}
          <FloatingInput
            id="phone"
            type="tel"
            label="Numéro de téléphone"
            value={phone.value}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setPhone((prev) => ({
                ...prev,
                value: formatted,
                touched: true,
              }));
            }}
            error={phone.error}
            valid={phone.valid}
            required
            placeholder="06 12 34 56 78"
            autoComplete="tel"
          />

          {/* Name Fields (Inline Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput
              id="firstName"
              type="text"
              label="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
            <FloatingInput
              id="lastName"
              type="text"
              label="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

          {/* Stripe Payment Element */}
          {clientSecret && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CheckoutFormInner
                clientSecret={clientSecret}
                orderId={orderId}
                email={email}
                phone={phone}
                firstName={firstName}
                lastName={lastName}
                amount={amountCents}
                onSuccess={onSuccess}
              />
            </Elements>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Skeleton Loading Component
 */
const CheckoutSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Product summary skeleton */}
    <div className="h-32 bg-mystical-night/40 rounded-2xl border border-mystical-gold/20" />

    {/* Express payment skeleton */}
    <div className="h-14 bg-mystical-gold/10 rounded-xl" />

    {/* Divider */}
    <div className="h-px bg-mystical-gold/30 my-6" />

    {/* Form fields skeleton */}
    {[1, 2].map((i) => (
      <div
        key={i}
        className="h-16 bg-mystical-night/40 rounded-xl border border-mystical-gold/20"
      />
    ))}

    {/* Name grid skeleton */}
    <div className="grid grid-cols-2 gap-4">
      <div className="h-16 bg-mystical-night/40 rounded-xl border border-mystical-gold/20" />
      <div className="h-16 bg-mystical-night/40 rounded-xl border border-mystical-gold/20" />
    </div>

    {/* Payment element skeleton */}
    <div className="h-32 bg-mystical-night/40 rounded-xl border border-mystical-gold/20" />

    {/* Submit button skeleton */}
    <div className="h-14 bg-gradient-to-r from-mystical-gold/30 to-cosmic-gold/30 rounded-xl" />
  </div>
);

export default UnifiedCheckoutForm;
