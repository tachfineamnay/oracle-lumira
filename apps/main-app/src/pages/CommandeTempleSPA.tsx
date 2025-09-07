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
import { PRODUCT_CATALOG } from '../types/products';
import ProductOrderService from '../services/productOrder';

// Stripe public key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

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
      const { error } = await stripe.confirmPayment({
        clientSecret,
        payment_method: event.paymentMethod.id,
        return_url: `${window.location.origin}/confirmation?order_id=${orderId}`,
      });

      if (error) {
        event.complete('fail');
        setErrorMessage(error.message || 'Erreur lors du paiement express');
      } else {
        event.complete('success');
        onSuccess();
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');

  const product = productId ? PRODUCT_CATALOG[productId] : null;

  useEffect(() => {
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
  }, [productId, product, customerEmail]);

  const handlePaymentSuccess = () => {
    navigate(`/confirmation?order_id=${orderId}`);
  };

  const handleBackToLevels = () => {
    navigate('/#niveaux');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mystical-dark via-mystical-purple to-mystical-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <Loader className="w-8 h-8 text-mystical-gold animate-spin" />
          <p className="text-mystical-gold">Préparation de votre commande...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mystical-dark via-mystical-purple to-mystical-dark flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md p-8 text-center space-y-4"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Erreur</h2>
          <p className="text-gray-300">{error || 'Produit non trouvé'}</p>
          <button
            onClick={handleBackToLevels}
            className="bg-mystical-gold text-mystical-dark px-6 py-3 rounded-lg font-semibold hover:bg-mystical-gold-light transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-mystical-dark via-mystical-purple to-mystical-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToLevels}
            className="flex items-center space-x-2 text-mystical-gold hover:text-mystical-gold-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-mystical-gold to-mystical-gold-light bg-clip-text text-transparent">
            Oracle Lumira - Commande
          </h1>
          
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Product Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-mystical-dark/50 to-mystical-purple/30 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-mystical-gold/20 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-mystical-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-300 mb-4">{product.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Prix</span>
                      <span className="text-2xl font-bold text-mystical-gold">{product.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Durée</span>
                      <span className="text-white">{product.metadata.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-mystical-dark/50 to-mystical-purple/30 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
              <h4 className="font-bold text-white mb-4">Ce qui est inclus :</h4>
              <div className="space-y-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-mystical-gold flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-mystical-dark/50 to-mystical-purple/30 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Finaliser votre commande</h3>
              
              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse email (optionnel)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 bg-mystical-dark/80 border border-mystical-gold/30 rounded-lg text-white placeholder-gray-500 focus:border-mystical-gold focus:outline-none focus:ring-1 focus:ring-mystical-gold"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Pour recevoir votre confirmation et vos accès
                </p>
              </div>

              {/* Stripe Elements */}
              {clientSecret && (
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    orderId={orderId}
                    amount={parseInt(product.price.replace('€', '')) * 100} // Convert to cents
                    productName={product.name}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}
            </div>

            {/* Security Notice */}
            <div className="text-center text-sm text-gray-400 space-y-2">
              <p>🔒 Paiement sécurisé par Stripe</p>
              <p>Vos données bancaires sont chiffrées et protégées</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommandeTemple;
