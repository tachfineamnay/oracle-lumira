// Oracle Lumira - Frontend types for product ordering
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
  };
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
  productName: string;
}

export interface OrderStatus {
  order: {
    id: string;
    productId: string;
    customerEmail?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentIntentId: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    metadata?: Record<string, any>;
  };
  product: {
    id: string;
    name: string;
    level: string;
  };
  accessGranted: boolean;
  sanctuaryUrl?: string;
}

export interface PaymentFormData {
  customerEmail: string;
  productId: string;
}

export interface StripePaymentElementOptions {
  layout: 'tabs' | 'accordion';
  business?: {
    name: string;
  };
}

export interface PaymentRequestButtonOptions {
  country: string;
  currency: string;
  total: {
    label: string;
    amount: number;
  };
  requestPayerName: boolean;
  requestPayerEmail: boolean;
}

export const PRODUCT_CATALOG: Record<string, Omit<Product, 'amountCents'> & { price: string }> = {
  'initie': {
    id: 'initie',
    name: 'Niveau Initié',
    description: 'Découverte des mystères fondamentaux',
    price: '49€',
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
    price: '99€',
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
    price: '199€',
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
  ,
  'integrale': {
    id: 'integrale',
    name: 'Niveau Intégral',
    description: 'Expérience complète multidimensionnelle',
    price: '97€',
    currency: 'eur',
    level: 'integrale',
    features: [
      'Mission d’âme',
      'Ligne karmique',
      'Cycles de vie',
      'Audio complet',
      'Mandala personnalisé',
      'Suivi 30 jours'
    ],
    metadata: {
      duration: '12 mois',
      access: ['all-content', 'mentoring', 'certification', 'elite-group'],
      bonus: ['master-certification', 'exclusive-content', 'personal-mentor']
    }
  }
};
