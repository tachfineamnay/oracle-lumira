import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import DeskPage from './pages/DeskPage';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  console.log('🔍 App render - Auth state:', { isAuthenticated, loading });

  if (loading) {
    console.log('⏳ Showing loading spinner');
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  console.log('🛣️ Rendering routes with isAuthenticated:', isAuthenticated);

  return (
    <div className="min-h-screen gradient-bg">
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/desk" replace />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/desk" replace />} 
        />
        <Route 
          path="/desk" 
          element={isAuthenticated ? <DeskPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/desk" : "/login"} replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </div>
  );
};

export default App;
