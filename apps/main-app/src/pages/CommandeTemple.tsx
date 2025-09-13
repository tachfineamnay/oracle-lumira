import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { validateStripeKey } from '../utils/api';
import { stripeAPI } from '../api/stripe';

// Stripe initialization with validation (aligned with SPA)
let stripePromise: Promise<any> | null = null;
try {
  const stripeKey = validateStripeKey();
  stripePromise = loadStripe(stripeKey);
} catch (error) {
  console.error('Stripe initialization failed:', error);
  stripePromise = null;
}

type CheckoutFormProps = {
  orderId: string;
  amount: number;
  onSuccess: () => void;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ orderId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const returnUrl = `${window.location.origin}/confirmation?order_id=${orderId}`;
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required',
      });
      if (error) {
        setErrorMessage(error.message || 'Erreur lors du paiement');
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 bg-mystical-deep-blue/80 border border-mystical-gold/30 rounded-lg">
        <PaymentElement />
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start space-x-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/30"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-mystical-gold/40 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin mr-2" />
            Traitement en cours...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2" size={20} />
            Finaliser le paiement ({stripeAPI.formatPrice(amount)})
          </>
        )}
      </button>
    </form>
  );
};

const CommandeTemple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showCart, setShowCart] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // URL params
  const level = searchParams.get('level');
  const service = searchParams.get('service');
  const expert = searchParams.get('expert') || 'Expert Lumira';
  const expertId = searchParams.get('expertId') || '674123456789abcdef012345';

  // Services
  const serviceConfig = stripeAPI.getServiceConfig();
  const currentService = service && stripeAPI.isValidService(service) ? serviceConfig[service] : null;

  useEffect(() => {
    const initialize = async () => {
      if (!level || !service || !currentService) {
        setInitError('Parametres de commande manquants');
        setIsInitializing(false);
        return;
      }
      try {
        const res = await stripeAPI.createPaymentIntent({
          level,
          service: service as 'basic' | 'premium' | 'vip',
          expertId,
          customerEmail: 'client@example.com',
          customerName: 'Client Test',
        });
        setClientSecret(res.clientSecret);
        setOrderId(res.orderId);
      } catch (e) {
        console.error('Failed to initialize payment:', e);
        setInitError(e instanceof Error ? e.message : "Echec de l'initialisation du paiement");
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [level, service, expertId, currentService]);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      if (orderId) navigate(`/confirmation?order_id=${orderId}`);
    }, 1500);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mystical-abyss via-mystical-midnight to-mystical-deep-blue flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 text-mystical-gold animate-spin" />
          <p className="text-mystical-night">Preparation de votre commande...</p>
        </motion.div>
      </div>
    );
  }

  if (initError || !level || !service || !expert || !currentService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mystical-abyss via-mystical-midnight to-mystical-deep-blue flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-mystical-night">Erreur de configuration</h2>
          <p className="text-mystical-night/70">{initError || 'Parametres manquants'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-mystical-gold text-mystical-abyss px-6 py-3 rounded-lg font-semibold hover:bg-mystical-gold-light transition-colors"
          >
            Retour
          </button>
        </motion.div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mystical-deep via-mystical-night to-mystical-shadow flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center text-white/95">
          <CheckCircle className="mx-auto mb-4 text-mystical-gold/95" size={64} />
          <h2 className="text-3xl font-bold mb-2">Paiement reussi</h2>
          <p className="text-white/80">Redirection vers la page de confirmation...</p>
        </motion.div>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret: clientSecret!,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#D4AF37',
        colorBackground: '#0F0B19',
        colorText: '#E5E7EB',
        colorDanger: '#EF4444',
        borderRadius: '12px',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      rules: {
        '.Input': {
          backgroundColor: 'rgba(15, 11, 25, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        },
        '.Input:focus': {
          borderColor: '#D4AF37',
          boxShadow: '0 0 0 1px #D4AF37'
        },
        '.Tab': {
          backgroundColor: 'rgba(15, 11, 25, 0.5)',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        },
        '.Tab:hover': {
          backgroundColor: 'rgba(212, 175, 55, 0.1)'
        },
        '.Tab--selected': {
          backgroundColor: 'rgba(212, 175, 55, 0.2)',
          borderColor: '#D4AF37'
        }
      }
    }
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-deep via-mystical-night to-mystical-shadow">
      {/* Header */}
      <header className="bg-mystical-midnight/60 backdrop-blur-lg border-b border-mystical-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-mystical-gold/90 hover:text-mystical-radiance transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Retour
            </button>

            <h1 className="text-xl font-bold text-white/95">Finaliser votre commande</h1>

            <button
              onClick={() => setShowCart(!showCart)}
              className="flex items-center text-mystical-gold/90 hover:text-mystical-radiance transition-colors"
            >
              <ShoppingBag size={20} className="mr-2" />
              Panier
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recap */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-mystical-midnight/60 to-mystical-purple/40 backdrop-blur-md border border-mystical-gold/40 rounded-2xl p-6 shadow-forest"
            >
              <h2 className="text-2xl font-bold text-white/95 mb-6">Recapitulatif</h2>

              <div className="space-y-4">
                <div className="border-b border-mystical-gold/20 pb-4">
                  <h3 className="text-lg font-semibold text-white/95">{currentService.name}</h3>
                  <p className="text-gray-300/90">Duree: {currentService.duration} min</p>
                  <p className="text-gray-300/90">Expert: {expert}</p>
                  <p className="text-gray-300/90">Niveau: {stripeAPI.getLevelDisplayName(level)}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white/95">Inclus dans cette consultation:</h4>
                  <ul className="space-y-1">
                    {currentService.features.map((feature, index) => (
                      <li key={index} className="text-gray-300/90 text-sm flex items-start">
                        <span className="mr-2 text-mystical-gold/90">V</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-mystical-gold/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/95 font-semibold">Total</span>
                    <span className="text-2xl font-bold text-mystical-gold/95">
                      {stripeAPI.formatPrice(currentService.price)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-mystical-midnight/60 to-mystical-purple/40 backdrop-blur-md border border-mystical-gold/40 rounded-2xl p-6 shadow-forest"
            >
              <h2 className="text-2xl font-bold text-white/95 mb-6">Paiement securise</h2>

              {clientSecret && orderId && stripePromise && (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <CheckoutForm
                    orderId={orderId}
                    amount={currentService.price}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-300/90 text-sm flex items-center justify-center">
                  <span className="mr-2">💳</span>
                  Paiement 100% securise avec Stripe
                </p>
                <p className="text-gray-400/80 text-xs mt-2">
                  Vos donnees sont protegees par un chiffrement SSL
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Panier</h3>
                  <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="font-semibold">{currentService.name}</h4>
                    <p className="text-gray-600 text-sm">Expert: {expert}</p>
                    <p className="text-gray-600 text-sm">Duree: {currentService.duration} min</p>
                    <p className="text-gray-600 text-sm">Niveau: {stripeAPI.getLevelDisplayName(level)}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Prix:</span>
                      <span className="font-semibold">{stripeAPI.formatPrice(currentService.price)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>{stripeAPI.formatPrice(currentService.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandeTemple;
