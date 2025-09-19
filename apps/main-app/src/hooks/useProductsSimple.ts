import { useState, useEffect } from 'react';

export interface UploadConfig {
  maxFiles: number;
  allowedTypes: string[];
  maxSizeBytes: number;
  categories: string[];
}

export interface ProductWithUpload {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  features: string[];
  order: number;
  uploadConfig: UploadConfig;
}

// Map new canonical backend levels -> local mock IDs
// Allows passing either backend level (initie, mystique, ...) or mock id (explorer, ...)
const normalizeLevelId = (levelId: string): string => {
  const map: Record<string, string> = {
    initie: 'explorer',
    mystique: 'seeker',
    profond: 'mystic',
    integrale: 'oracle',
  };
  return map[levelId] || levelId;
};

// Configuration centralisée des uploads par niveau
const LEVEL_UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  explorer: {
    maxFiles: 3,
    allowedTypes: ['image/*', '.pdf'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    categories: ['Document Personnel', 'Photo Guidance'],
  },
  seeker: {
    maxFiles: 5,
    allowedTypes: ['image/*', '.pdf', '.doc', '.docx'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    categories: ['Document Personnel', 'Photo Guidance', 'Manuscrit'],
  },
  mystic: {
    maxFiles: 8,
    allowedTypes: ['image/*', '.pdf', '.doc', '.docx', '.txt'],
    maxSizeBytes: 15 * 1024 * 1024, // 15MB
    categories: ['Document Personnel', 'Photo Guidance', 'Manuscrit', 'Carte Personnelle'],
  },
  oracle: {
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

// Données simulées des produits
const MOCK_PRODUCTS: ProductWithUpload[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    price: 29,
    features: [
      'Analyse karmique de base',
      'Guidance spirituelle personnalisée',
      'Accès aux outils de divination',
      'Upload de 3 documents max'
    ],
    order: 1,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.explorer,
  },
  {
    id: 'seeker',
    title: 'Seeker',
    price: 59,
    originalPrice: 79,
    badge: 'Populaire',
    features: [
      'Analyse karmique approfondie',
      'Consultation personnalisée 30min',
      'Accès prioritaire aux nouveaux outils',
      'Upload de 5 documents max',
      'Interprétation de manuscrits'
    ],
    order: 2,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.seeker,
  },
  {
    id: 'mystic',
    title: 'Mystic',
    price: 99,
    originalPrice: 129,
    features: [
      'Analyse karmique experte',
      'Consultation privée 60min',
      'Création de mandala personnalisé',
      'Upload de 8 documents max',
      'Lecture de cartes personnelles'
    ],
    order: 3,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.mystic,
  },
  {
    id: 'oracle',
    title: 'Oracle',
    price: 199,
    originalPrice: 249,
    badge: 'Premium',
    features: [
      'Analyse karmique master',
      'Accompagnement personnalisé illimité',
      'Accès exclusif aux rituels avancés',
      'Upload de 15 documents max',
      'Support audio et symboles personnels',
      'Guidance oracle exclusive'
    ],
    order: 4,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.oracle,
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
  const normalized = normalizeLevelId(levelId);
  const product = products.find(p => p.id === normalized);
  
  return {
    product,
    isLoading,
    error
  };
};

export const useUploadConfig = (levelId: string) => {
  const normalized = normalizeLevelId(levelId);
  // Prefer product config if available, otherwise fall back to static config
  const { products } = useProducts();
  const product = products.find(p => p.id === normalized);
  return product?.uploadConfig || LEVEL_UPLOAD_CONFIGS[normalized] || null;
};

export const getLevelUploadConfig = (levelId: string): UploadConfig | null => {
  const normalized = normalizeLevelId(levelId);
  return LEVEL_UPLOAD_CONFIGS[normalized] || null;
};
