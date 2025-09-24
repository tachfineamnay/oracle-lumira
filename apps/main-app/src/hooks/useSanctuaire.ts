import { useState, useEffect } from 'react';
import { sanctuaireService, CompletedOrder, SanctuaireStats, SanctuaireUser, OrderContent } from '../services/sanctuaire';

export function useSanctuaire() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SanctuaireUser | null>(null);
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [stats, setStats] = useState<SanctuaireStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sanctuaireService.getStoredToken();
    if (token) {
      setIsAuthenticated(true);
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ordersData, statsData] = await Promise.all([
        sanctuaireService.getUserCompletedOrders(),
        sanctuaireService.getSanctuaireStats()
      ]);
      
      setUser(ordersData.user);
      setOrders(ordersData.orders);
      setStats(statsData);
      
    } catch (err: any) {
      console.error('Erreur chargement données sanctuaire:', err);
      setError(err.message || 'Erreur de chargement');
      
      // Si erreur d'auth, déconnecter
      if (err.message?.includes('Token') || err.message?.includes('authentification')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await sanctuaireService.authenticateWithEmail(email);
      
      setIsAuthenticated(true);
      setUser(result.user);
      
      // Charger les données utilisateur
      await loadUserData();
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Erreur d\'authentification');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sanctuaireService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setOrders([]);
    setStats(null);
    setError(null);
  };

  const refreshData = async () => {
    if (isAuthenticated) {
      await loadUserData();
    }
  };

  const getOrderContent = async (orderId: string): Promise<OrderContent> => {
    try {
      setError(null);
      return await sanctuaireService.getOrderContent(orderId);
    } catch (err: any) {
      setError(err.message || 'Erreur de récupération du contenu');
      throw err;
    }
  };

  return {
    // État
    isAuthenticated,
    user,
    orders,
    stats,
    loading,
    error,
    
    // Actions
    authenticateWithEmail,
    logout,
    refreshData,
    getOrderContent,
    
    // Utilitaires
    downloadFile: sanctuaireService.downloadFile.bind(sanctuaireService)
  };
}