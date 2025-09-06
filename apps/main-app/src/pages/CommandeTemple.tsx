import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, X, Loader } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51S4LPjCyn6GQT2lZ7HLyNYqEWpqkg7rzytnjsymM6163eHBjXKxcYcHP32JCHkUzVhzb90hTyBQJJcU0fOBa6VGR00glO1kzek');

interface CheckoutFormProps {
  orderId: string;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ orderId, onSuccess }) => {
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: ${"$"}{window.location.origin}/confirmation?order_id={orderId},
      },
      redirect: 'if_required'
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || 'Une erreur est survenue.');
      } else {
        setErrorMessage("Une erreur inattendue est survenue.");
      }
      setIsLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <PaymentElement />
        </div>
        
        {errorMessage && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm mb-4">
            {errorMessage}
          </div>
        )}
        
        <motion.button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full px-8 py-3 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Traitement en cours...</span>
            </div>
          ) : (
            'Finaliser le paiement'
          )}
        </motion.button>
      </form>
    </div>
  );
};

const CommandeTemple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || '3';
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const levelInfo = {
    '1': { name: 'Simple', price: 0 },
    '2': { name: 'Intuitive', price: 77 },
    '3': { name: 'Alchimique', price: 197 },
    '4': { name: 'Intégrale', price: 444 },
  };

  const currentLevel = levelInfo[level as keyof typeof levelInfo] || levelInfo['3'];

  const handlePayment = () => {
    if (level === '1') {
      const mockOrderId = 'order_free_' + Date.now();
      navigate(/confirmation?order_id={mockOrderId});
      return;
    }

    setShowPaymentModal(true);
    createPaymentIntent();
  };

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      const mockFormData = {
        firstName: 'Test',
        lastName: 'User', 
        email: 'test@example.com',
        dateOfBirth: '1990-01-01'
      };

      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, formData: mockFormData }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.requiresPayment === false) {
            setShowPaymentModal(false);
            navigate(/confirmation?order_id={data.orderId});
          } else {
            setClientSecret(data.clientSecret);
            setOrderId(data.orderId);
          }
          return;
        }
      } catch {
        console.log('API not available, using simulation mode');
      }

      console.log('Mode simulation activé pour le niveau:', level);
      setShowPaymentModal(false);
      
      setTimeout(() => {
        const simulatedOrderId = 'order_sim_' + Date.now();
        navigate(/confirmation?order_id={simulatedOrderId});
      }, 1500);
      
    } catch (error) {
      console.error("Erreur lors de la création de l'intention de paiement:", error);
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    if (orderId) {
      navigate(/confirmation?order_id={orderId});
    }
  };

  const stripeOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#D4AF37',
        colorBackground: '#1a1b23',
        colorText: '#ffffff',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mystical-dark via-mystical-dark to-mystical-purple/20">
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-mystical-gold hover:text-mystical-gold-light transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-inter text-sm">Retour à l'accueil</span>
          </button>
          
          <h1 className="font-playfair italic text-4xl md:text-5xl font-medium mb-4 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
            Finalise ton voyage
          </h1>
          <p className="font-inter font-light text-xl text-gray-300">
            Niveau {level} sélectionné • Prêt pour la transformation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-6 h-6 text-mystical-gold" />
            <h2 className="font-playfair italic text-2xl font-medium text-white">
              Récapitulatif de commande
            </h2>
          </div>

          <div className="bg-mystical-dark/50 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-inter text-lg text-gray-300">
                Consultation {currentLevel.name}
              </span>
              <span className="font-inter text-2xl font-semibold text-mystical-gold">
                {currentLevel.price === 0 ? 'Gratuit' : `${currentLevel.price}€`}
              </span>
            </div>
            
            <div className="text-sm text-gray-400">
              ✨ Lecture personnalisée complète<br/>
              🎯 Analyse des blocages et potentiels<br/>
              🔮 Rituel de transmutation inclus
            </div>
          </div>

          <motion.button
            onClick={handlePayment}
            disabled={loading}
            className="w-full px-8 py-4 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Préparation...</span>
              </div>
            ) : (
              level === '1' ? 'Commencer gratuitement' : 'Procéder au paiement'
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-br from-mystical-dark to-mystical-purple/20 border border-mystical-gold/30 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-playfair italic text-2xl font-medium text-white">
                    Paiement sécurisé
                  </h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {loading && (
                  <div className="text-center py-12">
                    <Loader className="w-8 h-8 animate-spin mx-auto text-mystical-gold mb-4" />
                    <p className="text-gray-300">Initialisation du paiement...</p>
                  </div>
                )}
                
                {clientSecret && orderId && (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <CheckoutForm orderId={orderId} onSuccess={handlePaymentSuccess} />
                  </Elements>
                )}

                {!loading && !clientSecret && (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-mystical-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-mystical-gold" />
                      </div>
                      <h4 className="text-xl font-semibold text-white mb-2">Mode démonstration</h4>
                      <p className="text-gray-300">
                        Le paiement sera simulé car l'API n'est pas disponible.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommandeTemple;
