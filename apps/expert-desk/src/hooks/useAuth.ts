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
      console.log('🔐 useAuth.login called with:', { email, hasPassword: !!password });
      setAuthState(prev => ({ ...prev, loading: true }));
      console.log('🔄 Auth loading set to true');
      
      console.log('📡 Making API call to /expert/login...');
      const response = await api.post('/expert/login', { email, password });
      console.log('📥 API response:', response.data);
      
      // API retourne { success, token, expert: { id, name, email } }
      if (response.data.token && response.data.expert) {
        console.log('✅ API call successful, processing...');
        const { token, expert: serverExpert } = response.data;
        
        // Store token
        console.log('💾 Storing token in localStorage');
        localStorage.setItem('expert_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('✨ Setting auth state to authenticated');
        setAuthState({ 
          isAuthenticated: true, 
          loading: false, 
          expert: {
            id: (serverExpert.id || serverExpert._id),\n            name: serverExpert.name,\n            email: serverExpert.email
          }
        });
        
        console.log('🎉 Login process completed successfully');
        return { success: true };
      } else {
        console.log('❌ API call failed - missing token or expert data');
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: 'Réponse invalide du serveur' };
      }
      
    } catch (error: any) {
      console.error('💥 Login error caught:', error);
      console.log('📝 Error details:', { 
        message: error.message, 
        status: error.response?.status, 
        data: error.response?.data 
      });
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

