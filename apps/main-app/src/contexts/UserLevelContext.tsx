// Oracle Lumira - Context niveau utilisateur global
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '../types/products';

export interface UserLevel {
  currentLevel: string | null;
  purchasedProduct: Product | null;
  purchasedDate: Date | null;
  uploadStatus: 'pending' | 'in-progress' | 'completed';
  uploadedFiles: UploadedFile[];
  availableFeatures: string[];
  hasAccess: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  category: 'photo' | 'document' | 'audio' | 'video' | 'other';
  url?: string;
}

interface UserLevelContextType {
  userLevel: UserLevel;
  setUserLevel: (level: UserLevel) => void;
  updateUploadStatus: (status: UserLevel['uploadStatus']) => void;
  addUploadedFile: (file: UploadedFile) => void;
  removeUploadedFile: (fileId: string) => void;
  checkAccess: (requiredLevel: string) => boolean;
  resetUserLevel: () => void;
}

const defaultUserLevel: UserLevel = {
  currentLevel: null,
  purchasedProduct: null,
  purchasedDate: null,
  uploadStatus: 'pending',
  uploadedFiles: [],
  availableFeatures: [],
  hasAccess: false,
};

const UserLevelContext = createContext<UserLevelContextType | undefined>(undefined);

export const UserLevelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLevel, setUserLevel] = useState<UserLevel>(defaultUserLevel);

  // Chargement du niveau depuis localStorage au montage
  useEffect(() => {
    const savedLevel = localStorage.getItem('oraclelumira_user_level');
    if (savedLevel) {
      try {
        const parsedLevel = JSON.parse(savedLevel);
        // Conversion des dates depuis string
        if (parsedLevel.purchasedDate) {
          parsedLevel.purchasedDate = new Date(parsedLevel.purchasedDate);
        }
        if (parsedLevel.uploadedFiles) {
          parsedLevel.uploadedFiles = parsedLevel.uploadedFiles.map((file: any) => ({
            ...file,
            uploadedAt: new Date(file.uploadedAt),
          }));
        }
        setUserLevel(parsedLevel);
      } catch (error) {
        console.error('Error parsing saved user level:', error);
        localStorage.removeItem('oraclelumira_user_level');
      }
    }
  }, []);

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    if (userLevel.currentLevel) {
      localStorage.setItem('oraclelumira_user_level', JSON.stringify(userLevel));
    }
  }, [userLevel]);

  const updateUploadStatus = (status: UserLevel['uploadStatus']) => {
    setUserLevel(prev => ({ ...prev, uploadStatus: status }));
  };

  const addUploadedFile = (file: UploadedFile) => {
    setUserLevel(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, file],
    }));
  };

  const removeUploadedFile = (fileId: string) => {
    setUserLevel(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId),
    }));
  };

  const checkAccess = (requiredLevel: string): boolean => {
    if (!userLevel.currentLevel) return false;
    
    const levelHierarchy = ['initie', 'mystique', 'profond', 'integrale'];
    const currentIndex = levelHierarchy.indexOf(userLevel.currentLevel);
    const requiredIndex = levelHierarchy.indexOf(requiredLevel);
    
    return currentIndex >= requiredIndex;
  };

  const resetUserLevel = () => {
    setUserLevel(defaultUserLevel);
    localStorage.removeItem('oraclelumira_user_level');
  };

  const contextValue: UserLevelContextType = {
    userLevel,
    setUserLevel,
    updateUploadStatus,
    addUploadedFile,
    removeUploadedFile,
    checkAccess,
    resetUserLevel,
  };

  return (
    <UserLevelContext.Provider value={contextValue}>
      {children}
    </UserLevelContext.Provider>
  );
};

export const useUserLevel = (): UserLevelContextType => {
  const context = useContext(UserLevelContext);
  if (context === undefined) {
    throw new Error('useUserLevel must be used within a UserLevelProvider');
  }
  return context;
};

// Hook pour initialiser le niveau après achat
export const useInitializeUserLevel = () => {
  const { setUserLevel } = useUserLevel();

  const initializeFromPurchase = (product: Product, orderId: string) => {
    const newLevel: UserLevel = {
      currentLevel: product.level,
      purchasedProduct: product,
      purchasedDate: new Date(),
      uploadStatus: 'pending',
      uploadedFiles: [],
      availableFeatures: product.features || [],
      hasAccess: true,
    };
    
    setUserLevel(newLevel);
    
    // Optionnel: envoi analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase_completed', {
        event_category: 'Oracle Lumira',
        event_label: product.level,
        value: product.amountCents / 100,
        currency: product.currency,
        transaction_id: orderId,
      });
    }
  };

  return { initializeFromPurchase };
};