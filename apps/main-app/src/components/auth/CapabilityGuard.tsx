/**
 * CapabilityGuard - Composant de gating visuel basé sur les entitlements
 * 
 * Ce composant permet de conditionner l'affichage de contenus en fonction
 * des capacités débloquées par l'utilisateur.
 * 
 * Usage:
 * ```tsx
 * <CapabilityGuard 
 *   requires="content.advanced"
 *   fallback={<LockedCard level="mystique" />}
 * >
 *   <AdvancedContent />
 * </CapabilityGuard>
 * ```
 */

import React, { ReactNode } from 'react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';

// =================== TYPES ===================

interface CapabilityGuardProps {
  /**
   * La capacité requise pour débloquer le contenu
   */
  requires: string;
  
  /**
   * Le contenu à afficher si la capacité est débloquée
   */
  children: ReactNode;
  
  /**
   * Le contenu à afficher si la capacité est verrouillée
   * Si non fourni, ne rien afficher
   */
  fallback?: ReactNode;
  
  /**
   * Mode de comportement :
   * - 'hide': masquer complètement si verrouillé
   * - 'show-fallback': afficher le fallback si verrouillé
   * - 'show-locked': afficher le children avec un overlay verrouillé
   */
  mode?: 'hide' | 'show-fallback' | 'show-locked';
  
  /**
   * Afficher un indicateur de chargement pendant la vérification
   */
  showLoader?: boolean;
}

// =================== COMPOSANT ===================

export const CapabilityGuard: React.FC<CapabilityGuardProps> = ({
  requires,
  children,
  fallback = null,
  mode = 'show-fallback',
  showLoader = true,
}) => {
  const { hasCapability, isLoading } = useSanctuaire();

  // Pendant le chargement
  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // Vérifier la capacité
  const hasAccess = hasCapability(requires);

  // Si l'accès est accordé, afficher le contenu
  if (hasAccess) {
    return <>{children}</>;
  }

  // Sinon, appliquer le comportement selon le mode
  switch (mode) {
    case 'hide':
      return null;

    case 'show-fallback':
      return <>{fallback}</>;

    case 'show-locked':
      return (
        <div className="relative">
          <div className="opacity-50 pointer-events-none blur-sm">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-2xl text-center max-w-sm">
              <div className="text-5xl mb-3">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Contenu Verrouillé
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Débloquez ce contenu en accédant à un niveau supérieur
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

// =================== COMPOSANT DE FALLBACK PAR DÉFAUT ===================

interface LockedCardProps {
  /**
   * Le niveau requis pour débloquer
   */
  level?: string;
  
  /**
   * Message personnalisé
   */
  message?: string;
  
  /**
   * Action personnalisée (bouton CTA)
   */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const LockedCard: React.FC<LockedCardProps> = ({ 
  level = 'supérieur',
  message,
  action 
}) => {
  const defaultMessage = `Débloquez ce contenu avec le niveau ${level}`;
  
  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="text-6xl mb-4 opacity-50">🔒</div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Contenu Verrouillé
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {message || defaultMessage}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// =================== HOOK HELPER ===================

/**
 * Hook simplifié pour vérifier une capacité directement dans un composant
 */
export function useCapabilityCheck(capability: string): boolean {
  const { hasCapability, isLoading } = useSanctuaire();
  
  // Retourner false pendant le chargement par sécurité
  if (isLoading) return false;
  
  return hasCapability(capability);
}

// Export par défaut
export default CapabilityGuard;
