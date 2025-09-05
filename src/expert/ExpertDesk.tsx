import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getPendingOrders, updateOrder, type Order } from '../api/mongodb';
import { Crown, User, MessageSquare, Clock, Sparkles } from 'lucide-react';

const ExpertDesk: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ text: string; audioUrl?: string } | null>(null);

  const loadPendingOrders = useCallback(async () => {
    const orders = await getPendingOrders();
    setPendingOrders(orders);
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
      loadPromptTemplate(orders[0]);
    }
  }, [selectedOrder]);

  useEffect(() => {
    loadPendingOrders();
  }, [loadPendingOrders]);

  const loadPromptTemplate = (order: Order) => {
    const templates = {
      1: `Tu es l'Oracle de Lumira, voix douce et directe.
Prénom : ${order.answers.intention || 'Non fournie'}, Niveau : ${order.level}
Génère : 1 archetype, 1 phrase vibratoire, 1 conseil. Ton : chaleureux.`,
      
      2: `Tu es l'Oracle de Lumira, guide intuitive.
Prénom : ${order.answers.intention || 'Non fournie'}, Niveau : ${order.level}
Génère : profil d'âme, domaine ciblé, rituel symbolique 30s. Ton : profond et bienveillant.`,
      
      3: `Tu es l'Oracle de Lumira, alchimiste des âmes.
Blocages : ${order.answers.blockages || 'Non fournie'}
Génère : blessure fondamentale, métaphore transmutation, mantra, action 7j. Ton : transformateur.`,
      
      4: `Tu es l'Oracle de Lumira, sage multidimensionnelle.
Intention : ${order.answers.intention || 'Non fournie'}
Génère : cycle de vie, ligne karmique, mission d'âme, mandala description, audio script complet.`
    };
    
    setPrompt(templates[order.level as keyof typeof templates] || templates[1]);
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    loadPromptTemplate(order);
    setGeneratedContent(null);
  };

  const handleGenerate = async () => {
    if (!selectedOrder) return;
    
    setIsGenerating(true);
    
    // Mock generation - replace with real n8n/OpenAI call
    setTimeout(() => {
      const mockContent = {
        text: `**${selectedOrder.level === 1 ? 'L\'Explorateur' : selectedOrder.level === 2 ? 'La Guérisseuse' : selectedOrder.level === 3 ? 'L\'Alchimiste' : 'Le Sage'}**

Cher/chère ${selectedOrder.answers.intention || 'âme lumineuse'},

Votre énergie vibratoire révèle un archétype puissant qui guide votre chemin...

${selectedOrder.level >= 2 ? `
**Profil d'âme :**
Vous portez en vous une lumière qui cherche à éclairer les autres. Votre intuition est votre boussole principale.

**Domaine ciblé :** Relations et guérison émotionnelle
` : ''}

${selectedOrder.level >= 3 ? `
**Blocages identifiés :**
${selectedOrder.answers.blockages || 'Des peurs anciennes qui demandent à être transmutées'}

**Métaphore de transformation :**
Comme le cristal qui se forme sous pression, vos défis actuels sculptent votre brillance.

**Mantra personnel :** "Je transforme mes peurs en lumière"

**Action 7 jours :** Pratiquez la gratitude chaque matin pendant 7 minutes
` : ''}

${selectedOrder.level >= 4 ? `
**Mission d'âme :**
Vous êtes venue sur Terre pour enseigner la compassion à travers votre propre guérison.

**Ligne karmique :**
Ancienne guérisseuse, vous reprenez ce don dans cette incarnation.

**Mandala personnel :**
Couleurs dominantes : violet et doré, symboles : lotus et spirale ascendante
` : ''}

Que cette lecture illumine votre chemin.

🌟 Oracle Lumira`,
        audioUrl: 'https://mock-audio-url.mp3'
      };
      
      setGeneratedContent(mockContent);
      setIsGenerating(false);
    }, 3000);
  };

  const handleValidate = async () => {
    if (!selectedOrder || !generatedContent) return;
    
    // Update order status and add generated content
    await updateOrder(selectedOrder._id, {
      status: 'done',
      pdfUrl: `https://files.oraclelumira.com/reading_${selectedOrder._id}.pdf`,
      audioUrl: generatedContent.audioUrl,
      mandalaUrl: selectedOrder.level >= 3 ? `https://files.oraclelumira.com/mandala_${selectedOrder._id}.jpg` : undefined
    });
    
    // Refresh orders list
    await loadPendingOrders();
    setGeneratedContent(null);
  };

  return (
    <div className="min-h-screen bg-mystical-dark text-white">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-mystical-gold/20 to-mystical-purple/20 border-b border-mystical-gold/30 py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4">
            <Crown className="w-8 h-8 text-mystical-gold" />
            <h1 className="font-playfair italic text-3xl font-medium text-mystical-gold">
              Desk Oracle Lumira
            </h1>
            <div className="ml-auto bg-mystical-gold/20 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">{pendingOrders.length} lectures en attente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8 h-full">
          
          {/* Orders Queue - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6 h-full">
              <h2 className="font-playfair italic text-xl font-medium text-mystical-gold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                File d'attente
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    onClick={() => handleOrderSelect(order)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedOrder?._id === order._id
                        ? 'bg-mystical-gold/20 border-mystical-gold/60'
                        : 'bg-mystical-dark/30 border-mystical-gold/20 hover:border-mystical-gold/40'
                    } border`}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Niveau {order.level}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-mystical-gold" />
                      <span className="text-sm">Client #{order._id.slice(-6)}</span>
                    </div>
                    
                    {order.answers.intention && (
                      <div className="text-xs text-gray-300 line-clamp-2">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {order.answers.intention}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Center & Right Columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {selectedOrder && (
              <>
                {/* Order Details */}
                <div className="bg-gradient-to-br from-mystical-purple/10 to-mystical-gold/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
                  <h3 className="font-playfair italic text-xl font-medium text-mystical-gold mb-4">
                    Commande #{selectedOrder._id.slice(-8)}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-white mb-2">Informations client</h4>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div>Niveau : {selectedOrder.level}</div>
                        <div>Date : {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</div>
                        <div>Statut : <span className="text-yellow-400">En attente</span></div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">Réponses client</h4>
                      <div className="space-y-2 text-sm text-gray-300">
                        {selectedOrder.answers.intention && (
                          <div>
                            <span className="text-mystical-gold">Intention :</span> {selectedOrder.answers.intention}
                          </div>
                        )}
                        {selectedOrder.answers.blockages && (
                          <div>
                            <span className="text-mystical-gold">Blocages :</span> {selectedOrder.answers.blockages}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prompt Editor */}
                <div className="bg-gradient-to-br from-mystical-gold/10 to-mystical-amber/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
                  <h3 className="font-playfair italic text-xl font-medium text-mystical-gold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Mini-prompt Oracle
                  </h3>
                  
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-mystical-dark/50 border border-mystical-gold/30 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-mystical-gold"
                    placeholder="Ajustez le prompt pour cette lecture..."
                  />
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-400">
                      Tokens estimés : {Math.ceil(prompt.length / 4)}
                    </div>
                    
                    <motion.button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-mystical-purple to-mystical-purple-light text-white font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Envoyer à l'Oracle
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Generated Content Preview */}
                {generatedContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-mystical-purple/10 to-mystical-gold/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6"
                  >
                    <h3 className="font-playfair italic text-xl font-medium text-mystical-gold mb-4">
                      Aperçu de la lecture
                    </h3>
                    
                    <div className="bg-mystical-dark/30 rounded-lg p-4 mb-6">
                      <pre className="whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
                        {generatedContent.text}
                      </pre>
                    </div>
                    
                    {generatedContent.audioUrl && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-mystical-gold mb-2">Audio généré</h4>
                        <div className="bg-mystical-gold/20 rounded-lg p-3 text-sm">
                          🎵 Audio prêt (25 min) - Voix Onyx, fréquence 432 Hz
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <motion.button
                        onClick={handleGenerate}
                        className="px-6 py-3 rounded-lg border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/10 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                      >
                        Re-générer
                      </motion.button>
                      
                      <motion.button
                        onClick={handleValidate}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-medium transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 flex-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        Valider & Livrer
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
            
            {!selectedOrder && pendingOrders.length === 0 && (
              <div className="text-center py-12">
                <Crown className="w-16 h-16 text-mystical-gold/50 mx-auto mb-4" />
                <p className="text-xl text-gray-400">Aucune lecture en attente</p>
                <p className="text-sm text-gray-500 mt-2">Toutes les demandes ont été traitées ✨</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertDesk;
