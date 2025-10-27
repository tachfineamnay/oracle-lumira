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
  comingSoon?: boolean; // ✅ Ajout pour marquer niveau 4 comme "bientôt disponible"
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

// Données simulées des produits - FALLBACK SEULEMENT
// NOTE: Ces données sont utilisées UNIQUEMENT si l'API est indisponible
const MOCK_PRODUCTS_FALLBACK: ProductWithUpload[] = [
  {
    id: 'initie',
    title: 'Le Voile Initiatique',
    name: 'Niveau I : Le Voile Initiatique',
    description: 'Introduction aux langages symboliques, aux cycles vibratoires et aux fondements de l\'énergie cosmique.',
    duration: 'Illimité',
    price: 0, // ✅ GRATUIT
    badge: '✨ 100 PREMIERS CLIENTS',
    features: [
      'Lecture spirituelle PDF personnalisée',
      'Analyse complète de votre thème',
      'Guidance intuitive'
    ],
    order: 1,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.initie,
  },
  {
    id: 'mystique',
    title: 'Le Temple Mystique',
    name: 'Niveau II : Le Temple Mystique',
    description: 'Activation des rituels personnels et exploration des cartes archétypales avancées.',
    duration: 'Illimité',
    price: 47,
    badge: 'LE PLUS POPULAIRE',
    features: [
      'Tout le contenu Initié',
      'Lecture audio complète (voix sacrée)',
      'Guidance approfondie',
      'Support prioritaire'
    ],
    order: 2,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.mystique,
  },
  {
    id: 'profond',
    title: 'L\'Ordre Profond',
    name: 'Niveau III : L\'Ordre Profond',
    description: 'Maîtrise des cycles karmiques et lecture des codes fractals de l\'âme.',
    duration: 'Illimité',
    price: 67,
    features: [
      'Tout le contenu Mystique',
      'Mandala personnalisé HD',
      'Support visuel pour méditation',
      'Guide d\'activation du Mandala'
    ],
    order: 3,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.profond,
  },
  {
    id: 'integrale',
    title: 'L\'Intelligence Intégrale',
    name: 'Niveau IV : L\'Intelligence Intégrale',
    description: 'Cartographie complète de ta fréquence d\'âme, analyse karmique et modélisation multidimensionnelle.',
    duration: 'Illimité',
    price: -1, // ✅ Bientôt disponible (prix spécial pour désactiver)
    badge: 'BIENTÔT DISPONIBLE',
    features: [
      'Tout le contenu Profond',
      'Rituels personnalisés audio/vidéo',
      'Protocoles d\'activation',
      'Suivi personnalisé 30 jours'
    ],
    order: 4,
    uploadConfig: LEVEL_UPLOAD_CONFIGS.integrale,
    comingSoon: true, // ✅ Marquer explicitement comme "bientôt disponible"
  }
];

export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Charger les produits depuis l'API backend
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // ✅ APPEL API RÉEL au catalogue backend
        const apiBase = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiBase}/products`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const apiProducts = data.products || [];
        
        // Mapper les produits API vers le format ProductWithUpload
        const mappedProducts: ProductWithUpload[] = apiProducts.map((p: any) => ({
          id: p.id as ProductWithUpload['id'],
          title: p.name,
          name: p.name,
          description: p.description,
          duration: p.metadata?.duration || 'Illimité',
          price: p.amountCents / 100, // Convertir centimes en euros
          badge: p.limitedOffer || (p.id === 'mystique' ? 'LE PLUS POPULAIRE' : p.metadata?.comingSoon ? 'BIENTÔT DISPONIBLE' : undefined),
          features: p.features || [],
          order: p.id === 'initie' ? 1 : p.id === 'mystique' ? 2 : p.id === 'profond' ? 3 : 4,
          uploadConfig: LEVEL_UPLOAD_CONFIGS[p.id as ProductWithUpload['id']] || LEVEL_UPLOAD_CONFIGS.initie,
          comingSoon: p.metadata?.comingSoon || false, // ✅ Transférer comingSoon depuis l'API
        }));
        
        console.log('[useProducts] ✅ Produits chargés depuis API:', mappedProducts);
        setProducts(mappedProducts.sort((a, b) => a.order - b.order));
        setError(null);
      } catch (err) {
        console.warn('[useProducts] ⚠️ Échec chargement API, fallback vers données locales:', err);
        
        // ✅ FALLBACK: Utiliser les données locales si l'API échoue
        setProducts(MOCK_PRODUCTS_FALLBACK.sort((a, b) => a.order - b.order));
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
