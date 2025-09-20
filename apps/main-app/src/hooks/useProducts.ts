// Oracle Lumira - Hook pour produits dynamiques (sans react-query)
import { useEffect, useMemo, useState } from 'react';
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

const getLevelUploadConfig = (level: string) => {
  const configs = {
    initie: {
      maxFiles: 1,
      allowedTypes: ['image/jpeg', 'image/png'],
      requiredFields: ['photo'],
      maxSizeBytes: 5 * 1024 * 1024,
    },
    mystique: {
      maxFiles: 2,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      requiredFields: ['photo', 'document'],
      maxSizeBytes: 10 * 1024 * 1024,
    },
    profond: {
      maxFiles: 3,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'audio/mpeg', 'audio/wav'],
      requiredFields: ['photo', 'document', 'audio'],
      maxSizeBytes: 20 * 1024 * 1024,
    },
    integrale: {
      maxFiles: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'audio/mpeg', 'audio/wav', 'video/mp4'],
      requiredFields: ['photo', 'document', 'audio', 'video'],
      maxSizeBytes: 50 * 1024 * 1024,
    },
  } as const;
  return (configs as any)[level] || configs.initie;
};

const levelOrder = ['initie', 'mystique', 'profond', 'integrale'] as const;

export const useProducts = () => {
  const [data, setData] = useState<ProductWithLevel[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const products = await ProductOrderService.getCatalog();
        const enriched = products
          .map((p) => ({
            ...p,
            displayOrder: levelOrder.indexOf(p.level as any),
            uploadConfig: getLevelUploadConfig(p.level),
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        if (mounted) setData(enriched);
      } catch (e: any) {
        if (mounted) setError(e instanceof Error ? e : new Error('Failed to load products'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading, error };
};

export const useProductByLevel = (level: string) => {
  const { data, isLoading, error } = useProducts();
  const product = useMemo(() => data?.find((p) => p.level === level) || null, [data, level]);
  return { data: product, isLoading, error };
};

export const useUploadConfig = (level: string) => {
  const { data: product } = useProductByLevel(level);
  return product?.uploadConfig || null;
};
