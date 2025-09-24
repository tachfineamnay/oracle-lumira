// Oracle Lumira - Redirection vers le nouveau formulaire d'accueil unifié
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LevelUpload: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection vers le nouveau formulaire d'accueil harmonisé
    navigate('/sanctuaire', { replace: true });
  }, [navigate]);

  return null;
};