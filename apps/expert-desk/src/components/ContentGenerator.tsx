import React, { useState } from 'react';
import {
  Send,
  Wand2,
  FileText,
  User,
  Calendar,
  MapPin,
  Clock,
  Download,
  ExternalLink,
  X as CloseIcon
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import type { Order } from '../types/Order';
import { api, endpoints } from '../utils/api';
import toast from 'react-hot-toast';
import { getLevelNameSafely } from '../utils/orderUtils';

interface ContentGeneratorProps {
  order: Order | null;
  onOrderUpdate: () => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  order,
  onOrderUpdate
}) => {
  const [expertPrompt, setExpertPrompt] = useState('');
  const [expertInstructions, setExpertInstructions] = useState('');
  const [sending, setSending] = useState(false);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const apiBase = (import.meta as any).env?.VITE_API_URL || '/api';
  const hostBase = typeof apiBase === 'string' ? apiBase.replace(/\/api\/?$/, '') : '';
  const buildFileUrl = (p: string | undefined, fallbackName?: string) => {
    // Pour S3, utiliser directement l'URL complète si elle commence par http
    const path = p && p.length > 0 ? p : (fallbackName ? `/uploads/${fallbackName}` : '');
    if (!path) return '';
    // Si c'est déjà une URL S3 complète, la retourner directement
    if (path.startsWith('http')) return path;
    // Sinon, construire l'URL locale (fallback)
    return `${hostBase}${path}`;
  };

  // Signed image URL cache and preview modal state
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);

  const resolveSignedUrl = async (urlOrPath: string): Promise<string> => {
    try {
      const u = urlOrPath?.startsWith('http') ? urlOrPath : buildFileUrl(urlOrPath);
      if (!u) return '';
      
      // Utiliser l'endpoint /api/uploads/presign-get au lieu de /expert/files/presign
      // Car cet endpoint existe déjà et fonctionne sans authentification expert
      const { data } = await api.get('/uploads/presign-get', { params: { url: u } });
      return data.url as string;
    } catch (e) {
      console.warn('Failed to presign URL, falling back to raw:', e);
      // Fallback silencieux sans toast pour éviter la pollution visuelle
      return urlOrPath;
    }
  };

  // Fonction pour gérer le fallback des miniatures en cas d'erreur de chargement
  const handleThumbnailError = async (e: React.SyntheticEvent<HTMLImageElement>, fileUrl: string) => {
    const target = e.currentTarget;
    if (!target) return;

    console.error('[ContentGenerator] Erreur chargement miniature:', fileUrl);
    
    // Vérifier si on a déjà une URL signée en cache
    if (imageUrls[fileUrl]) {
      console.log('[ContentGenerator] URL signée déjà utilisée, passage au placeholder');
      if (target.isConnected) {
        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"%3E%3Crect fill="%23374151" width="56" height="56"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="10" dy="3.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E%3Ctspan x="50%25" dy="-0.5em"%3EImage%3C/tspan%3E%3Ctspan x="50%25" dy="1.2em"%3Enon%3C/tspan%3E%3Ctspan x="50%25" dy="1.2em"%3Edispo%3C/tspan%3E%3C/text%3E%3C/svg%3E';
      }
      return;
    }

    // Tenter de récupérer une URL signée
    try {
      const signed = await resolveSignedUrl(fileUrl);
      
      // Vérifier que l'élément existe toujours dans le DOM
      if (signed && target.isConnected) {
        console.log('[ContentGenerator] Utilisation URL signée pour miniature');
        target.src = signed;
        // Mettre à jour le cache
        setImageUrls(prev => ({ ...prev, [fileUrl]: signed }));
        return;
      }
    } catch (error) {
      console.error('[ContentGenerator] Échec récupération URL signée:', error);
    }
    
    // En dernier recours, afficher le placeholder
    if (target.isConnected) {
      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"%3E%3Crect fill="%23374151" width="56" height="56"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="10" dy="3.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E%3Ctspan x="50%25" dy="-0.5em"%3EImage%3C/tspan%3E%3Ctspan x="50%25" dy="1.2em"%3Enon%3C/tspan%3E%3Ctspan x="50%25" dy="1.2em"%3Edispo%3C/tspan%3E%3C/text%3E%3C/svg%3E';
    }
  };

  // Load signed URLs for thumbnails when order changes
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!order?.files?.length) { setImageUrls({}); return; }
      const next: Record<string, string> = {};
      for (const f of order.files) {
        const fileUrl = (f as any).url || buildFileUrl((f as any).path, (f as any).filename);
        const contentType = (f as any).contentType || (f as any).mimetype || '';
        const isImage = (contentType.startsWith('image/')) || /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(fileUrl || '');
        if (fileUrl && isImage) {
          try {
            const signed = await resolveSignedUrl(fileUrl);
            if (!mounted) return;
            next[fileUrl] = signed;
          } catch {}
        }
      }
      if (mounted) setImageUrls(next);
    })();
    return () => { mounted = false; };
  }, [order?._id]);

  const openPreview = async (fileUrl: string, name: string) => {
    const signed = imageUrls[fileUrl] || await resolveSignedUrl(fileUrl);
    setPreview({ url: signed, name });
  };

  // Gérer l'erreur de chargement de l'image dans la modale de prévisualisation
  const handlePreviewError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (!target || !preview) return;

    console.error('[ContentGenerator] Erreur chargement image prévisualisation:', preview.url);
    
    // Si l'URL actuelle est déjà une URL signée, afficher le placeholder
    if (preview.url.includes('X-Amz-Signature') || preview.url.includes('Signature=')) {
      console.log('[ContentGenerator] URL signée a échoué, affichage placeholder');
      if (target.isConnected) {
        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23374151" width="800" height="600"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E';
      }
      return;
    }

    // Sinon, tenter de récupérer une nouvelle URL signée
    try {
      const signed = await resolveSignedUrl(preview.url);
      if (signed && target.isConnected) {
        console.log('[ContentGenerator] Utilisation URL signée pour prévisualisation');
        target.src = signed;
        return;
      }
    } catch (error) {
      console.error('[ContentGenerator] Échec récupération URL signée préview:', error);
    }

    // Placeholder en dernier recours
    if (target.isConnected) {
      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23374151" width="800" height="600"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E';
    }
  };

  const triggerDownload = async (fileUrl: string) => {
    try {
      const signed = await resolveSignedUrl(fileUrl);
      if (!signed) return;
      const a = document.createElement('a');
      a.href = signed;
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      toast.error("Échec du téléchargement");
    }
  };

  // Reset form when order changes
  React.useEffect(() => {
    if (order) {
      // Pre-fill with level-specific prompt template
      const template = generatePromptTemplate(order);
      setExpertPrompt(template);
      setExpertInstructions('');
    } else {
      setExpertPrompt('');
      setExpertInstructions('');
    }
  }, [order]);

  const generatePromptTemplate = (order: Order): string => {
    const client = order.formData;
    const level = getLevelNameSafely(order.level);
    const birthDate = client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseignée';

    let template = `CONSULTATION ORACLE LUMIRA - NIVEAU ${level.toUpperCase()}

Client: ${client.firstName} ${client.lastName}
Date de naissance: ${birthDate}
Email: ${client.email}
${client.phone ? `Téléphone: ${client.phone}` : ''}

${client.specificQuestion ? `Question du client: "${client.specificQuestion}"` : ''}

${order.clientInputs?.birthTime ? `Heure de naissance: ${order.clientInputs.birthTime}` : ''}
${order.clientInputs?.birthPlace ? `Lieu de naissance: ${order.clientInputs.birthPlace}` : ''}
${order.clientInputs?.specificContext ? `Contexte: ${order.clientInputs.specificContext}` : ''}

CONSIGNES POUR LA LECTURE ${level.toUpperCase()}:
`;

    switch (level) {
      case 'Simple':
        template += `
- Tirer 1 carte oracle et interpréter son message
- Réponse concise et bienveillante (300-500 mots)
- Focus sur le message principal de guidance
- PDF 2 pages avec la carte et l'interprétation`;
        break;

      case 'Intuitive':
        template += `
- Établir le profil de l'âme basé sur la date de naissance
- Identifier les dons et talents naturels
- Guidance sur la mission de vie
- Audio 5 minutes avec voix chaleureuse
- PDF 4 pages détaillé`;
        break;

      case 'Alchimique':
        template += `
- Analyser les blocages énergétiques actuels
- Proposer un rituel de transformation personnalisé
- Guidance pour l'évolution spirituelle
- Audio 12 minutes avec méditation guidée
- PDF 6-8 pages avec rituel détaillé`;
        break;

      case 'Intégrale':
        template += `
- Cartographie complète du chemin de vie
- Création d'un mandala personnel
- Analyse des cycles et transitions
- Guidance holistique sur tous les aspects
- Audio 25 minutes complet
- PDF 15 pages + Mandala HD à imprimer`;
        break;
    }

    template += `

PERSONNALISATION:
[Ajoutez ici vos observations intuitives et guidances personnalisées pour ce client]`;

    return template;
  };

  const sendToAssistant = async () => {
    if (!order || !expertPrompt.trim()) {
      toast.error('Veuillez remplir le prompt personnalisé');
      return;
    }

    try {
      setSending(true);

      const payload = {
        orderId: order._id,
        expertPrompt,
        expertInstructions,
        n8nWebhookUrl: n8nWebhookUrl || undefined
      };

      const response = await api.post(endpoints.expert.processOrder, payload);
      if (response.data?.success) {
        toast.success('Commande envoyée à l\'assistant IA');
        onOrderUpdate();
      } else {
        toast.error(response.data?.error || 'Échec de l\'envoi');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erreur réseau');
    } finally {
      setSending(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${size.toFixed(2)} ${units[unit]}`;
  };

  if (!order) {
    return (
      <div className="p-6 text-slate-400">
        Sélectionnez une commande pour commencer.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-400" /> Génération du contenu
        </h2>
      </div>

      {/* Client Summary */}
      <div className="space-y-3 bg-slate-900/40 border border-white/10 rounded-lg p-4">
        <h3 className="text-slate-200 font-semibold flex items-center gap-2">
          <User className="w-4 h-4" /> {order.formData.firstName} {order.formData.lastName}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-400">Nom:</span>
            <p className="font-medium">{order.formData.firstName} {order.formData.lastName}</p>
          </div>

          <div>
            <span className="text-slate-400">Email:</span>
            <p className="font-medium">{order.formData.email}</p>
          </div>

          {order.formData.dateOfBirth && (
            <div>
              <span className="text-slate-400">Naissance:</span>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(order.formData.dateOfBirth).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}

          {order.clientInputs?.birthPlace && (
            <div>
              <span className="text-slate-400">Lieu:</span>
              <p className="font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {order.clientInputs.birthPlace}
              </p>
            </div>
          )}

          {order.clientInputs?.birthTime && (
            <div>
              <span className="text-slate-400">Heure:</span>
              <p className="font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.clientInputs.birthTime}
              </p>
            </div>
          )}
        </div>

        {order.formData.specificQuestion && (
          <div className="mt-3 p-3 bg-white/10 rounded border border-white/20">
            <span className="text-white/70 text-xs">Question du client:</span>
            <p className="text-sm italic mt-1 text-amber-100">"{order.formData.specificQuestion}"</p>
          </div>
        )}

        {/* Files */}
        {order.files && order.files.length > 0 && (
          <div className="mt-3">
            <span className="text-slate-400 text-xs">Fichiers joints:</span>
            <div className="mt-2 space-y-2">
              {order.files.map((file, index) => {
                const fileUrl = (file as any).url || buildFileUrl((file as any).path, (file as any).filename);
                const displayName = (file as any).name || (file as any).originalName || 'Fichier sans nom';
                const isImage = (
                  ((file as any).contentType || (file as any).mimetype || '')
                    .startsWith('image/')
                ) || /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(fileUrl || '');

                return (
                  <div key={index} className="flex items-center gap-3 text-xs bg-white/10 border border-white/20 p-2 rounded">
                    {isImage ? (
                      <button type="button" onClick={() => openPreview(fileUrl!, displayName)} className="focus:outline-none" title="Aperçu">
                        <img 
                          src={imageUrls[fileUrl] || fileUrl} 
                          alt={displayName} 
                          className="w-14 h-14 object-cover rounded border border-white/20"
                          loading="lazy"
                          onError={(e) => handleThumbnailError(e, fileUrl!)}
                        />
                      </button>
                    ) : (
                      <FileText className="w-4 h-4 text-amber-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{displayName}</div>
                      <div className="text-white/60">{formatFileSize((file as any).size)}</div>
                    </div>
                    {fileUrl && (
                      <button type="button" onClick={() => triggerDownload(fileUrl)} className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>Télécharger</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute -top-3 -right-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full p-1"
              aria-label="Fermer"
            >
              <CloseIcon className="w-5 h-5 text-white" />
            </button>
            <div className="bg-[#121826] rounded-lg border border-white/10 p-3">
              <div className="text-white/80 text-sm mb-2 truncate" title={preview.name}>{preview.name}</div>
              <img 
                src={preview.url} 
                alt={preview.name} 
                className="max-h-[75vh] w-full object-contain rounded"
                onError={handlePreviewError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Prompt Form */}
      <div className="space-y-4">
        {/* Expert Prompt */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Prompt personnalisé pour l'assistant IA *
          </label>
          <textarea
            value={expertPrompt}
            onChange={(e) => setExpertPrompt(e.target.value)}
            className="textarea min-h-[300px] font-mono text-sm"
            placeholder="Rédigez le prompt détaillé pour cette lecture..."
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            Le prompt sera envoyé à l'assistant ChatGPT spécialisé
          </p>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Consignes particulières (optionnel)
          </label>
          <textarea
            value={expertInstructions}
            onChange={(e) => setExpertInstructions(e.target.value)}
            className="textarea min-h-[100px]"
            placeholder="Instructions spécifiques pour cette consultation..."
          />
        </div>

        {/* n8n Webhook URL (optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            URL Webhook n8n (optionnel)
          </label>
          <div className="relative">
            <input
              type="url"
              value={n8nWebhookUrl}
              onChange={(e) => setN8nWebhookUrl(e.target.value)}
              className="input pr-8"
              placeholder="https://your-n8n-instance.com/webhook/oracle-lumira"
            />
            <ExternalLink className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Laissez vide pour utiliser l'URL par défaut
          </p>
        </div>

        {/* Send Button */}
        <button
          onClick={sendToAssistant}
          disabled={sending || !expertPrompt.trim()}
          className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="small" />
              <span>Envoi en cours...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              <span>Envoyer à l'Assistant ChatGPT</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContentGenerator;
