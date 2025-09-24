import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import { FileText, Headphones, Image } from 'lucide-react';
import { SecondaryButton } from '../ui/Buttons';

type Order = {
  id: string;
  title?: string;
  createdAt: string; // ISO
  level?: number;
  status?: 'new' | 'integrated' | 'in_progress';
  pdfUrl?: string;
  audioUrl?: string;
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
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get<Order[]>('/api/orders?type=draw')
      .then((res) => {
        if (!mounted) return;
        const sorted = (res.data || []).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(sorted);
      })
      .catch(() => {
        if (mounted) setOrders([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
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
    return (
      <EmptyState
        type="draws"
        title="Vos Révélations vous attendent"
        message="L'Oracle prépare vos tirages personnalisés. Chaque révélation vous guidera vers votre vérité intérieure et éclairera votre chemin spirituel."
        action={{
          label: "Demander un nouveau tirage",
          onClick: () => navigate('/commande')
        }}
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
            <SecondaryButton onClick={() => o.pdfUrl && window.open(o.pdfUrl, '_blank')}> 
              <FileText className="w-4 h-4 mr-2 inline" />
              <span className="hidden sm:inline">Télécharger</span>
            </SecondaryButton>

            <SecondaryButton onClick={() => o.audioUrl && window.open(o.audioUrl, '_blank')}>
              <Headphones className="w-4 h-4 mr-2 inline" />
              <span className="hidden sm:inline">Écouter</span>
            </SecondaryButton>

            <SecondaryButton onClick={() => alert('Ouvrir mandala (placeholder)')}>
              <Image className="w-4 h-4 mr-2 inline" />
              <span className="hidden sm:inline">Mandala</span>
            </SecondaryButton>
          </div>
        </GlassCard>
      ))}

      {orders.length > pageSize && (
        <div className="text-center">
          <button className="px-4 py-2 rounded-md bg-amber-200 text-amber-900" onClick={() => alert('Voir plus - pagination placeholder')}>
            Voir plus
          </button>
        </div>
      )}
    </div>
  );
};

export default RawDraws;
