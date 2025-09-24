// Oracle Lumira - Profil Spirituel
// Redirection vers le formulaire d'accueil principal pour maintenir la cohérence

import React from 'react';
import EmptyState from '../ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useUserLevel } from '../../contexts/UserLevelContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { userLevel } = useUserLevel();

  return (
    <EmptyState 
      type="profile"
      title="Votre Profil Spirituel"
      message={userLevel?.userProfile?.profileCompleted 
        ? "Votre profil spirituel a été transmis à nos Oracles. Toutes vos informations sont centralisées dans votre espace d'accueil pour une expérience harmonieuse."
        : "Complétez votre profil spirituel dans votre espace d'accueil pour que l'Oracle puisse vous guider avec précision sur votre chemin de lumière."
      }
      action={{
        label: "Voir mon profil complet",
        onClick: () => navigate('/sanctuaire')
      }}
    />
  );
};

export default Profile;