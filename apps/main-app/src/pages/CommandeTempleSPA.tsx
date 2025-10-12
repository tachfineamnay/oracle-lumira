import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { UnifiedCheckoutForm } from '../components/checkout/UnifiedCheckoutForm';
import ProductOrderService from '../services/productOrder';
import type { Product as CatalogProduct } from '../types/products';

/**
 * CommandeTempleSPA - Page de Checkout Refonte 2025
 * 
 * Nouvelle architecture:
 * - Wrapper léger (récupère le produit)
 * - Délègue tout le formulaire à UnifiedCheckoutForm
 * - Gestion du success redirect
 * 
 * Changements majeurs vs ancienne version:
 * ✅ Plus de séparation form/payment
 * ✅ Express payments EN PREMIER
 * ✅ Floating labels modernes
 * ✅ Validation temps réel
 * ✅ Stripe Elements styled identiquement
 * ✅ Mobile-first UX
 */

type CheckoutProduct = CatalogProduct & {
  _id?: string; // legacy support if backend sends Mongo ObjectId
  active?: boolean;
};

const CommandeTempleSPA = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Support both 'product' and 'productId' URL params (slug-based by default)
  const productParam =
    searchParams.get('product') ||
    searchParams.get('productId') ||
    'mystique';

  const [product, setProduct] = useState<CheckoutProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const catalog = (await ProductOrderService.getCatalog()) as CheckoutProduct[];
        
        // Try to find product by:
        // 1. Exact id (preferred) or legacy _id match
        // 2. Case-insensitive name match (for slugs like "initie", "mystique")
        let foundProduct = catalog.find(
          (p) => p.id === productParam || p._id === productParam
        );

        if (!foundProduct) {
          // Try matching by name (case-insensitive) - with safety checks
          const normalizedParam = productParam.toLowerCase();
          foundProduct = catalog.find(p => {
            if (!p.name || typeof p.name !== 'string') return false;
            const productName = p.name.toLowerCase();
            return (
              productName.includes(normalizedParam) ||
              productName.replace(/\s+/g, '-') === normalizedParam ||
              productName.replace(/\s+/g, '') === normalizedParam
            );
          });
        }

        if (foundProduct) {
          // Ensure we always have a usable id for downstream components
          const normalizedProduct: CheckoutProduct = {
            ...foundProduct,
            id: foundProduct.id || foundProduct._id || productParam,
          };

          if (!foundProduct.id && foundProduct._id) {
            console.warn('Product missing id field, falling back to legacy _id', {
              legacyId: foundProduct._id,
            });
          }

          setProduct(normalizedProduct);
        } else {
          console.error('Product not found. Search term:', productParam);
          console.error('Available products:', catalog.map(p => ({
            id: p.id,
            legacyId: p._id,
            name: p.name || 'NO_NAME',
            active: p.active,
          })));
          setError('Produit non trouvé');
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Impossible de charger le produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productParam]);

  // Handle payment success
  const handlePaymentSuccess = (orderId: string, email: string) => {
    console.log('✅ Payment succeeded:', { orderId, email });
    
    // Store success info in sessionStorage
    sessionStorage.setItem(
      'payment_success',
      JSON.stringify({
        orderId,
        email,
        timestamp: Date.now(),
      })
    );

    // Redirect to success page
    navigate(`/payment-success?orderId=${orderId}&email=${encodeURIComponent(email)}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0514] via-[#1a0b2e] to-[#0A0514] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-mystical-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg tracking-wide">
            Chargement de votre commande...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0514] via-[#1a0b2e] to-[#0A0514] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-gradient-to-br from-mystical-night/60 to-mystical-purple/40 backdrop-blur-md border border-red-500/50 rounded-2xl p-8 text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-300 mb-6">
            {error || 'Le produit demandé est introuvable.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-mystical-gold to-cosmic-gold text-mystical-night font-bold rounded-xl hover:scale-105 transition-transform"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0514] via-[#1a0b2e] to-[#0A0514] py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-mystical-gold/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mystical-purple/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-mystical-gold via-cosmic-gold to-mystical-gold mb-2 tracking-tight">
            Finaliser votre commande
          </h1>
          <p className="text-gray-400 tracking-wide">
            Quelques instants vous séparent de votre lecture karmique
          </p>
        </motion.div>

        {/* Unified Checkout Form */}
        <UnifiedCheckoutForm
          productId={product.id}
          productName={product.name}
          amountCents={product.amountCents}
          features={product.features || []}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};

export default CommandeTempleSPA;
