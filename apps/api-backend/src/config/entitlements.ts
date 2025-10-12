/**
 * Oracle Lumira - Système d'Entitlements
 * Source de vérité centralisée pour les capacités et permissions par niveau
 * 
 * Ce fichier définit le contrat "Produit -> Capacités" qui régit
 * l'expérience utilisateur dans le Sanctuaire.
 */

// =================== DÉFINITION DES CAPACITÉS ===================

export const CAPABILITIES = {
  // Contenus de base
  CONTENT_BASIC: 'content.basic',
  CONTENT_ADVANCED: 'content.advanced',
  CONTENT_EXPERT: 'content.expert',
  CONTENT_FULL: 'content.full',
  
  // Méditations et pratiques
  MEDITATIONS: 'meditations.access',
  MEDITATIONS_ADVANCED: 'meditations.advanced',
  RITUALS: 'rituals.access',
  RITUALS_PERSONALIZED: 'rituals.personalized',
  
  // Lectures Oracle
  READINGS_PDF: 'readings.pdf',
  READINGS_AUDIO: 'readings.audio',
  READINGS_FULL: 'readings.full',
  
  // Audio et formats
  AUDIO_BASIC: 'audio.basic',
  AUDIO_FULL: 'audio.full',
  AUDIO_PREMIUM: 'audio.premium',
  
  // Mandala
  MANDALA_BASIC: 'mandala.basic',
  MANDALA_HD: 'mandala.hd',
  MANDALA_PERSONALIZED: 'mandala.personalized',
  
  // Analyses approfondies
  SOUL_PROFILE: 'analysis.soul_profile',
  KARMIC_LINE: 'analysis.karmic_line',
  LIFE_CYCLES: 'analysis.life_cycles',
  BLOCKAGES_ANALYSIS: 'analysis.blockages',
  MISSION_ANALYSIS: 'analysis.mission',
  
  // Mentorat et suivi
  MENTORAT: 'mentorat.access',
  MENTORAT_PERSONALIZED: 'mentorat.personalized',
  FOLLOW_UP_7D: 'followup.7days',
  FOLLOW_UP_30D: 'followup.30days',
  
  // Communauté
  COMMUNITY_ACCESS: 'community.access',
  COMMUNITY_PRIORITY: 'community.priority',
  COMMUNITY_ELITE: 'community.elite',
  
  // Événements
  EVENTS_ACCESS: 'events.access',
  EVENTS_PRIORITY: 'events.priority',
  
  // Uploads et personnalisation
  UPLOAD_PHOTOS: 'upload.photos',
  UPLOAD_DOCUMENTS: 'upload.documents',
  
  // Sanctuaire - Sphères d'accès
  SPHERE_PROFILE: 'sanctuaire.sphere.profile',
  SPHERE_READINGS: 'sanctuaire.sphere.readings',
  SPHERE_RITUALS: 'sanctuaire.sphere.rituals',
  SPHERE_MANDALA: 'sanctuaire.sphere.mandala',
  SPHERE_SYNTHESIS: 'sanctuaire.sphere.synthesis',
  SPHERE_GUIDANCE: 'sanctuaire.sphere.guidance',
} as const;

// Type pour la validation TypeScript
export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES];

// =================== PERMISSIONS DE BASE PAR NIVEAU ===================

/**
 * Définit les capacités intrinsèques à chaque niveau
 * (sans héritage - celui-ci est géré par resolveCapabilities)
 */
const basePermissions: Record<string, Capability[]> = {
  'initie': [
    CAPABILITIES.CONTENT_BASIC,
    CAPABILITIES.MEDITATIONS,
    CAPABILITIES.READINGS_PDF,
    CAPABILITIES.AUDIO_BASIC,
    CAPABILITIES.MANDALA_BASIC,
    CAPABILITIES.COMMUNITY_ACCESS,
    CAPABILITIES.UPLOAD_PHOTOS,
    CAPABILITIES.SPHERE_PROFILE,
    CAPABILITIES.SPHERE_READINGS,
  ],
  
  'mystique': [
    CAPABILITIES.CONTENT_ADVANCED,
    CAPABILITIES.MEDITATIONS_ADVANCED,
    CAPABILITIES.RITUALS,
    CAPABILITIES.READINGS_AUDIO,
    CAPABILITIES.AUDIO_FULL,
    CAPABILITIES.SOUL_PROFILE,
    CAPABILITIES.BLOCKAGES_ANALYSIS,
    CAPABILITIES.EVENTS_ACCESS,
    CAPABILITIES.FOLLOW_UP_7D,
    CAPABILITIES.SPHERE_RITUALS,
    CAPABILITIES.SPHERE_MANDALA,
  ],
  
  'profond': [
    CAPABILITIES.CONTENT_EXPERT,
    CAPABILITIES.RITUALS_PERSONALIZED,
    CAPABILITIES.MANDALA_HD,
    CAPABILITIES.MENTORAT,
    CAPABILITIES.KARMIC_LINE,
    CAPABILITIES.LIFE_CYCLES,
    CAPABILITIES.COMMUNITY_PRIORITY,
    CAPABILITIES.EVENTS_PRIORITY,
    CAPABILITIES.UPLOAD_DOCUMENTS,
    CAPABILITIES.SPHERE_SYNTHESIS,
  ],
  
  'integrale': [
    CAPABILITIES.CONTENT_FULL,
    CAPABILITIES.READINGS_FULL,
    CAPABILITIES.AUDIO_PREMIUM,
    CAPABILITIES.MANDALA_PERSONALIZED,
    CAPABILITIES.MENTORAT_PERSONALIZED,
    CAPABILITIES.MISSION_ANALYSIS,
    CAPABILITIES.FOLLOW_UP_30D,
    CAPABILITIES.COMMUNITY_ELITE,
    CAPABILITIES.SPHERE_GUIDANCE,
  ],
};

// =================== RÉSOLUTION DES CAPACITÉS AVEC HÉRITAGE ===================

/**
 * Résout toutes les capacités d'un niveau en appliquant l'héritage hiérarchique
 * 
 * Hiérarchie: Intégrale > Profond > Mystique > Initié
 * 
 * @param level - Le niveau du produit (initie, mystique, profond, integrale)
 * @returns Array de toutes les capacités débloquées (avec héritage)
 */
function resolveCapabilities(level: string): Capability[] {
  const capabilities = new Set<Capability>();
  
  // Fonction récursive pour appliquer l'héritage
  const addCapabilitiesForLevel = (currentLevel: string) => {
    const perms = basePermissions[currentLevel];
    if (perms) {
      perms.forEach(cap => capabilities.add(cap));
    }
  };
  
  // Appliquer l'héritage selon la hiérarchie
  switch (level.toLowerCase()) {
    case 'integrale':
      addCapabilitiesForLevel('initie');
      addCapabilitiesForLevel('mystique');
      addCapabilitiesForLevel('profond');
      addCapabilitiesForLevel('integrale');
      break;
      
    case 'profond':
      addCapabilitiesForLevel('initie');
      addCapabilitiesForLevel('mystique');
      addCapabilitiesForLevel('profond');
      break;
      
    case 'mystique':
      addCapabilitiesForLevel('initie');
      addCapabilitiesForLevel('mystique');
      break;
      
    case 'initie':
      addCapabilitiesForLevel('initie');
      break;
      
    default:
      console.warn(`[ENTITLEMENTS] Niveau inconnu: ${level}, utilisation du niveau Initié par défaut`);
      addCapabilitiesForLevel('initie');
  }
  
  return Array.from(capabilities);
}

// =================== EXPORT DE LA CARTOGRAPHIE PRODUIT -> CAPACITÉS ===================

/**
 * Cartographie finale: chaque productId est lié à toutes ses capacités (avec héritage résolu)
 */
export const productCapabilities: Record<string, Capability[]> = {
  'initie': resolveCapabilities('initie'),
  'mystique': resolveCapabilities('mystique'),
  'profond': resolveCapabilities('profond'),
  'integrale': resolveCapabilities('integrale'),
};

// =================== FONCTIONS UTILITAIRES ===================

/**
 * Récupère les capacités pour un produit donné
 */
export function getCapabilitiesForProduct(productId: string): Capability[] {
  return productCapabilities[productId.toLowerCase()] || [];
}

/**
 * Vérifie si un produit débloque une capacité spécifique
 */
export function productHasCapability(productId: string, capability: Capability): boolean {
  const capabilities = getCapabilitiesForProduct(productId);
  return capabilities.includes(capability);
}

/**
 * Agrège les capacités de plusieurs produits (pour un utilisateur avec plusieurs achats)
 */
export function aggregateCapabilities(productIds: string[]): Capability[] {
  const allCapabilities = new Set<Capability>();
  
  productIds.forEach(productId => {
    const capabilities = getCapabilitiesForProduct(productId);
    capabilities.forEach(cap => allCapabilities.add(cap));
  });
  
  return Array.from(allCapabilities);
}

/**
 * Détermine le niveau le plus élevé parmi plusieurs produits
 */
export function getHighestLevel(productIds: string[]): string | null {
  const levelHierarchy = ['initie', 'mystique', 'profond', 'integrale'];
  
  let highestLevel: string | null = null;
  let highestIndex = -1;
  
  productIds.forEach(productId => {
    const index = levelHierarchy.indexOf(productId.toLowerCase());
    if (index > highestIndex) {
      highestIndex = index;
      highestLevel = productId.toLowerCase();
    }
  });
  
  return highestLevel;
}

/**
 * Retourne les métadonnées d'un niveau (pour affichage UI)
 */
export function getLevelMetadata(level: string) {
  const metadata: Record<string, { name: string; color: string; icon: string }> = {
    'initie': {
      name: 'Initié',
      color: '#4F46E5', // Indigo
      icon: '🌟'
    },
    'mystique': {
      name: 'Mystique',
      color: '#7C3AED', // Violet
      icon: '🔮'
    },
    'profond': {
      name: 'Profond',
      color: '#DB2777', // Rose
      icon: '✨'
    },
    'integrale': {
      name: 'Intégral',
      color: '#059669', // Emeraude
      icon: '🌌'
    }
  };
  
  return metadata[level.toLowerCase()] || metadata['initie'];
}

// Export par défaut
export default {
  CAPABILITIES,
  productCapabilities,
  getCapabilitiesForProduct,
  productHasCapability,
  aggregateCapabilities,
  getHighestLevel,
  getLevelMetadata,
};
