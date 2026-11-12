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
import { MagicLinkRequestResult, SanctuaireAuthError } from '../services/sanctuaireAuth';

const API_BASE = getApiBaseUrl();
const AUTH_COOLDOWN_MS = 60 * 1000; // 1 minute between auth attempts by default

const getInitialCooldown = (): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.sessionStorage.getItem('sanctuaire_auth_cooldown');
  if (!stored) {
    return null;
  }
  const timestamp = Number(stored);
  if (Number.isNaN(timestamp) || timestamp <= Date.now()) {
    window.sessionStorage.removeItem('sanctuaire_auth_cooldown');
    return null;
  }
  return timestamp;
};

// =================== TYPES ===================

export interface UserProfile {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  specificQuestion?: string;
  objective?: string;
  facePhotoUrl?: string;
  palmPhotoUrl?: string;
  profileCompleted?: boolean;
  submittedAt?: Date;
}

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
  
  // === PROFILE ===
  profile: UserProfile | null;
  
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
  authCooldownUntil: number | null;
  lastAuthError: string | null;

  // === ACTIONS ===
  /** Step 1: ask for a verification email. Never authenticates by itself. */
  requestMagicLink: (email: string, orderId?: string) => Promise<MagicLinkRequestResult>;
  /** Step 2: redeem the link token and open the session. */
  verifyMagicLink: (token: string) => Promise<{ token: string; user: SanctuaireUser }>;
  /** True once the backend confirmed the mailbox behind the session. */
  emailVerified: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  updateUser: (userData: Partial<{ firstName: string; lastName: string; phone: string; email: string }>) => Promise<void>;
  getOrderContent: (orderId: string) => Promise<OrderContent>;
  downloadFile: (url: string, filename: string) => Promise<void>;
  clearAuthError: () => void;
}

// =================== CONTEXT ===================

const SanctuaireContext = createContext<SanctuaireContextValue | undefined>(undefined);

// =================== PROVIDER ===================

export const SanctuaireProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // === AUTHENTICATION STATE ===
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [user, setUser] = useState<SanctuaireUser | null>(null);
  
  // === PROFILE STATE ===
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
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
  const [authCooldownUntil, setAuthCooldownUntil] = useState<number | null>(() => getInitialCooldown());
  const [lastAuthError, setLastAuthError] = useState<string | null>(null);

  const updateAuthCooldown = useCallback((timestamp: number | null) => {
    setAuthCooldownUntil(timestamp);
    if (typeof window === 'undefined') {
      return;
    }
    if (timestamp && timestamp > Date.now()) {
      window.sessionStorage.setItem('sanctuaire_auth_cooldown', String(timestamp));
    } else {
      window.sessionStorage.removeItem('sanctuaire_auth_cooldown');
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setLastAuthError(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!authCooldownUntil || typeof window === 'undefined') {
      return;
    }

    const checkCooldown = () => {
      if (authCooldownUntil && authCooldownUntil <= Date.now()) {
        updateAuthCooldown(null);
      }
    };

    checkCooldown();
    const timer = window.setInterval(checkCooldown, 1000);
    return () => window.clearInterval(timer);
  }, [authCooldownUntil, updateAuthCooldown]);

  // =================== PROFILE LOADER ===================
  
  const loadProfile = useCallback(async () => {
    const token = sanctuaireService.getStoredToken();
    if (!token) {
      console.log('[SanctuaireProvider] Pas de token, skip profile');
      return;
    }

    try {
      const response = await axios.get<{ profile: UserProfile }>(
        `${API_BASE}/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('[SanctuaireProvider] Profil chargé:', response.data.profile);
      console.log('[SanctuaireProvider] URLs des photos:', {
        facePhotoUrl: response.data.profile?.facePhotoUrl,
        palmPhotoUrl: response.data.profile?.palmPhotoUrl
      });
      
      setProfile(response.data.profile || null);
    } catch (err: any) {
      console.error('[SanctuaireProvider] Erreur profile:', err.response?.data || err.message);
      
      // =================== GESTION ERREUR 401 P0 : Nettoyage session ===================
      if (err.response?.status === 401) {
        console.log('[SanctuaireProvider] Erreur 401 détectée sur profile - Token expiré');
        localStorage.removeItem('sanctuaire_token');
        setIsAuthenticated(false);
        setLastAuthError('Session expirée. Veuillez vous reconnecter.');
      }
    }
  }, []);

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
      
      // =================== GESTION ERREUR 401 P0 : Nettoyage session ===================
      if (err.response?.status === 401) {
        console.log('[SanctuaireProvider] Erreur 401 détectée sur entitlements - Token expiré');
        localStorage.removeItem('sanctuaire_token');
        setIsAuthenticated(false);
        setLastAuthError('Session expirée. Veuillez vous reconnecter.');
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
        loadProfile(),
        loadEntitlements(),
        loadOrdersAndStats()
      ]);
      
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile, loadEntitlements, loadOrdersAndStats]);

  // =================== INITIAL LOAD ===================
  
  useEffect(() => {
    const token = sanctuaireService.getStoredToken();
    
    if (token) {
      console.log('[SanctuaireProvider] Token détecté, chargement des données...');
      setIsAuthenticated(true);
      // Confirm the stored session server-side (and expose whether the mailbox
      // behind it was verified) before trusting it for UI purposes.
      sanctuaireService
        .getSession()
        .then((session) => {
          if (session) setEmailVerified(session.emailVerified === true);
        })
        .catch(() => undefined);
      loadAllData();
    } else {
      console.log('[SanctuaireProvider] Pas de token, mode non-authentifié');
      setIsLoading(false);
    }
  }, [loadAllData]);

  // =================== ACTIONS ===================
  
  /**
   * Step 1 of the Sanctuaire login: send a single-use magic link.
   * Deliberately does NOT authenticate: a payment or an email typed in a form
   * must never open someone else's account.
   */
  const requestMagicLink = useCallback(async (email: string, orderId?: string) => {
    const now = Date.now();
    if (authCooldownUntil && authCooldownUntil > now) {
      const remainingSeconds = Math.ceil((authCooldownUntil - now) / 1000);
      const message = `Trop de demandes de connexion. Patientez ${remainingSeconds}s avant de réessayer.`;
      setLastAuthError(message);
      setError(message);
      throw new Error(message);
    }

    try {
      setIsLoading(true);
      clearAuthError();
      return await sanctuaireService.requestMagicLink(email.trim(), orderId);
    } catch (err: any) {
      if (err instanceof SanctuaireAuthError && err.status === 429) {
        updateAuthCooldown(Date.now() + AUTH_COOLDOWN_MS);
      }
      const message = err?.message || "Impossible d'envoyer l'email de vérification";
      setLastAuthError(message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authCooldownUntil, clearAuthError, updateAuthCooldown]);

  /**
   * Step 2: exchange the received token for a session.
   * This is the only path that sets `isAuthenticated`.
   */
  const verifyMagicLink = useCallback(async (token: string) => {
    try {
      setIsLoading(true);
      clearAuthError();

      const result = await sanctuaireService.verifyMagicLink(token);
      setIsAuthenticated(true);
      setEmailVerified(true);
      updateAuthCooldown(null);
      clearAuthError();
      await loadAllData();
      return result;
    } catch (err: any) {
      if (err instanceof SanctuaireAuthError && err.status === 401) {
        sanctuaireService.logout();
        setIsAuthenticated(false);
        setEmailVerified(false);
        setUser(null);
        setOrders([]);
        setStats(null);
      }
      const message = err?.message || 'Lien de connexion invalide ou expiré';
      setLastAuthError(message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthError, loadAllData, updateAuthCooldown]);

  const logout = useCallback(() => {
    console.log('[SanctuaireProvider] Deconnexion');
    sanctuaireService.logout();
    setIsAuthenticated(false);
    setEmailVerified(false);
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
    updateAuthCooldown(null);
    clearAuthError();
  }, [clearAuthError, updateAuthCooldown]);

  const refresh = useCallback(async () => {
    console.log('[SanctuaireProvider] Refresh manuel déclenché');
    if (isAuthenticated) {
      await loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      const token = sanctuaireService.getStoredToken();
      if (!token) {
        console.error('❌ [SanctuaireProvider-updateProfile] ERREUR: Non authentifié - Aucun token trouvé');
        throw new Error('Non authentifié');
      }

      console.log('🔵 [SanctuaireProvider-updateProfile] DÉMARRAGE');
      console.log('🔵 [SanctuaireProvider-updateProfile] Données à envoyer:', profileData);
      console.log('🔵 [SanctuaireProvider-updateProfile] URL:', `${API_BASE}/users/profile`);
      console.log('🔵 [SanctuaireProvider-updateProfile] Token présent:', token.substring(0, 20) + '...');
      
      const response = await axios.patch<{ profile: UserProfile }>(
        `${API_BASE}/users/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ [SanctuaireProvider-updateProfile] Profil mis à jour avec succès');
      console.log('✅ [SanctuaireProvider-updateProfile] Réponse:', response.data);
      setProfile(response.data.profile);
      
    } catch (err: any) {
      console.error('❌ [SanctuaireProvider-updateProfile] ERREUR:', err.response?.data || err.message);
      console.error('❌ [SanctuaireProvider-updateProfile] Status:', err.response?.status);
      console.error('❌ [SanctuaireProvider-updateProfile] Stack:', err.stack);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (userData: Partial<{ firstName: string; lastName: string; phone: string; email: string }>) => {
    try {
      const token = sanctuaireService.getStoredToken();
      if (!token) {
        console.error('❌ [SanctuaireProvider-updateUser] ERREUR: Non authentifié - Aucun token trouvé');
        throw new Error('Non authentifié');
      }

      console.log('🟢 [SanctuaireProvider-updateUser] DÉMARRAGE');
      console.log('🟢 [SanctuaireProvider-updateUser] Données à envoyer:', userData);
      console.log('🟢 [SanctuaireProvider-updateUser] URL:', `${API_BASE}/users/me`);
      console.log('🟢 [SanctuaireProvider-updateUser] Token présent:', token.substring(0, 20) + '...');
      
      const response = await axios.patch<{ firstName: string; lastName: string; phone: string; email: string }>(
        `${API_BASE}/users/me`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ [SanctuaireProvider-updateUser] Utilisateur mis à jour avec succès');
      console.log('✅ [SanctuaireProvider-updateUser] Réponse:', response.data);
      
      // Mettre à jour le user local
      if (user) {
        const updatedUser = {
          ...user,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phone: response.data.phone,
          email: response.data.email
        };
        console.log('🟢 [SanctuaireProvider-updateUser] Mise à jour du state local user:', updatedUser);
        setUser(updatedUser);
      }
      
    } catch (err: any) {
      console.error('❌ [SanctuaireProvider-updateUser] ERREUR:', err.response?.data || err.message);
      console.error('❌ [SanctuaireProvider-updateUser] Status:', err.response?.status);
      console.error('❌ [SanctuaireProvider-updateUser] Stack:', err.stack);
      throw err;
    }
  }, [user]);

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
    
    // Profile
    profile,
    
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
    authCooldownUntil,
    lastAuthError,

    // Actions
    requestMagicLink,
    verifyMagicLink,
    emailVerified,
    logout,
    refresh,
    updateProfile,
    updateUser,
    getOrderContent,
    downloadFile: sanctuaireService.downloadFile.bind(sanctuaireService),
    clearAuthError,
  };

  // INVESTIGATION 2 - P0 CRITIQUE : CONTEXT GUARD STRUCTUREL FINAL
  // Le Provider DOIT TOUJOURS fournir le contexte, même pendant loading ou sans auth
  // Les enfants (Sanctuaire.tsx) géreront eux-mêmes la redirection si !isAuthenticated
  // NE PAS bloquer le rendu des children ici, sinon useSanctuaire() ne sera jamais callable
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
  
  // PHASE 2 - CORRECTION P0 : Message d'erreur explicite pour débogage
  if (context === undefined) {
    throw new Error(
      '❌ ERREUR CRITIQUE P0: useSanctuaire doit être utilisé à l\'intérieur de SanctuaireProvider. ' +
      'Vérifiez que le composant parent est bien enveloppé dans <SanctuaireProvider>. ' +
      'Cette erreur indique un problème de structure React, pas un problème d\'authentification.'
    );
  }
  
  return context;
};

export default SanctuaireContext;



