import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export interface Expert {
  id: string;
  name: string;
  email: string;
  lastLogin?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  expert: Expert | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
    expert: null
  });

  // Check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('expert_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setAuthState({ isAuthenticated: false, loading: false, expert: null });
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/expert/verify');
      if (response.data.valid) {
        setAuthState({ 
          isAuthenticated: true, 
          loading: false, 
          expert: response.data.expert 
        });
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const response = await api.post('/expert/login', { email, password });
      
      if (response.data.success) {
        const { token, expert } = response.data;
        
        // Store token
        localStorage.setItem('expert_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setAuthState({ 
          isAuthenticated: true, 
          loading: false, 
          expert 
        });
        
        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: 'Échec de la connexion' };
      }
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      
      const errorMessage = error.response?.data?.error || 'Erreur de connexion';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('expert_token');
    delete api.defaults.headers.common['Authorization'];
    setAuthState({ 
      isAuthenticated: false, 
      loading: false, 
      expert: null 
    });
  }, []);

  return { 
    ...authState, 
    login, 
    logout 
  };
};
