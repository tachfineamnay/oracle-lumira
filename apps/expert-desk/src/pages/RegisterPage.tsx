import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api, endpoints } from '../utils/api';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🚀 Starting registration process...');
      
      const response = await api.post(endpoints.expert.register, { 
        email, 
        password, 
        name 
      });
      
      console.log('📋 Registration response:', response.data);

      if (response.data && response.data.success !== false) {
        console.log('✅ Registration successful, logging in...');
        // Auto-login after registration
        const loginResult = await login(email, password);
        if (loginResult.success) {
          toast.success('Compte créé avec succès !');
          navigate('/desk');
        } else {
          setError(loginResult.error || 'Erreur lors de la connexion automatique');
        }
      } else {
        setError(response.data?.error || 'Erreur lors de l\'enregistrement');
        console.error('❌ Registration failed:', response.data);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.response?.data?.error || 'Erreur de connexion au serveur';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="max-w-md w-full space-y-8 p-8 card">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Inscription Expert
          </h2>
          <p className="mt-2 text-center text-sm text-white/70">
            Créez votre compte expert Oracle Lumira
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-1">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                placeholder="Votre nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input"
                placeholder="Votre mot de passe (min. 6 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" />
                  <span>Création...</span>
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <Link 
              to="/login" 
              className="text-amber-400 hover:text-amber-300 transition-colors duration-200"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
