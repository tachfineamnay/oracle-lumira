// Oracle Lumira - Product Catalog
// Centralized source of truth for products and pricing

export interface Product {
  id: string;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  level: 'initie' | 'mystique' | 'profond' | 'integrale';
  features: string[];
  metadata: {
    duration?: string;
    access?: string[];
    bonus?: string[];
    comingSoon?: boolean;  // MVP: Niveau 4 bientot disponible
  };
}

export const PRODUCT_CATALOG: Record<string, Product> = {
  initie: {
    id: 'initie',
    name: 'Niveau Initié',
    description: 'Découvrez votre lecture spirituelle personnalisée',
    amountCents: 0, // GRATUIT - MVP
    currency: 'eur',
    level: 'initie',
    features: [
      'Lecture spirituelle PDF personnalisée',
      'Analyse complète de votre thème',
      'Guidance intuitive',
    ],
    metadata: {
      duration: 'Illimité',
      access: ['pdf'],
      bonus: ['welcome-guide'],
    },
  },

  mystique: {
    id: 'mystique',
    name: 'Niveau Mystique',
    description: 'Approfondissez votre connaissance spirituelle',
    amountCents: 4700, // 47.00 EUR
    currency: 'eur',
    level: 'mystique',
    features: [
      'Tout le contenu Initié',
      'Lecture audio complète (voix sacrée)',
      'Guidance approfondie',
      'Support prioritaire',
    ],
    metadata: {
      duration: 'Illimité',
      access: ['pdf', 'audio'],
      bonus: ['audio-meditation'],
    },
  },

  profond: {
    id: 'profond',
    name: 'Niveau Profond',
    description: 'Expérience complète avec votre Mandala sacré',
    amountCents: 6700, // 67.00 EUR
    currency: 'eur',
    level: 'profond',
    features: [
      'Tout le contenu Mystique',
      'Mandala personnalisé HD',
      'Support visuel pour méditation',
      'Guide d\'activation du Mandala',
    ],
    metadata: {
      duration: 'Illimité',
      access: ['pdf', 'audio', 'mandala'],
      bonus: ['mandala-guide'],
    },
  },

  integrale: {
    id: 'integrale',
    name: 'Niveau Intégral',
    description: 'Transformation complète avec rituels personnalisés (Bientôt disponible)',
    amountCents: 9700, // 97.00 EUR (à venir)
    currency: 'eur',
    level: 'integrale',
    features: [
      'Tout le contenu Profond',
      'Rituels personnalisés audio/vidéo',
      'Protocoles d\'activation',
      'Suivi personnalisé 30 jours',
      'Accès aux cycles lunaires',
    ],
    metadata: {
      duration: 'Illimité',
      access: ['pdf', 'audio', 'mandala', 'rituals'],
      bonus: ['ritual-kit', 'lunar-calendar', 'personal-support'],
      comingSoon: true,
    },
  },
};

// Helper functions
export const getProductById = (productId: string): Product | null => {
  return PRODUCT_CATALOG[productId] || null;
};

export const validateProductId = (productId: string): boolean => {
  return productId in PRODUCT_CATALOG;
};

export const formatPrice = (amountCents: number, currency: string = 'eur'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
};

export const getAllProducts = (): Product[] => {
  return Object.values(PRODUCT_CATALOG);
};

// Metadata for frontend integration
export const PRODUCT_LEVELS = ['initie', 'mystique', 'profond', 'integrale'] as const;
export type ProductLevel = typeof PRODUCT_LEVELS[number];

export default PRODUCT_CATALOG;

