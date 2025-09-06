import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Loader } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Remplacer par votre clé publique de test Stripe
const stripePromise = loadStripe('pk_test_51S4LPjCyn6GQT2lZ7HLyNYqEWpqkg7rzytnjsymM6163eHBjXKxcYcHP32JCHkUzVhzb90hTyBQJJcU0fOBa6VGR00glO1kzek');

const CheckoutForm: React.FC<{ orderId: string }> = ({ orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
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
        return_url: `${window.location.origin}/confirmation?order_id=${orderId}`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setErrorMessage(error.message || 'Une erreur est survenue.');
    } else {
      setErrorMessage("Une erreur inattendue est survenue.");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <motion.button
        disabled={isLoading || !stripe || !elements}
        className="w-full mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isLoading ? <Loader className="animate-spin mx-auto" /> : `Payer et finaliser`}
      </motion.button>
      {errorMessage && <div className="text-red-500 text-center mt-4">{errorMessage}</div>}
    </form>
  );
};

const CommandeTemple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || '1';
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // NOTE: Les données du formulaire devraient être collectées et envoyées ici
        const mockFormData = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          birthDate: '1990-01-01',
        };

        // Try to call the API, fallback to mock if it fails
        try {
          const response = await fetch('http://localhost:3001/api/stripe/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level, formData: mockFormData }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.requiresPayment === false) {
              navigate(`/confirmation?order_id=${data.orderId}`);
            } else {
              setClientSecret(data.clientSecret);
              setOrderId(data.orderId);
            }
            return;
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }

        // Fallback to mock data if API is not available
        console.log('Using mock payment data for level:', level);
        
        const mockClientSecret = 'pi_test_1234567890_secret_mocktest';
        const mockOrderId = 'order_mock_' + Date.now();
        
        // For level 1 (free), no payment needed
        if (level === '1') {
          navigate(`/confirmation?order_id=${mockOrderId}`);
        } else {
          setClientSecret(mockClientSecret);
          setOrderId(mockOrderId);
        }
        
      } catch (error) {
        console.error("Erreur lors de la création de l'intention de paiement:", error);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [level, navigate]);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#FDB813',
        colorBackground: '#1a1a2e',
        colorText: '#ffffff',
      },
    },
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-mystical-gold hover:text-mystical-gold-light transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-inter text-sm">Retour à l'accueil</span>
          </button>
          
          <h1 className="font-playfair italic text-4xl md:text-5xl font-medium mb-4 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
            Finalise ton voyage
          </h1>
          <p className="font-inter font-light text-xl text-gray-300">
            Niveau {level} sélectionné • Prêt pour la transformation
          </p>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-6 h-6 text-mystical-gold" />
            <h2 className="font-playfair italic text-2xl font-medium text-white">
              Informations de paiement
            </h2>
          </div>

          {loading && <div className="text-center py-12"><Loader className="animate-spin mx-auto" /></div>}
          
          {clientSecret && orderId && (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm orderId={orderId} />
            </Elements>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CommandeTemple;
