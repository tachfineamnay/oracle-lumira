// Oracle Lumira - Frontend types for product ordering

export interface Product {
  id: string;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  level: 'initie' | 'mystique' | 'profond' | 'integrale';
  features: string[];
  limitedOffer?: string;  // PASSAGE 26: Message offre limitee (ex: "100 premiers clients")
  metadata: {
    duration?: string;
    access?: string[];
    bonus?: string[];
    comingSoon?: boolean;  // Pour niveau 4
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

// Temporary local catalog for UI defaults (prices as display strings)
// IMPORTANT: Les prix DOIVENT etre charges depuis l'API (/api/products)
// Ce catalog est un FALLBACK uniquement si l'API est indisponible
export const PRODUCT_CATALOG: Record<string, Omit<Product, 'amountCents'> & { price: string }> = {
  initie: {
    id: 'initie',
    name: 'Niveau Initié',
    description: 'Découvrez votre lecture spirituelle personnalisée',
    price: 'Gratuit',
    currency: 'eur',
    level: 'initie',
    limitedOffer: '✨ Valable pour les 100 premiers clients',  // PASSAGE 26
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
    price: '47€',
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
    price: '67€',
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
    description: 'Transformation complète avec rituels personnalisés',
    price: 'Bientôt',
    currency: 'eur',
    level: 'integrale',
    features: [
      'Tout le contenu Profond',
      'Rituels personnalisés audio/vidéo',
      'Protocoles d\'activation',
      'Suivi personnalisé 30 jours',
    ],
    metadata: {
      duration: 'Illimité',
      access: ['pdf', 'audio', 'mandala', 'rituals'],
      bonus: ['ritual-kit', 'lunar-calendar'],
      comingSoon: true,
    },
  },
};

