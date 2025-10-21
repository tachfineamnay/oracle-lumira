/**
 * Oracle Lumira - Matrice des Permissions du Sanctuaire
 * 
 * Cette configuration définit les niveaux d'accès pour chaque fonctionnalité
 * du Sanctuaire en fonction du niveau d'abonnement de l'utilisateur.
 * 
 * Créé le : 21 Octobre 2025
 * Statut : Prêt à l'emploi (non utilisé pour le moment)
 */

// =================== TYPES ===================

export enum SanctuaryLevel {
  FREE = 'free',
  PROFOND = 'profond',
  MYSTIQUE = 'mystique',
  INTEGRAL = 'integral'
}

export interface OracleAccess {
  dailyDraws: number;        // -1 = illimité
  responseTime: string;      // Délai de réponse (ex: "24h", "12h", "immediate")
  viewHistory: boolean;      // Voir l'historique des tirages
  detailedInterpretation: boolean;  // Interprétations détaillées
  drawTypes: string[];       // Types de tirages autorisés
}

export interface ProfileAccess {
  editBasicInfo: boolean;    // Modifier infos de base
  uploadPhotos: boolean;     // Upload photos visage/paume
  spiritualObjective: boolean; // Définir objectif spirituel
}

export interface SanctuaryAccess {
  access: boolean;           // Accès au sanctuaire personnel
  customization: boolean;    // Personnalisation interface
  meditationTools: boolean;  // Outils de méditation
  aiAssistant: boolean;      // Assistant IA spirituel
}

export interface SynthesisAccess {
  view: boolean;             // Voir la synthèse
  downloadPDF: boolean;      // Télécharger en PDF
  personalizedRecommendations: boolean; // Recommandations personnalisées
  aiAnalysis: boolean;       // Analyse IA approfondie
}

export interface ConversationsAccess {
  messageOracle: boolean;    // Envoyer messages à l'Oracle
  responseGuarantee: boolean; // Garantie de réponse
  prioritySupport: boolean;  // Support prioritaire
  maxMessagesPerDay: number; // -1 = illimité
}

export interface AccessRights {
  level: SanctuaryLevel;
  oracle: OracleAccess;
  profile: ProfileAccess;
  sanctuary: SanctuaryAccess;
  synthesis: SynthesisAccess;
  conversations: ConversationsAccess;
  pricing: {
    monthly: number;         // Prix mensuel en EUR
    yearly: number;          // Prix annuel en EUR
    currency: string;
  };
}

// =================== MATRICE DES PERMISSIONS ===================

/**
 * ACCESS_MATRIX - Configuration complète des permissions
 * 
 * Cette matrice définit exactement ce que chaque niveau peut faire.
 * Source : RAPPORT-AUDIT-COMPLET.md
 */
export const ACCESS_MATRIX: Record<SanctuaryLevel, AccessRights> = {
  
  // ===== NIVEAU FREE =====
  [SanctuaryLevel.FREE]: {
    level: SanctuaryLevel.FREE,
    oracle: {
      dailyDraws: 1,
      responseTime: '48h',
      viewHistory: false,
      detailedInterpretation: false,
      drawTypes: ['simple']
    },
    profile: {
      editBasicInfo: true,
      uploadPhotos: false,
      spiritualObjective: false
    },
    sanctuary: {
      access: false,
      customization: false,
      meditationTools: false,
      aiAssistant: false
    },
    synthesis: {
      view: false,
      downloadPDF: false,
      personalizedRecommendations: false,
      aiAnalysis: false
    },
    conversations: {
      messageOracle: false,
      responseGuarantee: false,
      prioritySupport: false,
      maxMessagesPerDay: 0
    },
    pricing: {
      monthly: 0,
      yearly: 0,
      currency: 'EUR'
    }
  },

  // ===== NIVEAU PROFOND =====
  [SanctuaryLevel.PROFOND]: {
    level: SanctuaryLevel.PROFOND,
    oracle: {
      dailyDraws: 3,
      responseTime: '24h',
      viewHistory: true,
      detailedInterpretation: true,
      drawTypes: ['simple', 'trois_cartes']
    },
    profile: {
      editBasicInfo: true,
      uploadPhotos: true,
      spiritualObjective: true
    },
    sanctuary: {
      access: true,
      customization: false,
      meditationTools: true,
      aiAssistant: false
    },
    synthesis: {
      view: true,
      downloadPDF: false,
      personalizedRecommendations: false,
      aiAnalysis: false
    },
    conversations: {
      messageOracle: true,
      responseGuarantee: false,
      prioritySupport: false,
      maxMessagesPerDay: 5
    },
    pricing: {
      monthly: 29.99,
      yearly: 299.99,
      currency: 'EUR'
    }
  },

  // ===== NIVEAU MYSTIQUE =====
  [SanctuaryLevel.MYSTIQUE]: {
    level: SanctuaryLevel.MYSTIQUE,
    oracle: {
      dailyDraws: -1, // Illimité
      responseTime: '12h',
      viewHistory: true,
      detailedInterpretation: true,
      drawTypes: ['simple', 'trois_cartes', 'croix_celtique']
    },
    profile: {
      editBasicInfo: true,
      uploadPhotos: true,
      spiritualObjective: true
    },
    sanctuary: {
      access: true,
      customization: true,
      meditationTools: true,
      aiAssistant: true
    },
    synthesis: {
      view: true,
      downloadPDF: true,
      personalizedRecommendations: true,
      aiAnalysis: true
    },
    conversations: {
      messageOracle: true,
      responseGuarantee: true,
      prioritySupport: true,
      maxMessagesPerDay: 20
    },
    pricing: {
      monthly: 59.99,
      yearly: 599.99,
      currency: 'EUR'
    }
  },

  // ===== NIVEAU INTÉGRAL =====
  [SanctuaryLevel.INTEGRAL]: {
    level: SanctuaryLevel.INTEGRAL,
    oracle: {
      dailyDraws: -1, // Illimité
      responseTime: 'immediate',
      viewHistory: true,
      detailedInterpretation: true,
      drawTypes: ['simple', 'trois_cartes', 'croix_celtique', 'personnalise']
    },
    profile: {
      editBasicInfo: true,
      uploadPhotos: true,
      spiritualObjective: true
    },
    sanctuary: {
      access: true,
      customization: true,
      meditationTools: true,
      aiAssistant: true
    },
    synthesis: {
      view: true,
      downloadPDF: true,
      personalizedRecommendations: true,
      aiAnalysis: true
    },
    conversations: {
      messageOracle: true,
      responseGuarantee: true,
      prioritySupport: true,
      maxMessagesPerDay: -1 // Illimité
    },
    pricing: {
      monthly: 99.99,
      yearly: 999.99,
      currency: 'EUR'
    }
  }
};

// =================== UTILITAIRES ===================

/**
 * Obtenir le nom convivial d'un niveau
 */
export const LEVEL_NAMES: Record<SanctuaryLevel, string> = {
  [SanctuaryLevel.FREE]: 'Gratuit',
  [SanctuaryLevel.PROFOND]: 'Niveau Profond',
  [SanctuaryLevel.MYSTIQUE]: 'Niveau Mystique',
  [SanctuaryLevel.INTEGRAL]: 'Niveau Intégral'
};

/**
 * Obtenir la couleur associée à un niveau (pour l'UI)
 */
export const LEVEL_COLORS: Record<SanctuaryLevel, { bg: string; text: string; border: string }> = {
  [SanctuaryLevel.FREE]: {
    bg: 'from-gray-400/10 to-gray-500/5',
    text: 'text-gray-400',
    border: 'border-gray-400/30'
  },
  [SanctuaryLevel.PROFOND]: {
    bg: 'from-purple-400/10 to-purple-500/5',
    text: 'text-purple-400',
    border: 'border-purple-400/30'
  },
  [SanctuaryLevel.MYSTIQUE]: {
    bg: 'from-pink-400/10 to-pink-500/5',
    text: 'text-pink-400',
    border: 'border-pink-400/30'
  },
  [SanctuaryLevel.INTEGRAL]: {
    bg: 'from-amber-400/10 to-amber-500/5',
    text: 'text-amber-400',
    border: 'border-amber-400/30'
  }
};

/**
 * Vérifier si un niveau est supérieur à un autre
 */
export function isLevelHigherOrEqual(userLevel: SanctuaryLevel, requiredLevel: SanctuaryLevel): boolean {
  const hierarchy = [
    SanctuaryLevel.FREE,
    SanctuaryLevel.PROFOND,
    SanctuaryLevel.MYSTIQUE,
    SanctuaryLevel.INTEGRAL
  ];
  
  const userIndex = hierarchy.indexOf(userLevel);
  const requiredIndex = hierarchy.indexOf(requiredLevel);
  
  return userIndex >= requiredIndex;
}
