import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import { SecondaryButton, PrimaryButton, TertiaryButton } from '../ui/Buttons';
import { MessagesSquare, MapPin, Wrench, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Q = {
  id: string;
  question: string;
  answer?: string;
  category?: string;
  createdAt: string;
  pinned?: boolean;
  _optimistic?: boolean; // local flag
};

const Conversations: React.FC = () => {
  const [questions, setQuestions] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get<Q[]>('/api/questions')
      .then((res) => {
        if (!mounted) return;
        const sorted = (res.data || []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setQuestions(sorted);
      })
      .catch(() => {
        if (mounted) setQuestions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const togglePin = async (q: Q) => {
    // optimistic toggle locally, then attempt to persist
    setQuestions((list) => list.map((it) => (it.id === q.id ? { ...it, pinned: !it.pinned } : it)));
    try {
      await axios.post(`/api/questions/${q.id}/pin`, { pinned: !q.pinned });
    } catch (e) {
      // revert on failure
      setQuestions((list) => list.map((it) => (it.id === q.id ? { ...it, pinned: q.pinned } : it)));
    }
  };

  const generateTool = async (q: Q) => {
    setGenerating((s) => ({ ...s, [q.id]: true }));
    try {
      await axios.post('/api/tools/generate', { questionId: q.id });
      // optionally show feedback
      alert('Outil généré');
    } catch (e) {
      alert('Erreur lors de la génération');
    } finally {
      setGenerating((s) => ({ ...s, [q.id]: false }));
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    // optimistic add
    const tempId = `temp-${Date.now()}`;
    const temp: Q = { id: tempId, question: newQuestion.trim(), createdAt: new Date().toISOString(), _optimistic: true };
    setQuestions((q) => [temp, ...q]);
    setNewQuestion('');
    setShowModal(false);

    try {
      const res = await axios.post<Q>('/api/questions', { question: temp.question });
      // replace temp with real
      setQuestions((list) => list.map((it) => (it.id === tempId ? res.data : it)));
    } catch (e) {
      // mark as failed
      setQuestions((list) => list.map((it) => (it.id === tempId ? { ...it, answer: 'Échec d’envoi', _optimistic: false } : it)));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <GlassCard className="p-6 bg-gradient-to-br from-white/5 to-white/10 border-white/10">
              <div className="space-y-4">
                <div className="h-5 bg-green-400/20 rounded-full animate-pulse w-3/4" />
                <div className="h-3 bg-white/10 rounded-full animate-pulse w-1/2" />
                <div className="h-3 bg-white/10 rounded-full animate-pulse w-2/3" />
                <div className="flex justify-between items-center mt-6">
                  <div className="h-3 bg-white/5 rounded animate-pulse w-20" />
                  <div className="h-8 bg-green-400/20 rounded animate-pulse w-16" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <EmptyState 
        type="conversations"
        action={{
          label: "Commencer une conversation",
          onClick: openModal
        }}
      />
    );
  }

  return (
    <div className="relative">
      <div className="space-y-4">
        {questions.map((q, index) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <GlassCard className={`p-6 transition-all duration-300 ${
              q.pinned 
                ? 'bg-gradient-to-br from-green-400/10 to-green-500/5 border-green-400/30 ring-1 ring-green-400/20' 
                : 'bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:border-green-400/30'
            }`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      {q.pinned && (
                        <div className="px-2 py-1 rounded-full bg-green-400/20 border border-green-400/40 text-green-400 text-xs font-medium">
                          Épinglé
                        </div>
                      )}
                      {q._optimistic && (
                        <div className="px-2 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-medium">
                          En cours...
                        </div>
                      )}
                    </div>
                    <h3 className="font-playfair italic text-lg text-green-400 leading-relaxed">
                      {q.question}
                    </h3>
                    <div className="text-xs text-white/60">
                      {new Date(q.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <TertiaryButton
                      onClick={() => togglePin(q)}
                      className={`p-2 ${
                        q.pinned ? 'text-green-400 bg-green-400/10' : 'text-white/60 hover:text-green-400'
                      }`}
                      title="Épingler cette conversation"
                    >
                      <MapPin className="w-4 h-4" />
                    </TertiaryButton>

                    <TertiaryButton
                      onClick={() => generateTool(q)}
                      disabled={!!generating[q.id]}
                      className="p-2"
                      title="Générer un outil spirituel"
                      isLoading={!!generating[q.id]}
                    >
                      <Wrench className="w-4 h-4" />
                    </TertiaryButton>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded[q.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10 pt-4"
                    >
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-amber-400 mb-3">Réponse de l'Oracle :</h4>
                        <div className="text-white/90 leading-relaxed">
                          {q.answer || "L'Oracle prépare une réponse personnalisée pour votre question. Votre guidance spirituelle arrive bientôt..."}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-white/40">
                    {q.answer ? 'Réponse reçue' : 'En attente de réponse'}
                  </div>
                  <SecondaryButton 
                    onClick={() => setExpanded((s) => ({ ...s, [q.id]: !s[q.id] }))}
                    size="sm"
                  >
                    {expanded[q.id] ? 'Réduire' : 'Voir la réponse'}
                  </SecondaryButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Bouton flottant avec design amélioré */}
      <motion.div 
        className="fixed right-6 bottom-6 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.button
          onClick={openModal}
          className="flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-2xl shadow-green-400/30 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-haspopup="dialog"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Nouvelle question</span>
        </motion.button>
      </motion.div>

      {/* Modal avec design spirituel amélioré */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={closeModal} 
            />
            
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative w-full max-w-2xl"
            >
              <GlassCard className="p-8 bg-gradient-to-br from-mystical-900/95 to-mystical-800/95 border-green-400/30">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-playfair italic text-2xl text-green-400 mb-2">
                      Dialogue avec l'Oracle
                    </h3>
                    <p className="text-white/70 text-sm">
                      Posez votre question spirituelle et recevez la guidance cosmique
                    </p>
                  </div>
                  <TertiaryButton 
                    onClick={closeModal}
                    className="p-2"
                  >
                    <X className="w-5 h-5" />
                  </TertiaryButton>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      <MessagesSquare className="w-4 h-4 inline mr-2" />
                      Votre question à l'Oracle
                    </label>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full h-40 p-4 rounded-xl bg-white/5 border border-green-400/30 text-white placeholder-white/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all resize-none"
                      placeholder="Partagez votre question spirituelle, vos interrogations ou vos préoccupations. L'Oracle écoute votre âme et vous guidera avec sagesse..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={closeModal}>
                      Annuler
                    </SecondaryButton>
                    <PrimaryButton 
                      onClick={submitQuestion} 
                      disabled={submitting || !newQuestion.trim()}
                      isLoading={submitting}
                      className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white"
                    >
                      {submitting ? 'Transmission...' : 'Transmettre à l\'Oracle'}
                    </PrimaryButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Conversations;
