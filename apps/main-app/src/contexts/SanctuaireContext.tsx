/**
 * SanctuaireContext - Source de Vérité Unique du Sanctuaire
 * 
 * Ce contexte unifie 3 systèmes critiques :
 * 1. Authentification (token, user, login/logout)
 * 2. Entitlements (capabilities, highestLevel)
 * 3. Orders & Stats (commandes complétées, progression)
 * 
 * Exposé via le hook useSanctuaire() pour toutes les pages du Sanctuaire.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { sanctuaireService, CompletedOrder, SanctuaireStats, SanctuaireUser, OrderContent } from '../services/sanctuaire';
import axios from 'axios';
import { getApiBaseUrl } from '../lib/apiBase';

const API_BASE = getApiBaseUrl();

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

interface SanctuaireContextValue {
  // === AUTHENTICATION ===
  isAuthenticated: boolean;
  user: SanctuaireUser | null;
  
  // === ENTITLEMENTS (CAPABILITIES) ===
  capabilities: string[];
  products: string[];
  highestLevel: string | null;
  levelMetadata: EntitlementsData['levelMetadata'];
  hasCapability: (capability: string) => boolean;
  hasProduct: (productId: string) => boolean;
  
  // === ORDERS & STATS ===
  orders: CompletedOrder[];
  stats: SanctuaireStats | null;
  
  // === STATE ===
  isLoading: boolean;
  error: string | null;
  
  // === ACTIONS ===
  authenticateWithEmail: (email: string) => Promise<{ token: string; user: SanctuaireUser }>;
  logout: () => void;
  refresh: () => Promise<void>;
  getOrderContent: (orderId: string) => Promise<OrderContent>;
  downloadFile: (url: string, filename: string) => Promise<void>;
}

// =================== CONTEXT ===================

const SanctuaireContext = createContext<SanctuaireContextValue | undefined>(undefined);

// =================== PROVIDER ===================

export const SanctuaireProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // === AUTHENTICATION STATE ===
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SanctuaireUser | null>(null);
  
  // === ENTITLEMENTS STATE ===
  const [entitlements, setEntitlements] = useState<EntitlementsData>({
    capabilities: [],
    products: [],
    highestLevel: null,
    levelMetadata: null,
    orderCount: 0,
    productOrderCount: 0,
  });
  
  // === ORDERS & STATS STATE ===
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [stats, setStats] = useState<SanctuaireStats | null>(null);
  
  // === GLOBAL STATE ===
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =================== ENTITLEMENTS LOADER ===================
  
  const loadEntitlements = useCallback(async () => {
    const token = sanctuaireService.getStoredToken();
    if (!token) {
      console.log('[SanctuaireProvider] Pas de token, skip entitlements');
      return;
    }

    try {
      const response = await axios.get<EntitlementsData>(
        `${API_BASE}/users/entitlements`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('[SanctuaireProvider] Entitlements chargés:', response.data);
      setEntitlements(response.data);
    } catch (err: any) {
      console.error('[SanctuaireProvider] Erreur entitlements:', err.response?.data || err.message);
      
      // En cas d'erreur 401, on ne throw pas mais on nettoie
      if (err.response?.status === 401) {
        localStorage.removeItem('sanctuaire_token');
        setIsAuthenticated(false);
      }
    }
  }, []);

  // =================== ORDERS & STATS LOADER ===================
  
  const loadOrdersAndStats = useCallback(async () => {
    try {
      const [ordersData, statsData] = await Promise.all([
        sanctuaireService.getUserCompletedOrders(),
        sanctuaireService.getSanctuaireStats()
      ]);
      
      console.log('[SanctuaireProvider] Orders & Stats chargés');
      setUser(ordersData.user);
      setOrders(ordersData.orders);
      setStats(statsData);
      
    } catch (err: any) {
      console.error('[SanctuaireProvider] Erreur orders/stats:', err.message);
      
      // Si erreur d'auth, déconnecter
      if (err.message?.includes('Token') || err.message?.includes('authentification')) {
        logout();
      }
      throw err;
    }
  }, []);

  // =================== UNIFIED DATA LOADER ===================
  
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les 3 sources en parallèle
      await Promise.all([
        loadEntitlements(),
        loadOrdersAndStats()
      ]);
      
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [loadEntitlements, loadOrdersAndStats]);

  // =================== INITIAL LOAD ===================
  
  useEffect(() => {
    const token = sanctuaireService.getStoredToken();
    
    if (token) {
      console.log('[SanctuaireProvider] Token détecté, chargement des données...');
      setIsAuthenticated(true);
      loadAllData();
    } else {
      console.log('[SanctuaireProvider] Pas de token, mode non-authentifié');
      setIsLoading(false);
    }
  }, [loadAllData]);

  // =================== ACTIONS ===================
  
  const authenticateWithEmail = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[SanctuaireProvider] Authentification avec email:', email);
      const result = await sanctuaireService.authenticateWithEmail(email);
      
      setIsAuthenticated(true);
      setUser(result.user);
      
      // Charger toutes les données après login
      await loadAllData();
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Erreur d\'authentification');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadAllData]);

  const logout = useCallback(() => {
    console.log('[SanctuaireProvider] Déconnexion');
    sanctuaireService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setOrders([]);
    setStats(null);
    setEntitlements({
      capabilities: [],
      products: [],
      highestLevel: null,
      levelMetadata: null,
      orderCount: 0,
      productOrderCount: 0,
    });
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    console.log('[SanctuaireProvider] Refresh manuel déclenché');
    if (isAuthenticated) {
      await loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  const getOrderContent = useCallback(async (orderId: string): Promise<OrderContent> => {
    try {
      setError(null);
      return await sanctuaireService.getOrderContent(orderId);
    } catch (err: any) {
      setError(err.message || 'Erreur de récupération du contenu');
      throw err;
    }
  }, []);

  // =================== CAPABILITY CHECKERS ===================
  
  const hasCapability = useCallback(
    (capability: string): boolean => {
      return entitlements.capabilities.includes(capability);
    },
    [entitlements.capabilities]
  );

  const hasProduct = useCallback(
    (productId: string): boolean => {
      return entitlements.products.includes(productId.toLowerCase());
    },
    [entitlements.products]
  );

  // =================== CONTEXT VALUE ===================
  
  const value: SanctuaireContextValue = {
    // Authentication
    isAuthenticated,
    user,
    
    // Entitlements
    capabilities: entitlements.capabilities,
    products: entitlements.products,
    highestLevel: entitlements.highestLevel,
    levelMetadata: entitlements.levelMetadata,
    hasCapability,
    hasProduct,
    
    // Orders & Stats
    orders,
    stats,
    
    // State
    isLoading,
    error,
    
    // Actions
    authenticateWithEmail,
    logout,
    refresh,
    getOrderContent,
    downloadFile: sanctuaireService.downloadFile.bind(sanctuaireService),
  };

  return (
    <SanctuaireContext.Provider value={value}>
      {children}
    </SanctuaireContext.Provider>
  );
};

// =================== HOOK ===================

/**
 * Hook useSanctuaire - Accès global au contexte du Sanctuaire
 * 
 * Exposé dans toutes les pages /sanctuaire/* pour :
 * - Vérifier l'authentification
 * - Accéder aux capabilities (hasCapability)
 * - Récupérer le user, orders, stats
 * - Déclencher actions (login, logout, refresh)
 */
export const useSanctuaire = (): SanctuaireContextValue => {
  const context = useContext(SanctuaireContext);
  
  if (context === undefined) {
    throw new Error('useSanctuaire doit être utilisé à l\'intérieur de SanctuaireProvider');
  }
  
  return context;
};

export default SanctuaireContext;
