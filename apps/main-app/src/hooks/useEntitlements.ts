/**
 * Hook useEntitlements
 * 
 * Récupère et expose les capacités (capabilities) débloquées par l'utilisateur
 * en fonction de ses commandes complétées.
 * 
 * C'est la source de vérité côté frontend pour le système d'accès dynamique.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// =================== TYPES ===================

export interface EntitlementsData {
  capabilities: string[];
  products: string[];
  highestLevel: string | null;
  levelMetadata: {
    name: string;
    color: string;
    icon: string;
  } | null;
  orderCount: number;
  productOrderCount: number;
}

interface UseEntitlementsReturn {
  capabilities: string[];
  products: string[];
  highestLevel: string | null;
  levelMetadata: EntitlementsData['levelMetadata'];
  isLoading: boolean;
  error: string | null;
  hasCapability: (capability: string) => boolean;
  hasProduct: (productId: string) => boolean;
  refresh: () => Promise<void>;
  orderCount: number;
  productOrderCount: number;
}

// =================== HOOK ===================

export function useEntitlements(): UseEntitlementsReturn {
  const [data, setData] = useState<EntitlementsData>({
    capabilities: [],
    products: [],
    highestLevel: null,
    levelMetadata: null,
    orderCount: 0,
    productOrderCount: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les entitlements
  const fetchEntitlements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem('sanctuaire_token');
      
      if (!token) {
        throw new Error('Token d\'authentification non trouvé');
      }

      const response = await axios.get<EntitlementsData>(
        `${API_BASE}/users/entitlements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('[useEntitlements] Données reçues:', response.data);

      setData(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la récupération des droits';
      console.error('[useEntitlements] Erreur:', errorMessage);
      setError(errorMessage);
      
      // En cas d'erreur d'authentification, nettoyer le token
      if (err.response?.status === 401) {
        localStorage.removeItem('sanctuaire_token');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger au montage du composant
  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  // Fonction pour vérifier si une capacité est débloquée
  const hasCapability = useCallback(
    (capability: string): boolean => {
      return data.capabilities.includes(capability);
    },
    [data.capabilities]
  );

  // Fonction pour vérifier si un produit est possédé
  const hasProduct = useCallback(
    (productId: string): boolean => {
      return data.products.includes(productId.toLowerCase());
    },
    [data.products]
  );

  return {
    capabilities: data.capabilities,
    products: data.products,
    highestLevel: data.highestLevel,
    levelMetadata: data.levelMetadata,
    orderCount: data.orderCount,
    productOrderCount: data.productOrderCount,
    isLoading,
    error,
    hasCapability,
    hasProduct,
    refresh: fetchEntitlements,
  };
}

export default useEntitlements;
