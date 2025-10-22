// Oracle Lumira - Confirmation Page (SPA) - REFONTE SANCTUAIRE DYNAMIQUE
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader, AlertCircle, Crown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import { useInitializeUserLevel } from '../contexts/UserLevelContext';
import { useOrderStatus } from '../hooks/useOrderStatus';
import { getLevelNameSafely } from '../utils/orderUtils';
import { apiRequest } from '../utils/api';

const ConfirmationTemple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  // Utiliser le nouveau hook de polling intelligent
  const { 
    orderStatus: status, 
    orderData, 
    accessGranted, 
    sanctuaryUrl, 
    isLoading, 
    error: orderError,
    stopPolling 
  } = useOrderStatus(orderId || '', {
    pollingInterval: 3000, // 3 secondes
    maxPollingAttempts: 20, // 20 tentatives max (1 minute)
    autoStart: !!orderId
  });
  
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const redirectStartedRef = useRef(false);
  const { initializeFromPurchase } = useInitializeUserLevel();
  const derivedLevelName = orderData ? getLevelNameSafely(orderData.level) : 'Simple';

  // =================== AUTHENTIFICATION POST-PAIEMENT ===================
  // Obtenir un token valide dès l'arrivée sur la page de confirmation
  useEffect(() => {
    const attemptAuth = async () => {
      try {
        const email = searchParams.get('email');
        if (!email) {
          console.warn('[Auth] Pas d\'email dans l\'URL, impossible de s\'authentifier');
          return;
        }

        console.log('[Auth] Tentative d\'authentification avec email:', email);
        const response = await apiRequest<{ token: string }>('/users/auth/sanctuaire-v2', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        
        if (response && response.token) {
          const { token } = response;
          localStorage.setItem('sanctuaire_token', token);
          console.log('[Auth] ✅ Token reçu et sauvegardé avec succès');
        } else {
          console.error('[Auth] ❌ Réponse API sans token:', response);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Auth] ❌ Échec de l\'authentification post-paiement:', errorMessage);
        // Ne pas bloquer le flux si l'auth échoue - l'utilisateur pourra réessayer plus tard
      }
    };

    if (orderId) {
      attemptAuth();
    }
  }, [searchParams, orderId]);
  // =================== FIN AUTHENTIFICATION ===================

  // Gestion de la redirection automatique quand l'accès est accordé
  useEffect(() => {
    if (accessGranted && orderData) {
      if (redirectStartedRef.current) return;
      redirectStartedRef.current = true;
      console.log('[ConfirmationTemple] Accès accordé ! Démarrage du compte à rebours...');
      
      // Initialiser le contexte utilisateur
      const productData = {
        id: orderData.level.toString(),
        name: derivedLevelName,
        level: orderData.level as any,
        amountCents: orderData.amount,
        currency: 'eur',
        description: `Niveau ${derivedLevelName}`,
        features: [],
        metadata: {},
      };
      
      try {
        if (orderId) {
          initializeFromPurchase(productData, orderId);
        }
        // Stocker le PaymentIntentId pour l'upload côté Sanctuaire
        if (orderData.paymentIntentId) {
          localStorage.setItem('oraclelumira_last_payment_intent_id', orderData.paymentIntentId);
        }
      } catch (err) {
        console.error('[ConfirmationTemple] Erreur initialisation contexte:', err);
      }

      // Démarrer le compte à rebours
      const countdown = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            stopPolling();
            
            // Redirection avec paramètres d'auto-login
            const email = searchParams.get('email');
            const token = `fv_${Date.now()}`;
            const pi = orderData.paymentIntentId;
            const parts: string[] = [];
            if (email) parts.push(`email=${encodeURIComponent(email)}`);
            parts.push(`token=${token}`);
            if (orderId) parts.push(`order_id=${encodeURIComponent(orderId)}`);
            if (pi) parts.push(`payment_intent=${encodeURIComponent(pi)}`);
            const qs = parts.length ? `?${parts.join('&')}` : '';
            
            try {
              navigate(`/sanctuaire${qs}`);
            } catch {
              // Fallback dur en cas d'échec client-side
              window.location.href = `/sanctuaire${qs}`;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [accessGranted, orderData, orderId, navigate, searchParams, initializeFromPurchase, stopPolling, derivedLevelName]);

  // Gérer les erreurs
  useEffect(() => {
    if (orderError) {
      setError(orderError);
    }
    if (!orderId) {
      setError('Identifiant de commande manquant');
    }
  }, [orderError, orderId]);

  const handleGoToSanctuary = () => {
    stopPolling();
    
    // Redirection avec email et token d'auto-login
    const email = searchParams.get('email');
    const token = `fv_${Date.now()}`;
    const pi = orderData?.paymentIntentId;
    const parts: string[] = [];
    if (email) parts.push(`email=${encodeURIComponent(email)}`);
    parts.push(`token=${token}`);
    if (orderId) parts.push(`order_id=${encodeURIComponent(orderId)}`);
    if (pi) parts.push(`payment_intent=${encodeURIComponent(pi)}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    
    // Stocker PI pour robustesse
    try { 
      if (pi) localStorage.setItem('oraclelumira_last_payment_intent_id', pi); 
    } catch {}
    
    try {
      navigate(`/sanctuaire${qs}`);
    } catch {
      // Fallback dur en cas d'échec client-side
      window.location.href = `/sanctuaire${qs}`;
    }
  };

  const handleBackToHome = () => {
    stopPolling();
    navigate('/');
  };

  if (isLoading) {
    return (
      <PageLayout variant="dark" className="py-12">
        <div className="flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <Loader className="w-12 h-12 text-mystical-gold animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-white">Préparation de votre Sanctuaire...</h2>
            <p className="text-gray-300">Nous finalisons votre accès. Cela peut prendre quelques instants.</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>✨ Vérification du paiement</p>
              <p>🔐 Activation de vos privilèges</p>
              <p>🏛️ Ouverture des portes du Sanctuaire</p>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (error || !orderData) {
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

  // Données de la commande (depuis le nouveau hook)
  const productName = derivedLevelName;
  const orderAmount = orderData.amount;
  const orderIdShort = orderData._id.substring(0, 8);

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
              Votre accès au {productName} est activé
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
                <p className="text-white font-semibold">{productName}</p>
              </div>
              <div>
                <span className="text-gray-400">Montant</span>
                <p className="text-white font-semibold">
                  {(orderAmount / 100).toFixed(2)} €
                </p>
              </div>
              <div>
                <span className="text-gray-400">Commande</span>
                <p className="text-white font-mono text-xs">#{orderIdShort}</p>
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

  // Payment pending or in progress state
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
      case 'paid':
        return {
          icon: Loader,
          title: 'Votre Sanctuaire est en préparation...',
          message: 'Nous finalisons l\'activation de vos privilèges mystiques. Vous serez redirigé automatiquement.',
          color: 'text-mystical-gold',
          bgColor: 'bg-mystical-gold/20',
        };
      case 'processing':
        return {
          icon: Loader,
          title: 'Activation en cours...',
          message: 'Votre accès est en cours d\'activation. Veuillez patienter quelques instants.',
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
      case 'refunded':
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
          <StatusIcon className={`w-8 h-8 ${statusInfo.color} ${(status === 'pending' || status === 'processing') ? 'animate-spin' : ''}`} />
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{statusInfo.title}</h2>
          <p className="text-gray-300">{statusInfo.message}</p>
        </div>

        {/* Order Details */}
        <div className="bg-gradient-to-br from-mystical-dark/50 to-mystical-purple/30 backdrop-blur-sm border border-mystical-gold/30 rounded-xl p-4 space-y-2">
          <p className="text-sm text-gray-400">Commande #{orderIdShort}</p>
          <p className="text-white font-semibold">{productName}</p>
          <p className="text-mystical-gold">{(orderAmount / 100).toFixed(2)} €</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === 'failed' || status === 'refunded' ? (
            <button
              onClick={() => {
                stopPolling();
                navigate(`/commande?product=${orderData.level}`);
              }}
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
        {(status === 'pending' || status === 'paid' || status === 'processing') && (
          <p className="text-xs text-gray-500">
            Cette page se mettra à jour automatiquement dès que votre Sanctuaire sera prêt.
          </p>
        )}
      </motion.div>
    </PageLayout>
  );
};

export default ConfirmationTemple;
