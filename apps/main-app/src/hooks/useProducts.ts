// Oracle Lumira - Hook pour produits dynamiques synchronisés
import { useQuery } from '@tanstack/react-query';
import ProductOrderService from '../services/productOrder';
import type { Product } from '../types/products';

export interface ProductWithLevel extends Product {
  displayOrder: number;
  uploadConfig: {
    maxFiles: number;
    allowedTypes: string[];
    requiredFields: string[];
    maxSizeBytes: number;
  };
}

// Configuration upload par niveau
const getLevelUploadConfig = (level: string) => {
  const configs = {
    'initie': {
      maxFiles: 1,
      allowedTypes: ['image/jpeg', 'image/png'],
      requiredFields: ['photo'],
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
    },
    'mystique': {
      maxFiles: 2,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      requiredFields: ['photo', 'document'],
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
    },
    'profond': {
      maxFiles: 3,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'audio/mpeg', 'audio/wav'],
      requiredFields: ['photo', 'document', 'audio'],
      maxSizeBytes: 20 * 1024 * 1024, // 20MB
    },
    'integrale': {
      maxFiles: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'audio/mpeg', 'audio/wav', 'video/mp4'],
      requiredFields: ['photo', 'document', 'audio', 'video'],
      maxSizeBytes: 50 * 1024 * 1024, // 50MB
    },
  };
  
  return configs[level as keyof typeof configs] || configs.initie;
};

// Ordre d'affichage des niveaux
const levelOrder = ['initie', 'mystique', 'profond', 'integrale'] as const;

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductWithLevel[]> => {
      const products = await ProductOrderService.getCatalog();
      
      // Enrichissement avec config upload et ordre d'affichage
      return products
        .map((product, index) => ({
          ...product,
          displayOrder: levelOrder.indexOf(product.level),
          uploadConfig: getLevelUploadConfig(product.level),
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook pour un produit spécifique par niveau
export const useProductByLevel = (level: string) => {
  const { data: products, ...rest } = useProducts();
  
  return {
    ...rest,
    data: products?.find(product => product.level === level),
  };
};

// Hook pour configuration upload d'un niveau
export const useUploadConfig = (level: string) => {
  const { data: product } = useProductByLevel(level);
  return product?.uploadConfig || null;
};