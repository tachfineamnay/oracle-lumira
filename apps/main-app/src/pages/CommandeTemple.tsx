import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeAPI } from '../api/stripe';

// Stripe public key
const stripePromise = loadStripe('pk_test_51S4LPjCyn6GQT2lZ7HLyNYqEWpqkg7rzytnjsymM6163eHBjXKxcYcHP32JCHkUzVhzb90hTyBQJJcU0fOBa6VGR00glO1kzek');

const CheckoutForm: React.FC<{ orderId: string; amount: number; onSuccess: () => void }> = ({ 
  orderId, 
  amount, 
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 border border-gray-200 rounded-lg">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start"
        >
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin mr-2" size={20} />
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
  
  // Get parameters from URL
  const level = searchParams.get('level');
  const service = searchParams.get('service');
  const expert = searchParams.get('expert') || 'Expert Lumira';
  const expertId = searchParams.get('expertId') || '674123456789abcdef012345'; // Default expert ID
  
  // Service configurations
  const serviceConfig = stripeAPI.getServiceConfig();
  const currentService = service && stripeAPI.isValidService(service) ? serviceConfig[service] : null;

  // Initialize payment intent
  useEffect(() => {
    const initializePayment = async () => {
      if (!level || !service || !currentService) {
        setInitError('Paramètres de commande manquants');
        setIsInitializing(false);
        return;
      }

      try {
        const response = await stripeAPI.createPaymentIntent({
          level,
          service: service as 'basic' | 'premium' | 'vip',
          expertId,
          customerEmail: 'client@example.com', // TODO: Get from user input or auth
          customerName: 'Client Test' // TODO: Get from user input or auth
        });

        setClientSecret(response.clientSecret);
        setOrderId(response.orderId);
      } catch (error) {
        console.error('Failed to initialize payment:', error);
        setInitError(error instanceof Error ? error.message : 'Échec de l\'initialisation du paiement');
      } finally {
        setIsInitializing(false);
      }
    };

    initializePayment();
  }, [level, service, expertId, currentService]);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      if (orderId) {
        navigate(`/confirmation?order_id=${orderId}`);
      }
    }, 2000);
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="animate-spin mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold mb-2">Préparation de votre commande...</h2>
          <p>Veuillez patienter pendant que nous configurons votre paiement sécurisé.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (initError || !level || !service || !expert || !currentService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-2xl font-bold mb-4">Erreur de configuration</h2>
          <p className="mb-6 text-purple-200">
            {initError || 'Paramètres de commande manquants. Veuillez retourner à la page précédente pour compléter votre sélection.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-white text-center max-w-md"
        >
          <CheckCircle className="mx-auto mb-4 text-green-400" size={64} />
          <h2 className="text-3xl font-bold mb-4">Paiement réussi !</h2>
          <p className="mb-6 text-purple-200">
            Votre commande a été confirmée. Vous allez être redirigé vers la page de confirmation...
          </p>
          <div className="animate-pulse">
            <Loader className="animate-spin mx-auto" size={24} />
          </div>
        </motion.div>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret: clientSecret!,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#7c3aed',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '6px',
        borderRadius: '8px'
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Retour
            </button>
            
            <h1 className="text-xl font-bold text-white">Finaliser votre commande</h1>
            
            <button
              onClick={() => setShowCart(!showCart)}
              className="flex items-center text-white hover:text-purple-300 transition-colors"
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
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Récapitulatif</h2>
              
              <div className="space-y-4">
                <div className="border-b border-white/20 pb-4">
                  <h3 className="text-lg font-semibold text-white">{currentService.name}</h3>
                  <p className="text-purple-300">Durée: {currentService.duration} min</p>
                  <p className="text-purple-300">Expert: {expert}</p>
                  <p className="text-purple-300">Niveau: {stripeAPI.getLevelDisplayName(level)}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Inclus dans cette consultation:</h4>
                  <ul className="space-y-1">
                    {currentService.features.map((feature, index) => (
                      <li key={index} className="text-purple-200 text-sm flex items-start">
                        <span className="mr-2 text-green-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-purple-300">
                      {stripeAPI.formatPrice(currentService.price)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Paiement sécurisé</h2>
              
              {clientSecret && orderId && (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <CheckoutForm 
                    orderId={orderId} 
                    amount={currentService.price} 
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}

              <div className="mt-6 text-center">
                <p className="text-purple-300 text-sm flex items-center justify-center">
                  <span className="mr-2">🔒</span>
                  Paiement 100% sécurisé avec Stripe
                </p>
                <p className="text-purple-400 text-xs mt-2">
                  Vos données sont protégées par un chiffrement SSL
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
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="font-semibold">{currentService.name}</h4>
                    <p className="text-gray-600 text-sm">Expert: {expert}</p>
                    <p className="text-gray-600 text-sm">Durée: {currentService.duration} min</p>
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

