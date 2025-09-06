import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
      
      const response = await fetch('/api/expert/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      console.log('📋 Registration response:', { status: response.status, data });

      if (response.ok) {
        console.log('✅ Registration successful, logging in...');
        // Auto-login after registration
        const loginResult = await login(email, password);
        if (loginResult.success) {
          navigate('/desk');
        } else {
          setError(loginResult.error || 'Erreur lors de la connexion automatique');
        }
      } else {
        setError(data.error || 'Erreur lors de l\'enregistrement');
        console.error('❌ Registration failed:', data);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
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
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <Link 
              to="/login" 
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors duration-200"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
