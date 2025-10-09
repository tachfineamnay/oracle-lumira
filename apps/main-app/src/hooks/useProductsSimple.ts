import { useState, useEffect } from 'react';

export interface UploadConfig {
  maxFiles: number;
  allowedTypes: string[];
  maxSizeBytes: number;
  categories: string[];
}

export interface ProductWithUpload {
  id: 'initie' | 'mystique' | 'profond' | 'integrale';
  title: string;
  name?: string;
  description?: string;
  duration?: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  features: string[];
  order: number;
  uploadConfig: UploadConfig;
}

// Configuration centralisée des uploads par niveau (IDs canoniques backend)
const LEVEL_UPLOAD_CONFIGS: Record<ProductWithUpload['id'], UploadConfig> = {
  initie: {
    maxFiles: 3,
    allowedTypes: ['image/*', '.pdf'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    categories: ['Document Personnel', 'Photo Guidance'],
  },
  mystique: {
    maxFiles: 5,
    allowedTypes: ['image/*', '.pdf', '.doc', '.docx'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    categories: ['Document Personnel', 'Photo Guidance', 'Manuscrit'],
  },
  profond: {
    maxFiles: 8,
    allowedTypes: ['image/*', '.pdf', '.doc', '.docx', '.txt'],
    maxSizeBytes: 15 * 1024 * 1024, // 15MB
    categories: ['Document Personnel', 'Photo Guidance', 'Manuscrit', 'Carte Personnelle'],
  },
  integrale: {
    maxFiles: 15,
    allowedTypes: ['image/*', '.pdf', '.doc', '.docx', '.txt', 'audio/*'],
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    categories: [
      'Document Personnel',
      'Photo Guidance',
      'Manuscrit',
      'Carte Personnelle',
      'Enregistrement Audio',
      'Symbole Personnel',
    ],
  },
};

// Données simulées des produits (IDs canoniques backend)
const MOCK_PRODUCTS: ProductWithUpload[] = [
  {
    id: 'initie',
    title: 'Le Voile Initiatique',
    name: 'Niveau I : Le Voile Initiatique',
    description: 'Introduction aux langages symboliques, aux cycles vibratoires et aux fondements de l\'énergie cosmique.',
    duration: '3 mois',
    price: 27,
    features: [
      'Lexique vibratoire et cosmique',
      'Méditations d\'ancrage stellaire',
      'Cercle communautaire d\'Initiés'
    ],
    order: 1,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.initie,
  },
  {
    id: 'mystique',
    title: 'Le Temple Mystique',
    name: 'Niveau II : Le Temple Mystique',
    description: 'Activation des rituels personnels et exploration des cartes archétypales avancées.',
    duration: '6 mois',
    price: 47,
    badge: 'LE PLUS POPULAIRE',
    features: [
      'Accès au contenu Initiatique',
      'Rituels de transmutation',
      'Sessions d\'alignement vibratoire',
      'Portails événementiels prioritaires'
    ],
    order: 2,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.mystique,
  },
  {
    id: 'profond',
    title: 'L\'Ordre Profond',
    name: 'Niveau III : L\'Ordre Profond',
    description: 'Maîtrise des cycles karmiques et lecture des codes fractals de l\'âme.',
    duration: '12 mois',
    price: 67,
    features: [
      'Accès illimité aux enseignements',
      'Mentorat vibratoire personnalisé',
      'Archives occultes numérologiques',
      'Certification Oracle Lumira',
      'Accès au Cercle Fermé'
    ],
    order: 3,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.profond,
  },
  {
    id: 'integrale',
    title: 'L\'Intelligence Intégrale',
    name: 'Niveau IV : L\'Intelligence Intégrale',
    description: 'Cartographie complète de ta fréquence d\'âme, analyse karmique et modélisation multidimensionnelle.',
    duration: '12 mois',
    price: 97,
    badge: 'EXPÉRIENCE ULTIME',
    features: [
      'Lecture des cycles de vie',
      'Lignée et mémoire karmique',
      'Synthèse audio vibratoire',
      'Mandala HD à haute fréquence',
      'Suivi vibratoire 30 jours'
    ],
    order: 4,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.integrale,
  }
];

export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simuler un appel API
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // Simulation d'un délai réseau
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Ici on pourrait faire un vrai appel API
        // const response = await fetch('/api/products');
        // const data = await response.json();
        
        setProducts(MOCK_PRODUCTS.sort((a, b) => a.order - b.order));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, isLoading, error };
};

export const useProductByLevel = (levelId: string) => {
  const { products, isLoading, error } = useProducts();
  const product = products.find(p => p.id === levelId);
  
  return {
    product,
    isLoading,
    error
  };
};

export const useUploadConfig = (levelId: string) => {
  // Prefer product config if available, otherwise fall back to static config
  const { products } = useProducts();
  const product = products.find(p => p.id === levelId);
  return product?.uploadConfig || LEVEL_UPLOAD_CONFIGS[levelId as ProductWithUpload['id']] || null;
};

export const getLevelUploadConfig = (levelId: string): UploadConfig | null => {
  return LEVEL_UPLOAD_CONFIGS[levelId as ProductWithUpload['id']] || null;
};
