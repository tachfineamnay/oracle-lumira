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
  ExternalLink
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  level: number;
  levelName: string;
  amount: number;
  status: string;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    specificQuestion?: string;
  };
  files?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  }>;
  clientInputs?: {
    birthTime?: string;
    birthPlace?: string;
    specificContext?: string;
    lifeQuestion?: string;
  };
  createdAt: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

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
    const level = order.levelName;
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

    setSending(true);
    
    try {
      const payload = {
        orderId: order._id,
        expertPrompt: expertPrompt.trim(),
        expertInstructions: expertInstructions.trim(),
        n8nWebhookUrl: n8nWebhookUrl.trim() || undefined
      };

      await api.post('/expert/process-order', payload);
      
      toast.success(`Commande #${order.orderNumber} envoyée à l'assistant IA ! 🚀`);
      onOrderUpdate();
      
      // Reset form
      setExpertPrompt('');
      setExpertInstructions('');
      
    } catch (error: any) {
      console.error('Send to assistant error:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!order) {
    return (
      <div className="card h-fit">
        <div className="text-center py-12 text-slate-400">
          <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Sélectionnez une commande</p>
          <p className="text-sm">Choisissez une commande dans la queue pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-fit">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-400" />
          Générateur de Contenu
        </h2>
        <div className="text-xs text-slate-400 font-mono">
          #{order.orderNumber}
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/20">
        <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Informations Client
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
                // Préférence S3: utiliser les nouvelles propriétés avec fallback sur l'ancien modèle
                const fileUrl = (file as any).url || buildFileUrl((file as any).path, (file as any).filename);
                const displayName = (file as any).name || (file as any).originalName || 'Fichier sans nom';
                const isImage = (
                  ((file as any).contentType || (file as any).mimetype || '')
                    .startsWith('image/')
                ) || /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(fileUrl || '');

                return (
                  <div key={index} className="flex items-center gap-3 text-xs bg-white/10 border border-white/20 p-2 rounded">
                    {isImage ? (
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        <img src={fileUrl} alt={displayName} className="w-14 h-14 object-cover rounded border border-white/20" />
                      </a>
                    ) : (
                      <FileText className="w-4 h-4 text-amber-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{displayName}</div>
                      <div className="text-white/60">{formatFileSize(file.size)}</div>
                    </div>
                    {fileUrl && (
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>Télécharger</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
