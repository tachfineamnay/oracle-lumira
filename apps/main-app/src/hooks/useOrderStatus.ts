/**
 * Hook useOrderStatus
 * 
 * Suit l'état d'une commande via un système de polling intelligent.
 * Utilisé sur la page de confirmation pour rediriger automatiquement
 * l'utilisateur vers le Sanctuaire une fois la commande validée.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../lib/apiBase';

const API_BASE = getApiBaseUrl();

// =================== TYPES ===================

export type OrderStatus = 
  | 'pending' 
  | 'paid' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded';

export interface OrderStatusData {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  level: number;
  levelName: string;
  amount: number;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  expertValidation?: {
    validationStatus: 'pending' | 'approved' | 'rejected';
    validatedAt?: string;
  };
}

interface UseOrderStatusReturn {
  orderStatus: OrderStatus | null;
  orderData: OrderStatusData | null;
  accessGranted: boolean;
  sanctuaryUrl: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  stopPolling: () => void;
}

interface UseOrderStatusOptions {
  pollingInterval?: number; // en millisecondes
  maxPollingAttempts?: number; // nombre maximum de tentatives (-1 = illimité)
  autoStart?: boolean; // démarrer le polling automatiquement
}

// =================== HOOK ===================

export function useOrderStatus(
  orderId: string,
  options: UseOrderStatusOptions = {}
): UseOrderStatusReturn {
  const {
    pollingInterval = 3000, // 3 secondes par défaut
    maxPollingAttempts = -1, // illimité par défaut
    autoStart = true,
  } = options;

  const [orderData, setOrderData] = useState<OrderStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);
  const isPollingRef = useRef(false);

  // Fonction pour récupérer le statut de la commande
  const fetchOrderStatus = useCallback(async () => {
    if (!orderId) {
      setError('ID de commande manquant');
      return;
    }

    try {
      setError(null);
      attemptCountRef.current += 1;

      console.log('[useOrderStatus] Tentative', attemptCountRef.current, 'pour orderId:', orderId);

      const response = await axios.get<OrderStatusData>(
        `${API_BASE}/orders/${orderId}`
      );

      console.log('[useOrderStatus] Données reçues:', response.data);

      setOrderData(response.data);
      setIsLoading(false);

      // Déterminer si l'accès au Sanctuaire est accordé
      const isCompleted = response.data.status === 'completed';
      const isPaid = response.data.status === 'paid'; // ✅ Produits gratuits ont status 'paid'
      const isApproved = response.data.expertValidation?.validationStatus === 'approved';
      
      // L'accès est accordé si :
      // - La commande est complétée (delivered)
      // - OU la commande est payée (notamment pour produits gratuits)
      // - OU validée par un expert
      const granted = isCompleted || isPaid || isApproved;
      
      setAccessGranted(granted);

      // Si l'accès est accordé, arrêter le polling
      if (granted) {
        console.log('[useOrderStatus] Accès accordé ! Arrêt du polling.');
        stopPolling();
      }

      // Si on a atteint le nombre max de tentatives, arrêter
      if (maxPollingAttempts > 0 && attemptCountRef.current >= maxPollingAttempts) {
        console.log('[useOrderStatus] Nombre maximum de tentatives atteint.');
        stopPolling();
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la récupération du statut';
      console.error('[useOrderStatus] Erreur:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);

      // En cas d'erreur 404, arrêter le polling
      if (err.response?.status === 404) {
        console.log('[useOrderStatus] Commande non trouvée, arrêt du polling.');
        stopPolling();
      }
    }
  }, [orderId, maxPollingAttempts]);

  // Fonction pour démarrer le polling
  const startPolling = useCallback(() => {
    if (isPollingRef.current) {
      console.log('[useOrderStatus] Polling déjà en cours.');
      return;
    }

    console.log('[useOrderStatus] Démarrage du polling (intervalle:', pollingInterval, 'ms)');
    isPollingRef.current = true;

    // Première récupération immédiate
    fetchOrderStatus();

    // Ensuite polling à intervalle régulier
    pollingIntervalRef.current = setInterval(() => {
      fetchOrderStatus();
    }, pollingInterval);
  }, [fetchOrderStatus, pollingInterval]);

  // Fonction pour arrêter le polling
  const stopPolling = useCallback(() => {
    console.log('[useOrderStatus] Arrêt du polling.');
    isPollingRef.current = false;

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Démarrer automatiquement le polling au montage
  useEffect(() => {
    if (autoStart && orderId) {
      startPolling();
    }

    // Cleanup : arrêter le polling au démontage
    return () => {
      stopPolling();
    };
  }, [orderId, autoStart, startPolling, stopPolling]);

  // Construire l'URL du Sanctuaire
  const sanctuaryUrl = orderData 
    ? `/sanctuaire?orderId=${orderData._id}&level=${orderData.level}`
    : '/sanctuaire';

  return {
    orderStatus: orderData?.status || null,
    orderData,
    accessGranted,
    sanctuaryUrl,
    isLoading,
    error,
    refresh: fetchOrderStatus,
    stopPolling,
  };
}

export default useOrderStatus;
