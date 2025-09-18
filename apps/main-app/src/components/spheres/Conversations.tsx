import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';
import { SecondaryButton, PrimaryButton } from '../ui/Buttons';
import { MessagesSquare, MapPin, Wrench } from 'lucide-react';

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
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="p-4"> 
            <div className="h-4 bg-mystical-gold/20 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-mystical-gold/10 rounded w-1/2 mt-3 animate-pulse" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center gap-3 py-6">
          <MessagesSquare className="w-10 h-10 text-mystical-gold" />
          <div className="font-inter text-sm text-white/90">Aucune conversation</div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="relative">
      <div className="space-y-3">
        {questions.map((q) => (
          <GlassCard key={q.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-inter font-medium text-white">{q.question}</div>
                  <div className="text-xs text-white/60">{new Date(q.createdAt).toLocaleString()}</div>
                </div>

                <div className="mt-3">
                  {expanded[q.id] ? <div className="text-white/90">{q.answer ?? 'Aucune réponse encore'}</div> : null}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-col gap-2">
                  <SecondaryButton onClick={() => setExpanded((s) => ({ ...s, [q.id]: !s[q.id] }))}>
                    {expanded[q.id] ? 'Réduire' : 'Afficher'}
                  </SecondaryButton>

                  <div className="flex gap-2">
                    <button
                      title="Épingler"
                      onClick={() => togglePin(q)}
                      className={`p-2 rounded ${q.pinned ? 'bg-mystical-gold/20' : ''}`}
                      aria-pressed={!!q.pinned}
                    >
                      <MapPin className="w-4 h-4" />
                    </button>

                    <button
                      title="Générer un outil"
                      onClick={() => generateTool(q)}
                      disabled={!!generating[q.id]}
                      className="p-2 rounded bg-mystical-gold/10"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* floating button */}
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light shadow-2xl"
          aria-haspopup="dialog"
        >
          <MessagesSquare className="w-5 h-5" />
          <span className="hidden sm:inline">Poser une question</span>
        </button>
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative w-full max-w-md mx-4">
            <GlassCard>
              <h3 className="font-playfair italic text-lg text-mystical-gold mb-2">Poser une question</h3>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full h-32 p-3 rounded bg-transparent border border-mystical-gold/10 text-white"
                placeholder="Écrivez votre question..."
              />

              <div className="mt-3 flex justify-end gap-2">
                <SecondaryButton onClick={closeModal}>Annuler</SecondaryButton>
                <PrimaryButton onClick={submitQuestion} disabled={submitting}>
                  Envoyer
                </PrimaryButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;
