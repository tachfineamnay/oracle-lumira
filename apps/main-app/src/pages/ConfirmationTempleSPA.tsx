// Oracle Lumira - Confirmation Page (SPA) - REFONTE SANCTUAIRE DYNAMIQUE
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader, AlertCircle, Crown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';

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
  const redirectStartedRef = useRef(false);
  // Migration: UserLevel initialization now handled by SanctuaireProvider
  const derivedLevelName = orderData ? getLevelNameSafely(orderData.level) : 'Simple';

  // =================== AUTHENTIFICATION POST-PAIEMENT ===================
  // PASSAGE 7 - P0 : RÉ-AUTHENTIFICATION QUAND ACCÈS ACCORDÉ
  // Obtenir un token valide dès l'arrivée sur la page de confirmation
  const [tokenReady, setTokenReady] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  
  useEffect(() => {
    const attemptAuth = async () => {
      try {
        const email = searchParams.get('email');
        if (!email) {
          console.warn('[Auth] Pas d\'email dans l\'URL, impossible de s\'authentifier');
          setTokenReady(true); // Continuer sans token si pas d'email
          setAuthAttempted(true);
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
          setTokenReady(true);
        } else {
          console.error('[Auth] ❌ Réponse API sans token:', response);
          setTokenReady(false); // PASSAGE 7 : NE PAS continuer sans token
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Auth] ❌ Échec de l\'authentification post-paiement:', errorMessage);
        // PASSAGE 7 - P0 : Si erreur 403/401, c'est probablement un race condition
        // On va réessayer quand accessGranted devient true
        setTokenReady(false);
      } finally {
        setAuthAttempted(true);
      }
    };

    if (orderId && !authAttempted) {
      attemptAuth();
    }
  }, [searchParams, orderId, authAttempted]);
  
  // PASSAGE 7 - P0 : RÉ-AUTHENTIFICATION quand accès accordé mais pas de token
  useEffect(() => {
    const retryAuth = async () => {
      const email = searchParams.get('email');
      if (!email) {
        console.warn('[Auth-Retry] Pas d\'email pour réessayer l\'auth');
        setTokenReady(true); // Continuer quand même
        return;
      }
      
      try {
        console.log('[Auth-Retry] 🔄 Ré-authentification après accès accordé...');
        const response = await apiRequest<{ token: string }>('/users/auth/sanctuaire-v2', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        
        if (response && response.token) {
          const { token } = response;
          localStorage.setItem('sanctuaire_token', token);
          sessionStorage.setItem('sanctuaire_email', email);
          console.log('[Auth-Retry] ✅ Token obtenu avec succès après retry !');
          setTokenReady(true);
        } else {
          console.error('[Auth-Retry] ❌ Toujours pas de token après retry');
          setTokenReady(true); // Continuer quand même pour éviter blocage
        }
      } catch (error) {
        console.error('[Auth-Retry] ❌ Erreur lors du retry:', error);
        setTokenReady(true); // Continuer quand même
      }
    };
    
    // Si accès accordé mais pas de token, réessayer l'auth
    if (accessGranted && !tokenReady && authAttempted) {
      console.log('[Auth-Retry] Accès accordé détecté mais pas de token, retry...');
      retryAuth();
    }
  }, [accessGranted, tokenReady, authAttempted, searchParams]);
  // =================== FIN AUTHENTIFICATION ===================

  // Gestion de la redirection automatique quand l'accès est accordé ET le token est prêt
  useEffect(() => {
    if (accessGranted && orderData && tokenReady) {
      if (redirectStartedRef.current) return;
      redirectStartedRef.current = true;
      console.log('[ConfirmationTemple] Accès accordé et token prêt ! Redirection immédiate...');
      
      // Stocker le PaymentIntentId pour l'upload côté Sanctuaire
      try {
        if (orderData.paymentIntentId) {
          localStorage.setItem('oraclelumira_last_payment_intent_id', orderData.paymentIntentId);
        }
        // Stocker l'email pour les retries automatiques dans Sanctuaire.tsx
        const email = searchParams.get('email');
        if (email) {
          sessionStorage.setItem('sanctuaire_email', email);
          console.log('[ConfirmationTemple] Email stocké pour retries:', email);
        }
      } catch (err) {
        console.error('[ConfirmationTemple] Erreur stockage PI/email:', err);
      }

      // Redirection immédiate sans countdown
      stopPolling();
      
      // Vérifier que le token est bien présent avant redirection
      const storedToken = localStorage.getItem('sanctuaire_token');
      if (!storedToken) {
        console.error('[Auth] ⚠️ CRITIQUE: Token manquant avant redirection !');
      }
      
      // Redirection SIMPLE vers /sanctuaire (sans paramètres inutiles)
      console.log('[ConfirmationTemple] Redirection vers /sanctuaire...');
      
      // Délai asynchrone pour éviter le crash contextuel React
      setTimeout(() => {
        try {
          navigate('/sanctuaire', { replace: true });
        } catch {
          // Fallback dur en cas d'échec client-side
          window.location.href = '/sanctuaire';
        }
      }, 150); // 150ms suffisent pour stabiliser le contexte React
    }
  }, [accessGranted, orderData, tokenReady, navigate, stopPolling, searchParams]);

  // Gérer les erreurs
  useEffect(() => {
    if (orderError) {
      setError(orderError);
    }
    if (!orderId) {
      setError('Identifiant de commande manquant');
    }
  }, [orderError, orderId]);



  const handleBackToHome = () => {
    stopPolling();
    navigate('/');
  };

  if (isLoading) {
    return (
      <PageLayout variant="dark" className="py-12">
        <div className="flex items-center justify-center">
          <GlassCard>
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
          </GlassCard>
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
      <div className="max-w-md mx-auto">
        <GlassCard>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-center space-y-6" role="status" aria-live="polite">
            {/* Status Icon */}
            <div className={`w-16 h-16 ${statusInfo.bgColor} rounded-full flex items-center justify-center mx-auto`}>
              <StatusIcon className={`w-8 h-8 ${statusInfo.color} ${(status === 'pending' || status === 'processing') ? 'animate-spin' : ''}`} aria-hidden="true" />
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
                  className="w-full bg-mystical-gold text-mystical-dark px-6 py-3 rounded-lg font-semibold hover:bg-mystical-gold-light transition-colors focus:outline-none focus:ring-2 focus:ring-mystical-gold/40"
                >
                  Réessayer le paiement
                </button>
              ) : null}
              
              <button
                onClick={handleBackToHome}
                className="w-full bg-transparent border border-mystical-gold/50 text-mystical-gold px-6 py-3 rounded-lg font-semibold hover:bg-mystical-gold/10 transition-colors focus:outline-none focus:ring-2 focus:ring-mystical-gold/40"
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
        </GlassCard>
      </div>
    </PageLayout>
  );
};

export default ConfirmationTemple;
