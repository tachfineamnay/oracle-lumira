// Oracle Lumira - Confirmation Page (SPA)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader, AlertCircle, Crown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductOrderService from '../services/productOrder';
import { OrderStatus } from '../types/products';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';

const ConfirmationTemple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    if (!orderId) {
      setError('Identifiant de commande manquant');
      setIsLoading(false);
      return;
    }

    const checkOrderStatus = async () => {
      try {
        const status = await ProductOrderService.getOrderStatus(orderId);
        setOrderStatus(status);
        setIsLoading(false);

        // If payment is successful, start countdown for auto-redirect
        if (status.accessGranted) {
          const countdown = setInterval(() => {
            setRedirectCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdown);
                // Redirect with email for auto-login
                const email = status.order.customerEmail || searchParams.get('email');
                navigate(email ? `/sanctuaire?email=${encodeURIComponent(email)}` : '/sanctuaire');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          // Cleanup interval on unmount
          return () => clearInterval(countdown);
        }
      } catch (err) {
        console.error('Failed to check order status:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la vérification de la commande');
        setIsLoading(false);
      }
    };

    // Initial check
    checkOrderStatus();

    // Poll for status updates (in case webhook hasn't processed yet)
    const pollInterval = setInterval(checkOrderStatus, 2000);

    // Stop polling after 30 seconds
    const stopPolling = setTimeout(() => {
      clearInterval(pollInterval);
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(stopPolling);
    };
  }, [orderId, navigate, searchParams]);

  const handleGoToSanctuary = () => {
    // Redirect with email for auto-login
    const email = orderStatus?.order.customerEmail || searchParams.get('email');
    navigate(email ? `/sanctuaire?email=${encodeURIComponent(email)}` : '/sanctuaire');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <PageLayout variant="dark" className="py-12">
        <div className="flex items-center justify-center"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
          <Loader className="w-12 h-12 text-mystical-gold animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white">Vérification de votre commande...</h2>
          <p className="text-gray-300">Nous vérifions le statut de votre paiement</p>
        </motion.div></div>
      </PageLayout>
    );
  }

  if (error || !orderStatus) {
    return (
      <PageLayout variant="dark" className="py-12">
        <div className="flex items-center justify-center">
          <GlassCard>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md p-2 text-center space-y-6">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Erreur</h2>
              <p className="text-gray-300">{error || 'Commande non trouvée'}</p>
              <button onClick={handleBackToHome} className="bg-mystical-gold text-mystical-dark px-6 py-3 rounded-lg font-semibold hover:bg-mystical-gold-light transition-colors">Retour à l'accueil</button>
            </motion.div>
          </GlassCard>
        </div>
      </PageLayout>
    );
  }

  const { order, product, accessGranted } = orderStatus;

  // Success state - payment completed and access granted
  if (accessGranted) {
    return (
      <PageLayout variant="dark" className="py-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto p-8 text-center space-y-8">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border-2 border-mystical-gold/30 rounded-full"
            />
          </motion.div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-mystical-gold to-mystical-gold-light bg-clip-text text-transparent">
              Félicitations !
            </h1>
            <h2 className="text-2xl font-semibold text-white">
              Votre accès au {product.name} est activé
            </h2>
            <p className="text-gray-300 max-w-md mx-auto">
              Votre paiement a été confirmé et vos privilèges mystiques sont maintenant disponibles.
            </p>
          </div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-mystical-dark/50 to-mystical-purple/30 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 text-mystical-gold">
              <Crown className="w-6 h-6" />
              <span className="font-semibold">Détails de votre accès</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Niveau</span>
                <p className="text-white font-semibold">{product.name}</p>
              </div>
              <div>
                <span className="text-gray-400">Montant</span>
                <p className="text-white font-semibold">
                  {ProductOrderService.formatPrice(order.amount)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Commande</span>
                <p className="text-white font-mono text-xs">#{order.id.substring(0, 8)}</p>
              </div>
              <div>
                <span className="text-gray-400">Statut</span>
                <p className="text-green-400 font-semibold">✅ Confirmé</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToSanctuary}
              className="w-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-mystical-gold/50 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Entrer dans le Sanctuaire</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <p className="text-sm text-gray-400">
              Redirection automatique dans {redirectCountdown} seconde{redirectCountdown > 1 ? 's' : ''}...
            </p>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-400 space-y-2 border-t border-mystical-gold/20 pt-6"
          >
            <p>📧 Un email de confirmation sera envoyé prochainement</p>
            <p>🔮 Vos accès mystiques sont maintenant activés</p>
            <p>💎 Profitez de votre voyage initiatique</p>
          </motion.div>
        </motion.div>
      </PageLayout>
    );
  }

  // Payment pending or failed state
  const getStatusInfo = () => {
    switch (order.status) {
      case 'pending':
        return {
          icon: Loader,
          title: 'Paiement en cours...',
          message: 'Nous finalisons votre transaction. Veuillez patienter quelques instants.',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
        };
      case 'failed':
        return {
          icon: AlertCircle,
          title: 'Paiement échoué',
          message: 'Une erreur est survenue lors du traitement de votre paiement.',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
        };
      case 'cancelled':
        return {
          icon: AlertCircle,
          title: 'Paiement annulé',
          message: 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
        };
      default:
        return {
          icon: Loader,
          title: 'Traitement en cours...',
          message: 'Nous vérifions le statut de votre commande.',
          color: 'text-mystical-gold',
          bgColor: 'bg-mystical-gold/20',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <PageLayout variant="dark" className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto p-8 text-center space-y-6">
        {/* Status Icon */}
        <div className={`w-16 h-16 ${statusInfo.bgColor} rounded-full flex items-center justify-center mx-auto`}>
          <StatusIcon className={`w-8 h-8 ${statusInfo.color} ${order.status === 'pending' ? 'animate-spin' : ''}`} />
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{statusInfo.title}</h2>
          <p className="text-gray-300">{statusInfo.message}</p>
        </div>

        {/* Order Details */}
        <div className="bg-gradient-to-br from-mystical-dark/50 to-mystical-purple/30 backdrop-blur-sm border border-mystical-gold/30 rounded-xl p-4 space-y-2">
          <p className="text-sm text-gray-400">Commande #{order.id.substring(0, 8)}</p>
          <p className="text-white font-semibold">{product.name}</p>
          <p className="text-mystical-gold">{ProductOrderService.formatPrice(order.amount)}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {order.status === 'failed' || order.status === 'cancelled' ? (
            <button
              onClick={() => navigate(`/commande?product=${product.id}`)}
              className="w-full bg-mystical-gold text-mystical-dark px-6 py-3 rounded-lg font-semibold hover:bg-mystical-gold-light transition-colors"
            >
              Réessayer le paiement
            </button>
          ) : null}
          
          <button
            onClick={handleBackToHome}
            className="w-full bg-transparent border border-mystical-gold/50 text-mystical-gold px-6 py-3 rounded-lg font-semibold hover:bg-mystical-gold/10 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        {/* Help Text */}
        {order.status === 'pending' && (
          <p className="text-xs text-gray-500">
            Cette page se mettra à jour automatiquement dès que votre paiement sera confirmé.
          </p>
        )}
      </motion.div>
    </PageLayout>
  );
};

export default ConfirmationTemple;

