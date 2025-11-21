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
    // Stripe Appearance API does not accept rgba() here; use hex/rgb/hsl only
    colorBackground: '#0F0B19',
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
    // Use a visible focus without rgba
    focusBoxShadow: '0 0 0 2px #D4AF37',
    focusOutline: 'none',
  },
  rules: {
    '.Input': {
      // Use solid background supported by Appearance rules
      backgroundColor: '#0F0B19',
      // backdropFilter is not supported by Stripe Appearance; remove it
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
  limitedOffer?: string;  // PASSAGE 26: Message offre limitee
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
      // ✨ Les données client sont DÉJÀ dans les métadonnées Stripe lors de la création du PaymentIntent
      // Plus besoin d'appeler updateOrderCustomer ici !
      console.log('👳 [CheckoutFormInner] Confirming payment with customer data already in Stripe metadata');

      // Confirm payment
      const successUrl = `${window.location.origin}/payment-success?orderId=${encodeURIComponent(
        orderId
      )}&email=${encodeURIComponent(email.value)}`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Propagate orderId and email so Confirmation can auto-auth Sanctuaire
          return_url: successUrl,
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

      console.log('💳 [CheckoutFormInner] Stripe response:', { error, paymentIntent });

      if (error) {
        console.error('❌ [CheckoutFormInner] Payment error:', error);
        setPaymentError(
          error.message || 'Une erreur est survenue lors du paiement'
        );
        setProcessing(false);
      } else if (paymentIntent) {
        console.log('✅ [CheckoutFormInner] PaymentIntent status:', paymentIntent.status);
        
        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Payment succeeded:', { orderId, email: email.value });
          onSuccess(orderId, email.value);
        } else if (paymentIntent.status === 'processing') {
          console.log('⏳ Payment processing, waiting for webhook...');
          // Le paiement est en cours de traitement (3D Secure, etc.)
          // Attendre quelques secondes puis rediriger
          setTimeout(() => {
            console.log('⏳ Payment still processing, redirecting to confirmation...');
            onSuccess(orderId, email.value);
          }, 2000);
        } else if (paymentIntent.status === 'requires_action') {
          console.log('⚠️ Payment requires additional action (3D Secure, etc.)');
          setPaymentError('Action supplémentaire requise. Veuillez suivre les instructions.');
          setProcessing(false);
        } else {
          console.log('⚠️ Unexpected payment status:', paymentIntent.status);
          setPaymentError(`Statut inattendu: ${paymentIntent.status}`);
          setProcessing(false);
        }
      } else {
        console.error('❌ [CheckoutFormInner] No error and no paymentIntent!');
        setProcessing(false);
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
  limitedOffer,  // PASSAGE 26
  onSuccess,
}: UnifiedCheckoutFormProps) => {
  // Détection produit gratuit
  const isFreeProduct = amountCents === 0;
  
  // PaymentIntent state
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [loading, setLoading] = useState(false); // ✨ Ne charge PLUS au montage
  const [intentError, setIntentError] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

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

  // ✨ NOUVELLE LOGIQUE : Créer PaymentIntent APRÈS validation formulaire
  const isFormValid =
    email.valid &&
    phone.valid &&
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2;

  const handleCreatePaymentIntent = async () => {
    if (!productId || !isFormValid) {
      setIntentError('Veuillez remplir tous les champs requis.');
      return;
    }

    // ✨ PRODUIT GRATUIT : Bypass complet Stripe, validation formulaire directe
    if (isFreeProduct) {
      console.log('🎁 [UnifiedCheckout] Free product - bypassing Stripe');
      setIsCreatingIntent(true);
      
      try {
        // Appeler backend pour créer la commande gratuite
        const result = await ProductOrderService.createPaymentIntent(
          productId,
          email.value,
          `${firstName} ${lastName}`.trim(),
          phone.value.replace(/\D/g, '')
        );
        
        console.log('✅ [UnifiedCheckout] Free order created:', result.orderId);
        setOrderId(result.orderId);
        setClientSecret(''); // Vide pour produit gratuit
        
        // Finaliser immédiatement sans Stripe
        setTimeout(() => {
          onSuccess(result.orderId, email.value);
        }, 500);
      } catch (error) {
        console.error('❌ [UnifiedCheckout] Failed to create free order:', error);
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Impossible de finaliser votre commande gratuite.";
        setIntentError(message);
      } finally {
        setIsCreatingIntent(false);
      }
      return;
    }

    // PRODUIT PAYANT : Logique normale Stripe
    setIsCreatingIntent(true);
    setIntentError(null);
    setClientSecret('');
    setOrderId('');

    try {
      console.log('🚀 [UnifiedCheckout] Creating PaymentIntent with customer data:', {
        email: email.value,
        name: `${firstName} ${lastName}`,
        phone: phone.value,
      });

      const result = await ProductOrderService.createPaymentIntent(
        productId,
        email.value,                          // ✅ Email
        `${firstName} ${lastName}`.trim(),    // ✅ Nom complet
        phone.value.replace(/\D/g, '')        // ✅ Téléphone (chiffres uniquement)
      );

      console.log('✅ [UnifiedCheckout] PaymentIntent created:', result.orderId);

      setClientSecret(result.clientSecret);
      setOrderId(result.orderId);
    } catch (error) {
      console.error('❌ [UnifiedCheckout] Failed to create PaymentIntent:', error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Impossible d'initialiser le paiement pour le moment.";
      setIntentError(message);
    } finally {
      setIsCreatingIntent(false);
    }
  };

  // ❌ SUPPRIMÉ: Auto-trigger qui validait prématurément le formulaire
  // L'utilisateur doit maintenant cliquer explicitement sur "Continuer" ou "Payer"
  // Cela évite la validation automatique quand il tape le 2e caractère du nom

  // Note: Customer info is NOW sent DURING PaymentIntent creation (not after)

  // Stripe Elements options
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: stripeAppearance,
    locale: 'fr',
  };

  if (loading || isCreatingIntent) {
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
            onClick={handleCreatePaymentIntent}
            disabled={isCreatingIntent}
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
        limitedOffer={limitedOffer}  // PASSAGE 26
      />

      {/* Express Payment Section (Priority) - Uniquement pour produits payants */}
      {!isFreeProduct && clientSecret && (
        <Elements stripe={stripePromise} options={elementsOptions}>
          <ExpressPaymentSection
            clientSecret={clientSecret}
            orderId={orderId}
            amount={amountCents}
            onSuccess={onSuccess}
          />
        </Elements>
      )}

      {/* Divider - Uniquement pour produits payants */}
      {!isFreeProduct && (
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
      )}

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
            {isFreeProduct ? 'Vos informations' : 'Informations de paiement'}
          </h3>

          {/* Message produit gratuit */}
          {isFreeProduct && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/40 rounded-xl p-4 mb-6 flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 text-sm font-medium">Produit gratuit</p>
                <p className="text-green-200/80 text-xs mt-1">
                  Aucune carte bancaire requise. Remplissez simplement vos informations pour accéder à votre lecture.
                </p>
              </div>
            </motion.div>
          )}

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

          {/* Bouton "Continuer" pour produits payants - Affiché AVANT le PaymentElement */}
          {!isFreeProduct && !clientSecret && (
            <motion.button
              type="button"
              onClick={handleCreatePaymentIntent}
              disabled={!isFormValid || isCreatingIntent}
              whileHover={{ scale: isFormValid && !isCreatingIntent ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid && !isCreatingIntent ? 0.98 : 1 }}
              className={cn(
                'w-full py-4 rounded-xl font-bold text-lg mt-2',
                'bg-gradient-to-r from-mystical-gold to-cosmic-gold',
                'text-mystical-night shadow-spiritual',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'relative overflow-hidden'
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isCreatingIntent ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Préparation du paiement...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Continuer vers le paiement
                  </>
                )}
              </span>
            </motion.button>
          )}

          {/* Stripe Payment Element - Uniquement pour produits payants */}
          {!isFreeProduct && clientSecret && (
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

          {/* Bouton de validation pour produit gratuit */}
          {isFreeProduct && (
            <div className="space-y-4 mt-6">
              <motion.button
                type="button"
                onClick={handleCreatePaymentIntent}
                disabled={!isFormValid || isCreatingIntent}
                whileHover={{ scale: isFormValid && !isCreatingIntent ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid && !isCreatingIntent ? 0.98 : 1 }}
                className={cn(
                  'w-full py-4 rounded-xl font-bold text-lg',
                  'bg-gradient-to-r from-green-600 to-green-500',
                  'text-white shadow-lg',
                  'transition-all duration-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'relative overflow-hidden'
                )}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isCreatingIntent ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Validation en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Valider ma commande gratuite
                    </>
                  )}
                </span>
              </motion.button>

              <p className="text-center text-xs text-gray-400">
                En validant, vous accédez immédiatement à votre lecture spirituelle gratuite.
              </p>
            </div>
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
