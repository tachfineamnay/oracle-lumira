import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Mail, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Login attempt started with:', { email: formData.email, hasPassword: !!formData.password });
    
    if (!formData.email || !formData.password) {
      console.log('❌ Missing credentials');
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    console.log('🔄 Setting loading to true');
    
    try {
      console.log('📡 Calling login function...');
      const result = await login(formData.email, formData.password);
      console.log('📥 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, showing toast...');
        toast.success('Connexion réussie !');
        
        // Redirection immédiate vers le desk
        console.log('🔄 Redirecting to desk immediately...');
        navigate('/desk', { replace: true });
        
      } else {
        console.log('❌ Login failed:', result.error);
        toast.error(result.error || 'Échec de la connexion');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      toast.error('Erreur de connexion');
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Expert Desk</h1>
          <p className="text-slate-300">Accès réservé aux oracles certifiés</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input pl-10"
                placeholder="expert@oraclelumira.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input pl-10 pr-10"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="small" />
                <span>Connexion...</span>
              </div>
            ) : (
              'Accéder au Desk'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          <p>Pas encore de compte ?</p>
          <Link 
            to="/register" 
            className="text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
          >
            S'inscrire comme expert
          </Link>
          <p className="text-xs mt-4 text-slate-500">Identifiants oubliés ? Contactez l'administrateur Oracle Lumira</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
