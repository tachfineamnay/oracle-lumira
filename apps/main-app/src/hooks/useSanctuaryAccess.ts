/**
 * Oracle Lumira - Hook de Gestion des Accès du Sanctuaire
 * 
 * Ce hook centralise la logique de vérification des permissions
 * en fonction du niveau d'abonnement de l'utilisateur.
 * 
 * Utilisation :
 * ```tsx
 * const { canAccess, userLevel, accessRights } = useSanctuaryAccess();
 * 
 * if (canAccess('oracle.viewHistory')) {
 *   // Afficher l'historique
 * }
 * ```
 * 
 * Créé le : 21 Octobre 2025
 * Statut : Prêt à l'emploi (non utilisé pour le moment)
 */

import { useMemo } from 'react';
import { useSanctuaire } from '../contexts/SanctuaireContext';
import {
  ACCESS_MATRIX,
  SanctuaryLevel,
  AccessRights,
  LEVEL_NAMES
} from '../config/sanctuary-access';

// =================== TYPES ===================

export type FeaturePath = 
  // Oracle features
  | 'oracle.dailyDraws'
  | 'oracle.viewHistory'
  | 'oracle.detailedInterpretation'
  | 'oracle.drawType.simple'
  | 'oracle.drawType.trois_cartes'
  | 'oracle.drawType.croix_celtique'
  | 'oracle.drawType.personnalise'
  
  // Profile features
  | 'profile.editBasicInfo'
  | 'profile.uploadPhotos'
  | 'profile.spiritualObjective'
  
  // Sanctuary features
  | 'sanctuary.access'
  | 'sanctuary.customization'
  | 'sanctuary.meditationTools'
  | 'sanctuary.aiAssistant'
  
  // Synthesis features
  | 'synthesis.view'
  | 'synthesis.downloadPDF'
  | 'synthesis.personalizedRecommendations'
  | 'synthesis.aiAnalysis'
  
  // Conversations features
  | 'conversations.messageOracle'
  | 'conversations.responseGuarantee'
  | 'conversations.prioritySupport';

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: SanctuaryLevel;
}

export interface SanctuaryAccessHook {
  // Niveau actuel de l'utilisateur
  userLevel: SanctuaryLevel;
  levelName: string;
  
  // Droits d'accès complets
  accessRights: AccessRights;
  
  // Fonction principale de vérification
  canAccess: (feature: FeaturePath) => boolean;
  
  // Fonction détaillée avec raison
  checkAccess: (feature: FeaturePath) => AccessCheckResult;
  
  // Vérifications spécifiques
  canDrawToday: () => boolean;
  getRemainingDraws: () => number;
  canSendMessage: () => boolean;
  getRemainingMessages: () => number;
  
  // Helpers
  needsUpgrade: (feature: FeaturePath) => SanctuaryLevel | null;
  isUnlimited: (feature: 'draws' | 'messages') => boolean;
}

// =================== HOOK ===================

export function useSanctuaryAccess(): SanctuaryAccessHook {
  const { user } = useSanctuaire();
  
  // Déterminer le niveau actuel de l'utilisateur
  // Pour le moment, on utilise le nombre de commandes comme proxy du niveau
  // TODO: Remplacer par un champ `subscriptionLevel` dans le modèle User
  const userLevel = useMemo<SanctuaryLevel>(() => {
    if (!user) return SanctuaryLevel.FREE;
    
    const orderCount = user.level || 0;
    
    // Mapping temporaire basé sur le nombre de commandes
    if (orderCount === 0) return SanctuaryLevel.FREE;
    if (orderCount <= 5) return SanctuaryLevel.PROFOND;
    if (orderCount <= 15) return SanctuaryLevel.MYSTIQUE;
    return SanctuaryLevel.INTEGRAL;
  }, [user]);
  
  // Récupérer les droits d'accès correspondants
  const accessRights = useMemo<AccessRights>(() => {
    return ACCESS_MATRIX[userLevel];
  }, [userLevel]);
  
  // Fonction utilitaire pour parser le chemin de fonctionnalité
  const parsePath = (feature: FeaturePath): { category: string; property: string; subProperty?: string } => {
    const parts = feature.split('.');
    return {
      category: parts[0],
      property: parts[1],
      subProperty: parts[2]
    };
  };
  
  // Fonction principale : vérifier l'accès à une fonctionnalité
  const canAccess = (feature: FeaturePath): boolean => {
    const { category, property, subProperty } = parsePath(feature);
    
    // Gestion des types de tirages Oracle
    if (category === 'oracle' && property === 'drawType' && subProperty) {
      return accessRights.oracle.drawTypes.includes(subProperty);
    }
    
    // Accès direct aux propriétés
    const categoryAccess = accessRights[category as keyof AccessRights];
    if (typeof categoryAccess === 'object' && categoryAccess !== null) {
      const value = categoryAccess[property as keyof typeof categoryAccess];
      return Boolean(value);
    }
    
    return false;
  };
  
  // Fonction détaillée avec raison du refus
  const checkAccess = (feature: FeaturePath): AccessCheckResult => {
    const allowed = canAccess(feature);
    
    if (allowed) {
      return { allowed: true };
    }
    
    // Trouver le niveau minimum requis pour cette fonctionnalité
    const levels = [
      SanctuaryLevel.PROFOND,
      SanctuaryLevel.MYSTIQUE,
      SanctuaryLevel.INTEGRAL
    ];
    
    for (const level of levels) {
      const rights = ACCESS_MATRIX[level];
      const { category, property, subProperty } = parsePath(feature);
      
      if (category === 'oracle' && property === 'drawType' && subProperty) {
        if (rights.oracle.drawTypes.includes(subProperty)) {
          return {
            allowed: false,
            reason: `Cette fonctionnalité nécessite le ${LEVEL_NAMES[level]}`,
            upgradeRequired: level
          };
        }
      } else {
        const categoryAccess = rights[category as keyof AccessRights];
        if (typeof categoryAccess === 'object' && categoryAccess !== null) {
          const value = categoryAccess[property as keyof typeof categoryAccess];
          if (value) {
            return {
              allowed: false,
              reason: `Cette fonctionnalité nécessite le ${LEVEL_NAMES[level]}`,
              upgradeRequired: level
            };
          }
        }
      }
    }
    
    return {
      allowed: false,
      reason: 'Cette fonctionnalité n\'est pas disponible pour votre niveau'
    };
  };
  
  // Vérifier si l'utilisateur peut tirer aujourd'hui
  const canDrawToday = (): boolean => {
    // TODO: Implémenter la logique de comptage des tirages quotidiens
    // Pour le moment, on retourne true si dailyDraws > 0 ou illimité
    return accessRights.oracle.dailyDraws !== 0;
  };
  
  // Obtenir le nombre de tirages restants aujourd'hui
  const getRemainingDraws = (): number => {
    if (accessRights.oracle.dailyDraws === -1) return Infinity;
    
    // TODO: Implémenter la logique de comptage réel
    // Pour le moment, on retourne la limite quotidienne
    return accessRights.oracle.dailyDraws;
  };
  
  // Vérifier si l'utilisateur peut envoyer un message
  const canSendMessage = (): boolean => {
    // TODO: Implémenter la logique de comptage des messages quotidiens
    return accessRights.conversations.maxMessagesPerDay !== 0;
  };
  
  // Obtenir le nombre de messages restants aujourd'hui
  const getRemainingMessages = (): number => {
    if (accessRights.conversations.maxMessagesPerDay === -1) return Infinity;
    
    // TODO: Implémenter la logique de comptage réel
    return accessRights.conversations.maxMessagesPerDay;
  };
  
  // Déterminer le niveau requis pour une fonctionnalité
  const needsUpgrade = (feature: FeaturePath): SanctuaryLevel | null => {
    const result = checkAccess(feature);
    return result.upgradeRequired || null;
  };
  
  // Vérifier si une fonctionnalité est illimitée
  const isUnlimited = (feature: 'draws' | 'messages'): boolean => {
    if (feature === 'draws') {
      return accessRights.oracle.dailyDraws === -1;
    }
    if (feature === 'messages') {
      return accessRights.conversations.maxMessagesPerDay === -1;
    }
    return false;
  };
  
  return {
    userLevel,
    levelName: LEVEL_NAMES[userLevel],
    accessRights,
    canAccess,
    checkAccess,
    canDrawToday,
    getRemainingDraws,
    canSendMessage,
    getRemainingMessages,
    needsUpgrade,
    isUnlimited
  };
}

// =================== EXPORTS ===================

export default useSanctuaryAccess;

/**
 * EXEMPLES D'UTILISATION :
 * 
 * // 1. Vérification simple
 * const { canAccess } = useSanctuaryAccess();
 * if (canAccess('oracle.viewHistory')) {
 *   // Afficher l'historique
 * }
 * 
 * // 2. Vérification détaillée avec message
 * const { checkAccess } = useSanctuaryAccess();
 * const historyAccess = checkAccess('oracle.viewHistory');
 * if (!historyAccess.allowed) {
 *   toast.error(historyAccess.reason);
 * }
 * 
 * // 3. Vérification des quotas
 * const { getRemainingDraws, isUnlimited } = useSanctuaryAccess();
 * const remaining = getRemainingDraws();
 * console.log(`Tirages restants: ${isUnlimited('draws') ? '∞' : remaining}`);
 * 
 * // 4. Affichage conditionnel
 * const { canAccess, needsUpgrade } = useSanctuaryAccess();
 * {canAccess('synthesis.downloadPDF') ? (
 *   <DownloadButton />
 * ) : (
 *   <UpgradePrompt requiredLevel={needsUpgrade('synthesis.downloadPDF')} />
 * )}
 */
