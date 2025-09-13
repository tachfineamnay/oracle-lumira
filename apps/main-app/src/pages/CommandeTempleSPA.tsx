// Oracle Lumira - Commande SPA avec Stripe Elements
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Loader, AlertCircle, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { 
  Elements, 
  PaymentElement, 
  PaymentRequestButtonElement,
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import type { Product } from '../types/products';
import ProductOrderService from '../services/productOrder';
import { validateStripeKey } from '../utils/api';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';
import SpiritualWaves from '../components/SpiritualWaves';

// Stripe initialization with validation
let stripePromise: Promise<any> | null = null;

  try {
  const stripeKey = validateStripeKey();
  stripePromise = loadStripe(stripeKey);
  console.log('Stripe initialized successfully');
  } catch (error) {
  console.error('Stripe initialization failed:', error);
  stripePromise = null;
  }

// Stripe appearance customization (mystical theme)
const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#D4AF37', // mystical gold
    colorBackground: '#0F0B19', // mystical dark
    colorText: '#E5E7EB', // light text
    colorDanger: '#EF4444',
    borderRadius: '12px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  rules: {
    '.Input': {
      backgroundColor: 'rgba(15, 11, 25, 0.8)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
    },
    '.Input:focus': {
      borderColor: '#D4AF37',
      boxShadow: '0 0 0 1px #D4AF37',
    },
    '.Tab': {
      backgroundColor: 'rgba(15, 11, 25, 0.5)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
    },
    '.Tab:hover': {
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
    },
    '.Tab--selected': {
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      borderColor: '#D4AF37',
    },
  },
};

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  productName: string;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  clientSecret,
  orderId, 
  amount, 
  productName,
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  // Initialize Payment Request Button (Apple Pay, Google Pay, etc.)
  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'FR',
      currency: 'eur',
      total: {
        label: productName,
        amount: amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });

    pr.on('paymentmethod', async (event) => {
      try {
        // Create PaymentIntent for Payment Request
        const { error: confirmError } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method: event.paymentMethod.id,
            return_url: `${window.location.origin}/confirmation?order_id=${orderId}`,
          },
          redirect: 'if_required'
        });

        if (confirmError) {
          event.complete('fail');
          setErrorMessage(confirmError.message || 'Erreur lors du paiement express');
        } else {
          event.complete('success');
          onSuccess();
        }
      } catch (error) {
        event.complete('fail');
        setErrorMessage('Erreur lors du paiement express');
        console.error('Payment Request error:', error);
      }
    });
  }, [stripe, amount, productName, clientSecret, orderId, onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const returnUrl = `${window.location.origin}/confirmation?order_id=${orderId}`;
      
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || 'Une erreur est survenue lors du paiement');
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Request Button (Apple Pay, Google Pay) */}
      {paymentRequest && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center mb-4 space-x-2 text-mystical-gold">
            <Smartphone className="w-5 h-5" />
            <span className="text-sm font-medium">Paiement express</span>
          </div>
          <PaymentRequestButtonElement 
            options={{ 
              paymentRequest,
              style: {
                paymentRequestButton: {
                  theme: 'dark',
                  height: '48px',
                  type: 'default',
                },
              },
            }} 
          />
          <div className="mt-4 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-mystical-gold/30 to-transparent"></div>
            <span className="px-4 text-sm text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-mystical-gold/30 to-transparent"></div>
          </div>
        </motion.div>
      )}

      {/* Traditional Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-2 text-mystical-gold mb-4">
          <CreditCard className="w-5 h-5" />
          <span className="font-medium">Informations de paiement</span>
        </div>

        <PaymentElement 
          options={{
            layout: 'tabs',
            business: {
              name: 'Oracle Lumira',
            },
          }}
        />

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/30"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{errorMessage}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="w-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-mystical-gold/50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Traitement en cours...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Confirmer le paiement • {ProductOrderService.formatPrice(amount)}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const CommandeTemple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');
  
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [paymentAmountCents, setPaymentAmountCents] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [catalog, setCatalog] = useState<Product[] | null>(null);
  const product = productId && catalog ? catalog.find(p => p.id === productId) || null : null;

  // Charger le catalogue produits depuis l'API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await ProductOrderService.getCatalog();
        if (!mounted) return;
        setCatalog(list);
      } catch (e) {
        console.error('Failed to load catalog:', e);
        if (!mounted) return;
        setError('Impossible de charger le catalogue produits');
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!catalog) { return; }
    if (!productId || !product) {
      setError('Produit non trouvé');
      setIsLoading(false);
      return;
    }

    const initializePayment = async () => {
      try {
        const paymentData = await ProductOrderService.createPaymentIntent(
          productId,
          customerEmail || undefined
        );

        setClientSecret(paymentData.clientSecret);
        setOrderId(paymentData.orderId);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize payment:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'initialisation du paiement');
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [productId, product, customerEmail, catalog]);

  const handlePaymentSuccess = () => {
    navigate(`/confirmation?order_id=${orderId}`);
  };

  const handleBackToLevels = () => {
    navigate('/#niveaux');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mystical-cream via-mystical-pearl to-mystical-mist flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader className="w-8 h-8 text-mystical-copper animate-spin" />
          <p className="text-mystical-night">Préparation de votre commande...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mystical-cream via-mystical-pearl to-mystical-mist flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md p-8 text-center space-y-4"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-mystical-night">Erreur</h2>
          <p className="text-mystical-night/70">{error || 'Produit non trouvé'}</p>
          <button
            onClick={handleBackToLevels}
            className="bg-mystical-gold text-mystical-night px-6 py-3 rounded-lg font-semibold hover:bg-mystical-champagne transition-colors"
          >
            Retour aux niveaux
          </button>
        </motion.div>
      </div>
    );
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: stripeAppearance,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-deep via-mystical-night to-mystical-shadow relative overflow-hidden">
      {/* Ondulations spirituelles pour les pages sombres */}
      <SpiritualWaves intensity="subtle" />
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 pt-8 relative z-10">
          <button
            onClick={handleBackToLevels}
            className="flex items-center space-x-2 text-mystical-gold/90 hover:text-mystical-radiance transition-colors duration-500"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="tracking-wide">Retour</span>
          </button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-mystical-gold via-mystical-radiance to-mystical-luminous bg-clip-text text-transparent tracking-wide">
            Oracle Lumira - Commande
          </h1>
          
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
          {/* Product Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-mystical-night/60 to-mystical-purple/40 backdrop-blur-md border border-mystical-gold/40 rounded-2xl p-6 shadow-spiritual relative overflow-hidden">
              {/* Ondulation de résumé produit */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-mystical-gold/5 to-mystical-water/5 rounded-2xl"
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <div className="flex items-start space-x-4">
                <motion.div 
                  className="p-3 bg-mystical-gold/25 rounded-lg shadow-harmony relative z-10"
                  animate={{
                    boxShadow: [
                      '0 4px 24px rgba(156, 175, 136, 0.08)',
                      '0 6px 30px rgba(156, 175, 136, 0.12)',
                      '0 4px 24px rgba(156, 175, 136, 0.08)',
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ShoppingBag className="w-6 h-6 text-mystical-gold" />
                </motion.div>
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-bold text-white/95 mb-2 tracking-wide">{product.name}</h3>
                  <p className="text-gray-300/90 mb-4 tracking-wide leading-relaxed">{product.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400/90 tracking-wide">Prix</span>
                      <span className="text-2xl font-bold text-mystical-gold/95">{ProductOrderService.formatPrice(product.amountCents, product.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400/90 tracking-wide">Durée</span>
                      <span className="text-white/95 tracking-wide">{product.metadata.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-mystical-night/60 to-mystical-purple/40 backdrop-blur-md border border-mystical-gold/40 rounded-2xl p-6 shadow-spiritual relative overflow-hidden">
              {/* Ondulation des fonctionnalités */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-mystical-gold/4 to-mystical-water/4 rounded-2xl"
                animate={{
                  opacity: [0, 0.5, 0],
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              <h4 className="font-bold text-white/95 mb-4 tracking-wide relative z-10">Ce qui est inclus :</h4>
              <div className="space-y-3">
                {product.features.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start space-x-3 relative z-10"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3,
                      }}
                    >
                      <CheckCircle className="w-5 h-5 text-mystical-gold/90 flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="text-gray-300/90 tracking-wide">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-mystical-night/60 to-mystical-purple/40 backdrop-blur-md border border-mystical-gold/40 rounded-2xl p-6 shadow-spiritual relative overflow-hidden">
              {/* Ondulation de formulaire de paiement */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-mystical-gold/4 to-mystical-harmony/4 rounded-2xl"
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
              
              <h3 className="text-xl font-bold text-white/95 mb-6 tracking-wide relative z-10">Finaliser votre commande</h3>
              
              {/* Email Input */}
              <div className="mb-6 relative z-10">
                <label className="block text-sm font-medium text-gray-300/90 mb-2 tracking-wide">
                  Adresse email (optionnel)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 bg-mystical-deep/80 border border-mystical-gold/40 rounded-lg text-white/95 placeholder-gray-500/80 focus:border-mystical-radiance focus:outline-none focus:ring-2 focus:ring-mystical-gold/30 transition-all duration-500 tracking-wide"
                />
                <p className="text-xs text-gray-400/80 mt-1 tracking-wide">
                  Pour recevoir votre confirmation et vos accès
                </p>
              </div>

              {/* Stripe Elements */}
              {clientSecret && (
                <div className="relative z-10">
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    orderId={orderId}
                    productName={product.name}
                    amount={product.amountCents}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="text-center text-sm text-gray-400/80 space-y-2 relative z-10">
              <p>🔒 Paiement sécurisé par Stripe</p>
              <p className="tracking-wide">Vos données bancaires sont chiffrées et protégées</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommandeTemple;
