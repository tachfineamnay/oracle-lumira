import { useEffect, useState, useMemo } from 'react';
import { useStripe, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import { PaymentRequest } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { Sparkles, Apple, CreditCard } from 'lucide-react';

interface ExpressPaymentSectionProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: (orderId: string, email: string) => void;
}

/**
 * ExpressPaymentSection - Apple Pay / Google Pay
 * 
 * Priorité visuelle 2025:
 * - Positionné EN PREMIER (avant formulaire classique)
 * - Design attirant avec badge "Paiement Express"
 * - Animations pour attirer l'attention
 * - Fallback graceful si non disponible
 */
export const ExpressPaymentSection = ({
  clientSecret,
  orderId,
  amount,
  onSuccess,
}: ExpressPaymentSectionProps) => {
  const stripe = useStripe();
  const [canMakePayment, setCanMakePayment] = useState(false);

  // Utiliser useMemo pour éviter les mutations sur paymentRequest (Memory ID: 8d63a968)
  const paymentRequest = useMemo(() => {
    if (!stripe || !clientSecret) {
      return null;
    }

    return stripe.paymentRequest({
      country: 'FR',
      currency: 'eur',
      total: {
        label: 'Lecture Karmique Temple des Reflets',
        amount: amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
    });
  }, [stripe, clientSecret, amount]);

  useEffect(() => {
    if (!paymentRequest) {
      return;
    }

    // Check if express payment is available
    paymentRequest.canMakePayment().then((result) => {
      if (result) {
        setCanMakePayment(true);
      }
    });

    // Handle payment method submission
    const handlePaymentMethod = async (e: any) => {
      try {
        if (!stripe) {
          e.complete('fail');
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: e.paymentMethod.id,
          },
          {
            handleActions: false,
          }
        );

        if (error) {
          e.complete('fail');
          console.error('Express payment failed:', error);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          e.complete('success');
          const email = e.payerEmail || '';
          onSuccess(orderId, email);
        } else {
          e.complete('fail');
        }
      } catch (err) {
        e.complete('fail');
        console.error('Express payment error:', err);
      }
    };

    paymentRequest.on('paymentmethod', handlePaymentMethod);

    return () => {
      paymentRequest.off('paymentmethod');
    };
  }, [paymentRequest, stripe, clientSecret, orderId, onSuccess]);

  // Don't render if express payment not available
  if (!canMakePayment || !paymentRequest) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-8"
    >
      {/* Card Container */}
      <div className="relative bg-gradient-to-r from-mystical-gold/15 via-cosmic-gold/10 to-mystical-gold/15 backdrop-blur-sm border border-mystical-gold/40 rounded-2xl p-5 shadow-lg overflow-hidden">
        {/* Animated Background Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-mystical-gold/5 via-mystical-gold/10 to-mystical-gold/5"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header avec Badge */}
          <div className="flex items-center justify-center mb-4 gap-2">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="w-5 h-5 text-mystical-gold" />
            </motion.div>
            
            <h3 className="text-base font-semibold text-white/90 tracking-wide">
              Paiement Express Disponible
            </h3>
            
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <Sparkles className="w-5 h-5 text-mystical-gold" />
            </motion.div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300/90 text-center mb-4 tracking-wide">
            Payez en un clic avec votre méthode préférée
          </p>

          {/* Icons des méthodes supportées */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg border border-gray-700/50"
            >
              <Apple className="w-5 h-5 text-white" />
              <span className="text-xs font-medium text-white">Pay</span>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg border border-gray-700/50"
            >
              <CreditCard className="w-4 h-4 text-gray-300" />
              <span className="text-xs font-medium text-gray-300">Google Pay</span>
            </motion.div>
          </div>

          {/* Stripe PaymentRequestButton */}
          <div className="express-payment-button">
            <PaymentRequestButtonElement
              options={{
                paymentRequest,
                style: {
                  paymentRequestButton: {
                    type: 'default',
                    theme: 'dark',
                    height: '48px',
                  },
                },
              }}
            />
          </div>

          {/* Security Badge */}
          <p className="text-xs text-center text-gray-400/70 mt-3 flex items-center justify-center gap-1">
            <span className="text-mystical-gold">🔒</span>
            Paiement sécurisé · Données chiffrées
          </p>
        </div>
      </div>

      {/* Subtle Shadow Effect */}
      <motion.div
        className="absolute inset-0 bg-mystical-gold/5 blur-xl -z-10 rounded-2xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

export default ExpressPaymentSection;
