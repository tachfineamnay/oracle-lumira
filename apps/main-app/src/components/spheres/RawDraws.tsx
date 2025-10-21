import React, { useEffect, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { FileText, Headphones, Image, Lock } from 'lucide-react';
import { SecondaryButton } from '../ui/Buttons';
import AssetsModal from '../sanctuaire/AssetsModal';
import DrawsWaiting from '../sanctuaire/DrawsWaiting';
import { sanctuaireService } from '../../services/sanctuaire';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { CapabilityGuard } from '../auth/CapabilityGuard';
import { useSanctuaire } from '../../contexts/SanctuaireContext';

type Order = {
  id: string;
  title?: string;
  createdAt: string; // ISO
  level?: number;
  status?: 'new' | 'integrated' | 'in_progress';
  pdfUrl?: string;
  audioUrl?: string;
  mandalaSvg?: string;
};

const statusLabel = (s?: Order['status']) => {
  switch (s) {
    case 'new':
      return 'Nouveau';
    case 'integrated':
      return 'Intégré';
    case 'in_progress':
      return 'En cours';
    default:
      return 'Nouveau';
  }
};

const RawDraws: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize] = useState(10);
  const { play, setTrack } = useAudioPlayer();
  const { user } = useSanctuaire();
  const [modal, setModal] = useState<{ open: boolean; pdfUrl?: string; mandalaSvg?: string; title?: string }>({ open: false });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await sanctuaireService.getUserCompletedOrders();
        if (!mounted) return;
        const mapped: Order[] = (data.orders || []).map((o: any) => ({
          id: o.id,
          title: o.formData?.specificQuestion || 'Tirage spirituel',
          createdAt: o.deliveredAt || o.createdAt,
          level: o.level,
          status: 'integrated',
          pdfUrl: o.generatedContent?.pdfUrl,
          audioUrl: o.generatedContent?.audioUrl,
          mandalaSvg: o.generatedContent?.mandalaSvg,
        }));
        const sorted = mapped.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(sorted);
      } catch (e) {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <GlassCard key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-amber-400/20 rounded-full animate-pulse w-3/4" />
                <div className="h-3 bg-white/10 rounded-full animate-pulse w-1/2" />
              </div>
              <div className="flex gap-2">
                <div className="w-20 h-8 bg-white/10 rounded animate-pulse" />
                <div className="w-20 h-8 bg-white/10 rounded animate-pulse" />
                <div className="w-20 h-8 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    // Afficher la page d'attente élégante
    return (
      <DrawsWaiting
        userEmail={user?.email}
        userPhone={user?.phone}
        estimatedTime="24 heures"
      />
    );
  }

  const page = orders.slice(0, pageSize);

  return (
    <div className="space-y-4">
      {page.map((o) => (
        <GlassCard key={o.id} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="text-xs text-white/80">{new Date(o.createdAt).toLocaleString()}</div>
              <div className="font-inter font-semibold text-white">{o.title || 'Tirage spirituel'}</div>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="px-2 py-0.5 rounded-full bg-mystical-gold/10 text-xs">Niveau {o.level ?? 1}</div>
              <div className="px-2 py-0.5 rounded-full bg-amber-900/20 text-xs">{statusLabel(o.status)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Bouton PDF - Toujours accessible pour les commandes complétées */}
            <CapabilityGuard
              requires="readings.pdf"
              fallback={
                <button
                  disabled
                  className="px-3 py-2 bg-gray-600/20 text-gray-400 rounded-lg flex items-center gap-2 cursor-not-allowed"
                  title="PDF disponible avec niveau Initié"
                >
                  <Lock className="w-4 h-4" />
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              }
            >
              <SecondaryButton 
                onClick={async () => {
                  if (!o.pdfUrl) return;
                  try {
                    const signed = await sanctuaireService.getPresignedUrl(o.pdfUrl);
                    setModal({ open: true, pdfUrl: signed, title: o.title || 'Lecture PDF' });
                  } catch (err) {
                    console.error('Erreur PDF:', err);
                  }
                }}
                disabled={!o.pdfUrl}
              > 
                <FileText className="w-4 h-4 mr-2 inline" />
                <span className="hidden sm:inline">PDF</span>
              </SecondaryButton>
            </CapabilityGuard>

            {/* Bouton Audio - Nécessite capability readings.audio (niveau Mystique+) */}
            <CapabilityGuard
              requires="readings.audio"
              fallback={
                <button
                  disabled
                  className="px-3 py-2 bg-gray-600/20 text-gray-400 rounded-lg flex items-center gap-2 cursor-not-allowed"
                  title="Audio disponible avec niveau Mystique"
                >
                  <Lock className="w-4 h-4" />
                  <Headphones className="w-4 h-4" />
                  <span className="hidden sm:inline">Audio</span>
                </button>
              }
            >
              <SecondaryButton 
                onClick={async () => {
                  if (!o.audioUrl) return;
                  try {
                    const signed = await sanctuaireService.getPresignedUrl(o.audioUrl);
                    setTrack({ url: signed, title: o.title || 'Lecture audio' });
                    play({ url: signed, title: o.title || 'Lecture audio' });
                  } catch (err) {
                    console.error('Erreur Audio:', err);
                  }
                }}
                disabled={!o.audioUrl}
              >
                <Headphones className="w-4 h-4 mr-2 inline" />
                <span className="hidden sm:inline">Audio</span>
              </SecondaryButton>
            </CapabilityGuard>

            {/* Bouton Mandala - Nécessite capability mandala.hd (niveau Profond+) */}
            <CapabilityGuard
              requires="mandala.hd"
              fallback={
                <button
                  disabled
                  className="px-3 py-2 bg-gray-600/20 text-gray-400 rounded-lg flex items-center gap-2 cursor-not-allowed"
                  title="Mandala HD disponible avec niveau Profond"
                >
                  <Lock className="w-4 h-4" />
                  <Image className="w-4 h-4" />
                  <span className="hidden sm:inline">Mandala</span>
                </button>
              }
            >
              <SecondaryButton 
                onClick={() => setModal({ open: true, mandalaSvg: o.mandalaSvg, title: 'Mandala HD' })}
                disabled={!o.mandalaSvg}
              >
                <Image className="w-4 h-4 mr-2 inline" />
                <span className="hidden sm:inline">Mandala</span>
              </SecondaryButton>
            </CapabilityGuard>
          </div>
        </GlassCard>
      ))}

      {orders.length > pageSize && (
        <div className="text-center">
          <button className="px-4 py-2 rounded-md bg-amber-200 text-amber-900" onClick={() => alert('Voir plus - pagination prochainement')}>
            Voir plus
          </button>
        </div>
      )}

      <AssetsModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.title}
        pdfUrl={modal.pdfUrl}
        mandalaSvg={modal.mandalaSvg}
        onDownload={modal.pdfUrl ? () => sanctuaireService.downloadFile(modal.pdfUrl!, (modal.title || 'lecture') + '.pdf') : undefined}
      />
    </div>
  );
};

export default RawDraws;

