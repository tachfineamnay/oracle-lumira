// Oracle Lumira - Confirmation Page (SPA) - REFONTE SANCTUAIRE DYNAMIQUE
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader, AlertCircle, Crown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';

import { useOrderStatus } from '../hooks/useOrderStatus';
import { getLevelNameSafely } from '../utils/orderUtils';

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

  // =================== POST-PAIEMENT : AUCUNE SESSION AUTOMATIQUE ===================
  // P0 sécurité : un paiement réussi (ou un client_secret) ne prouve pas la
  // propriété de la boîte email du client. Aucun jeton n'est créé ici.
  // Le client doit recevoir un lien de vérification puis l'ouvrir :
  //   /sanctuaire/login  ->  email  ->  /sanctuaire/verify?token=...
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = searchParams.get('email');
    if (!email) return;
    // Pré-remplissage uniquement (aucune authentification, aucun jeton).
    try {
      sessionStorage.setItem('sanctuaire_email', email);
    } catch {
      /* storage unavailable */
    }
    setVerificationEmail(email);
  }, [searchParams]);

  // Gestion de la redirection automatique quand l'accès est accordé :
  // on envoie le client vers la demande de lien, PAS vers le Sanctuaire.
  useEffect(() => {
    if (accessGranted && orderData) {
      if (redirectStartedRef.current) return;
      redirectStartedRef.current = true;
      try {
        if (orderData.paymentIntentId) {
          localStorage.setItem('oraclelumira_last_payment_intent_id', orderData.paymentIntentId);
        }
        // ✅ Nouveau client : formulaire d'onboarding à l'arrivée dans le Sanctuaire
        sessionStorage.setItem('first_visit', 'true');
      } catch (err) {
        console.error('[ConfirmationTemple] Erreur stockage PI:', err);
      }

      stopPolling();

      const email = searchParams.get('email');
      const query = new URLSearchParams();
      if (email) query.set('email', email);
      if (orderId) query.set('order_id', orderId);
      const suffix = query.toString() ? `?${query.toString()}` : '';

      setTimeout(() => {
        try {
          navigate(`/sanctuaire/login${suffix}`, { replace: true });
        } catch {
          window.location.href = `/sanctuaire/login${suffix}`;
        }
      }, 400);
    }
  }, [accessGranted, orderData, navigate, stopPolling, searchParams, orderId]);

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

            {/* Explication sécurité (paiement != session) */}
            <div className="text-left bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
              <p className="text-xs text-white/70">
                <strong>Dernière étape :</strong> un lien de connexion sécurisé doit être ouvert
                depuis votre boîte email pour ouvrir votre Sanctuaire.
              </p>
              {verificationEmail && (
                <p className="text-xs text-white/50">
                  Adresse de la commande : {verificationEmail}
                </p>
              )}
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
