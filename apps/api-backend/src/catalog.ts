// Oracle Lumira - Product Catalog
// Centralized source of truth for products and pricing

export interface Product {
  id: string;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  level: 'initie' | 'mystique' | 'profond';
  features: string[];
  metadata: {
    duration?: string;
    access?: string[];
    bonus?: string[];
  };
}

export const PRODUCT_CATALOG: Record<string, Product> = {
  'initie': {
    id: 'initie',
    name: 'Niveau Initié',
    description: 'Découverte des mystères fondamentaux',
    amountCents: 4900, // 49.00 EUR
    currency: 'eur',
    level: 'initie',
    features: [
      'Accès aux enseignements de base',
      'Méditations guidées',
      'Support communautaire'
    ],
    metadata: {
      duration: '3 mois',
      access: ['basic-content', 'community'],
      bonus: ['welcome-guide']
    }
  },

  'mystique': {
    id: 'mystique',
    name: 'Niveau Mystique',
    description: 'Approfondissement des connaissances ésotériques',
    amountCents: 9900, // 99.00 EUR
    currency: 'eur',
    level: 'mystique',
    features: [
      'Tout le contenu Initié',
      'Rituels avancés',
      'Sessions personnalisées',
      'Accès prioritaire aux événements'
    ],
    metadata: {
      duration: '6 mois',
      access: ['basic-content', 'advanced-content', 'community', 'events'],
      bonus: ['mystical-tools', 'private-sessions']
    }
  },

  'profond': {
    id: 'profond',
    name: 'Niveau Profond',
    description: 'Maîtrise complète des arts mystiques',
    amountCents: 19900, // 199.00 EUR
    currency: 'eur',
    level: 'profond',
    features: [
      'Accès illimité à tout le contenu',
      'Mentorat personnalisé',
      'Certification Oracle Lumira',
      'Accès aux archives secrètes',
      'Groupe élite privé'
    ],
    metadata: {
      duration: '12 mois',
      access: ['all-content', 'mentoring', 'certification', 'elite-group'],
      bonus: ['master-certification', 'exclusive-content', 'personal-mentor']
    }
  }
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
export const PRODUCT_LEVELS = ['initie', 'mystique', 'profond'] as const;
export type ProductLevel = typeof PRODUCT_LEVELS[number];

export default PRODUCT_CATALOG;
