// Oracle Lumira - Page de confirmation avec redirection Sanctuaire
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle, ArrowRight, Star } from 'lucide-react';
import ProductOrderService from '../services/productOrder';

import type { OrderStatus } from '../types/products';

const ConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  // Migration: UserLevel initialization now handled by SanctuaireProvider
  
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    if (!orderId) {
      setError('ID de commande manquant');
      setIsLoading(false);
      return;
    }

    const fetchOrderStatus = async () => {
      try {
        const status = await ProductOrderService.getOrderStatus(orderId);
        setOrderStatus(status);
        
        // Initialiser le niveau utilisateur si commande complétée
        if (status.order.status === 'completed' && status.accessGranted) {
          // Migration: initializeFromPurchase removed - SanctuaireProvider handles initialization
          console.log('[ConfirmationPage] Commande complétée, accès accordé');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch order status:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la vérification de la commande');
        setIsLoading(false);
      }
    };

    fetchOrderStatus();
  }, [orderId]);

  // Countdown pour redirection automatique
  useEffect(() => {
    if (orderStatus?.accessGranted && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (orderStatus?.accessGranted && redirectCountdown === 0) {
      navigate(`/upload-sanctuaire?level=${orderStatus.product.level}&order_id=${orderId}`);
    }
  }, [orderStatus, redirectCountdown, navigate, orderId]);

  const handleGoToSanctuaire = () => {
    if (orderStatus?.accessGranted) {
      navigate(`/upload-sanctuaire?level=${orderStatus.product.level}&order_id=${orderId}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-galaxy flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader className="w-12 h-12 text-cosmic-gold mx-auto" />
          </motion.div>
          <p className="text-cosmic-ethereal font-inter text-lg">
            Vérification de votre commande cosmique...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !orderStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-galaxy flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md p-8 text-center space-y-6"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-cosmic-divine mb-2">Erreur de Vérification</h2>
            <p className="text-cosmic-ethereal">{error || 'Impossible de vérifier la commande'}</p>
          </div>
          <button
            onClick={handleBackToHome}
            className="px-8 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm text-cosmic-void font-bold rounded-xl hover:shadow-stellar transition-all duration-300"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  const isCompleted = orderStatus.order.status === 'completed';
  const hasAccess = orderStatus.accessGranted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-galaxy">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          {/* Success Icon */}
          {isCompleted && hasAccess ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader className="w-12 h-12 text-white animate-spin" />
              </div>
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="font-playfair italic text-4xl md:text-5xl font-bold text-cosmic-divine mb-4">
              {isCompleted && hasAccess 
                ? 'Bienvenue dans Oracle Lumira !' 
                : 'Commande en Traitement'}
            </h1>
            <p className="text-cosmic-ethereal font-inter text-lg">
              {isCompleted && hasAccess 
                ? 'Votre voyage cosmique commence maintenant'
                : 'Nous finalisons l\'activation de votre niveau'}
            </p>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-cosmic-deep/60 backdrop-blur-md border border-cosmic-gold/40 rounded-2xl p-8 space-y-6"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Star className="w-6 h-6 text-cosmic-gold" />
              <h2 className="text-2xl font-bold text-cosmic-gold">
                Niveau {orderStatus.product.level}
              </h2>
              <Star className="w-6 h-6 text-cosmic-gold" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-bold text-cosmic-divine mb-2">Détails de commande</h3>
                <div className="space-y-2 text-cosmic-ethereal">
                  <p><span className="font-medium">Commande:</span> #{orderStatus.order.id.slice(-8)}</p>
                  <p><span className="font-medium">Produit:</span> {orderStatus.product.name}</p>
                  <p><span className="font-medium">Montant:</span> {ProductOrderService.formatPrice(orderStatus.order.amount, orderStatus.order.currency)}</p>
                  <p><span className="font-medium">Date:</span> {new Date(orderStatus.order.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-cosmic-divine mb-2">Statut d'accès</h3>
                <div className="space-y-2 text-cosmic-ethereal">
                  <p><span className="font-medium">Paiement:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {isCompleted ? 'Confirmé' : 'En cours'}
                    </span>
                  </p>
                  <p><span className="font-medium">Sanctuaire:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      hasAccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {hasAccess ? 'Activé' : 'En attente'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            {isCompleted && hasAccess ? (
              <div className="space-y-4">
                <motion.button
                  onClick={handleGoToSanctuaire}
                  className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-cosmic-gold via-cosmic-gold-warm to-cosmic-gold text-cosmic-void font-bold rounded-xl hover:shadow-stellar transition-all duration-300 flex items-center justify-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Accéder au Sanctuaire</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <p className="text-sm text-cosmic-silver">
                  Redirection automatique dans {redirectCountdown} secondes...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-cosmic-ethereal">
                  Votre paiement est en cours de traitement. L'accès sera activé sous peu.
                </p>
                <button
                  onClick={handleBackToHome}
                  className="px-8 py-3 border border-cosmic-gold/50 text-cosmic-gold rounded-xl hover:bg-cosmic-gold/10 transition-all duration-300"
                >
                  Retour à l'accueil
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
