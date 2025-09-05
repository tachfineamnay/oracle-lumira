import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, CreditCard, ArrowLeft } from 'lucide-react';

interface OrderSummary {
  level: number;
  basePrice: number;
  upsells: {
    mandala: boolean;
    audio: boolean;
    rituel: boolean;
    pack: boolean;
  };
  totalPrice: number;
}

const CommandeTemple: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Extract level from URL params
  const urlParams = new URLSearchParams(location.search);
  const level = parseInt(urlParams.get('level') || '1');
  
  const [order, setOrder] = useState<OrderSummary>({
    level,
    basePrice: level === 1 ? 0 : level === 2 ? 14 : level === 3 ? 29 : 49,
    upsells: {
      mandala: false,
      audio: false,
      rituel: false,
      pack: false
    },
    totalPrice: level === 1 ? 0 : level === 2 ? 14 : level === 3 ? 29 : 49
  });

  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    birthDate: '',
    intention: '',
    blockages: '',
    familyHistory: ''
  });

  const levelNames = {
    1: 'Lecture Simple',
    2: 'Lecture Intuitive', 
    3: 'Lecture Alchimique',
    4: 'Lecture Intégrale'
  };

  const upsellPrices = useMemo(() => ({
    mandala: 19,
    audio: 14,
    rituel: 22,
    pack: 49
  }), []);

  useEffect(() => {
    // Recalculate total price
    let total = order.basePrice;
    if (order.upsells.pack) {
      total += upsellPrices.pack;
    } else {
      if (order.upsells.mandala) total += upsellPrices.mandala;
      if (order.upsells.audio) total += upsellPrices.audio;
      if (order.upsells.rituel) total += upsellPrices.rituel;
    }
    setOrder(prev => ({ ...prev, totalPrice: total }));
  }, [order.upsells, order.basePrice, upsellPrices]);

  const handleUpsellToggle = (upsell: keyof typeof order.upsells) => {
    setOrder(prev => ({
      ...prev,
      upsells: {
        ...prev.upsells,
        [upsell]: !prev.upsells[upsell]
      }
    }));
  };

  const handlePayment = async () => {
    setLoading(true);
    // Mock payment process
    setTimeout(() => {
      setLoading(false);
      navigate('/confirmation?success=true');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-mystical-dark text-white py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-mystical-gold hover:text-mystical-gold-light mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          
          <h1 className="font-playfair italic text-4xl md:text-5xl font-medium mb-4">
            Finaliser votre{' '}
            <span className="bg-gradient-to-r from-mystical-gold to-mystical-amber bg-clip-text text-transparent">
              {levelNames[level as keyof typeof levelNames]}
            </span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
              <h3 className="font-playfair italic text-2xl font-medium mb-4 text-mystical-gold">
                Récapitulatif
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-mystical-gold/20">
                  <span className="font-inter">{levelNames[level as keyof typeof levelNames]}</span>
                  <span className="text-mystical-gold font-medium">{order.basePrice}€</span>
                </div>
                
                {/* Upsells */}
                {Object.entries(order.upsells).map(([key, active]) => 
                  active && key !== 'pack' ? (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-inter text-sm capitalize">{key} personnalisé</span>
                      <span className="text-mystical-amber">+{upsellPrices[key as keyof typeof upsellPrices]}€</span>
                    </div>
                  ) : null
                )}
                
                {order.upsells.pack && (
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm">Pack complet</span>
                    <span className="text-mystical-amber">+{upsellPrices.pack}€</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-mystical-gold/20 text-lg font-medium">
                  <span>Total</span>
                  <span className="text-mystical-gold-light">{order.totalPrice}€</span>
                </div>
              </div>
            </div>

            {/* Upsells */}
            <div className="space-y-4">
              <h4 className="font-playfair italic text-xl font-medium text-mystical-gold">
                Reliques sacrées (optionnel)
              </h4>
              
              {[
                { key: 'mandala', name: 'Mandala personnalisé', price: 19, desc: 'Votre mandala unique haute définition' },
                { key: 'audio', name: 'Audio sacré', price: 14, desc: 'Guidance audio supplémentaire' },
                { key: 'rituel', name: 'Rituel symbolique', price: 22, desc: 'Rituel personnalisé de transmutation' },
                { key: 'pack', name: 'Pack complet', price: 49, desc: 'Toutes les reliques incluses' }
              ].map((upsell) => (
                <div key={upsell.key} className="flex items-center justify-between p-4 rounded-xl bg-mystical-gold/5 border border-mystical-gold/20">
                  <div className="flex-1">
                    <h5 className="font-medium text-white">{upsell.name}</h5>
                    <p className="text-sm text-gray-400">{upsell.desc}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-mystical-amber font-medium">+{upsell.price}€</span>
                    <button
                      onClick={() => handleUpsellToggle(upsell.key as keyof typeof order.upsells)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        order.upsells[upsell.key as keyof typeof order.upsells]
                          ? 'bg-mystical-gold border-mystical-gold'
                          : 'border-mystical-gold/50'
                      }`}
                    >
                      {order.upsells[upsell.key as keyof typeof order.upsells] && (
                        <Plus className="w-3 h-3 text-mystical-dark rotate-45" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-gradient-to-br from-mystical-purple/10 to-mystical-gold/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
              <h3 className="font-playfair italic text-2xl font-medium mb-6 text-mystical-gold">
                Questions rituelles
              </h3>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                    className="w-full px-4 py-3 rounded-lg bg-mystical-dark/50 border border-mystical-gold/30 text-white focus:outline-none focus:border-mystical-gold"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className="w-full px-4 py-3 rounded-lg bg-mystical-dark/50 border border-mystical-gold/30 text-white focus:outline-none focus:border-mystical-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date de naissance *</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({...prev, birthDate: e.target.value}))}
                    className="w-full px-4 py-3 rounded-lg bg-mystical-dark/50 border border-mystical-gold/30 text-white focus:outline-none focus:border-mystical-gold"
                    required
                  />
                </div>

                {level >= 2 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Intention</label>
                    <textarea
                      value={formData.intention}
                      onChange={(e) => setFormData(prev => ({...prev, intention: e.target.value}))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-mystical-dark/50 border border-mystical-gold/30 text-white focus:outline-none focus:border-mystical-gold resize-none"
                    />
                  </div>
                )}

                {level >= 3 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Blocages ressentis</label>
                    <textarea
                      value={formData.blockages}
                      onChange={(e) => setFormData(prev => ({...prev, blockages: e.target.value}))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-mystical-dark/50 border border-mystical-gold/30 text-white focus:outline-none focus:border-mystical-gold resize-none"
                    />
                  </div>
                )}
              </form>

              <motion.button
                onClick={handlePayment}
                disabled={loading || !formData.firstName || !formData.email}
                className="w-full mt-8 px-8 py-4 rounded-lg bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 flex items-center justify-center gap-2 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-mystical-dark border-t-transparent" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Procéder au paiement
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommandeTemple;
