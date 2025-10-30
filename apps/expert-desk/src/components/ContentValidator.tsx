import { Order } from '../types/Order';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  User,
  FileText,
  Headphones,
  Download,
  MessageSquare,
  AlertTriangle,
  Star,
  Loader2,
  RotateCcw,
  Eye
} from 'lucide-react';
import { api, endpoints } from '../utils/api';
import { getLevelNameSafely } from '../utils/orderUtils';
import toast from 'react-hot-toast';

interface ContentValidatorProps {
  order: Order | null;
  onBack: () => void;
  onApprove: (orderId: string, notes: string) => Promise<void>;
  onReject: (orderId: string, notes: string, reason: string) => Promise<void>;
  isProcessing: boolean;
}

const ContentValidator: React.FC<ContentValidatorProps> = ({
  order,
  onBack,
  onApprove,
  onReject,
  isProcessing
}) => {
  const [validationNotes, setValidationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'reading' | 'pdf' | 'audio' | 'mandala'>('reading');
  const [isValidating, setIsValidating] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState('');
  const [signedAudioUrl, setSignedAudioUrl] = useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setSignedPdfUrl('');
      setSignedAudioUrl('');
      const content = order?.generatedContent;
      try {
        if (content?.pdfUrl) {
          const { data } = await api.get(endpoints.expert.presignFile, { params: { url: content.pdfUrl } });
          if (mounted) setSignedPdfUrl(data.signedUrl || '');
        }
      } catch {}
      try {
        if (content?.audioUrl) {
          const { data } = await api.get(endpoints.expert.presignFile, { params: { url: content.audioUrl } });
          if (mounted) setSignedAudioUrl(data.signedUrl || '');
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [order?._id]);

  if (!order) {
    return (
      <div className="card h-fit">
        <div className="text-center py-12 text-slate-400">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Sélectionnez une commande</p>
          <p className="text-sm">Choisissez une commande dans la queue pour valider son contenu</p>
        </div>
      </div>
    );
  }

  const levelDisplayName = getLevelNameSafely(order.level);

  const levelColors: Record<string, string> = {
    'Simple': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    'Intuitive': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Alchimique': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Intégrale': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  };

  const formatPrice = (amount: number) => {
    return amount === 0 ? 'Gratuit' : `${(amount / 100).toFixed(0)}€`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = async () => {
    if (!order || isProcessing) return;
    setIsValidating(true);
    try {
      await onApprove(order._id, validationNotes || 'Contenu validé et approuvé pour livraison au sanctuaire');
    } finally {
      setIsValidating(false);
    }
  };

  const handleReject = async () => {
    // P1: Validation stricte - impossible de rejeter sans contenu généré
    if (!order || isProcessing || !rejectionReason.trim()) return;
    
    // Vérifier qu'il y a du contenu à rejeter
    const hasContent = order.generatedContent && (
      order.generatedContent.reading ||
      order.generatedContent.pdfUrl ||
      order.generatedContent.audioUrl ||
      order.generatedContent.mandalaSvg
    );
    
    if (!hasContent) {
      toast.error('Impossible de rejeter : aucun contenu généré à réviser');
      return;
    }
    
    setIsValidating(true);
    try {
      await onReject(order._id, validationNotes || 'Contenu rejeté - Nécessite régénération', rejectionReason);
    } finally {
      setIsValidating(false);
    }
  };

  const getAvailableTabs = () => {
    const tabs = [];
    const content = order.generatedContent;
    
    if (content?.reading) tabs.push({ id: 'reading', label: 'Lecture', icon: FileText });
    if (content?.pdfUrl) tabs.push({ id: 'pdf', label: 'PDF', icon: Download });
    if (content?.audioUrl) tabs.push({ id: 'audio', label: 'Audio', icon: Headphones });
    if (content?.mandalaSvg) tabs.push({ id: 'mandala', label: 'Mandala', icon: Star });
    
    return tabs;
  };

  const availableTabs = getAvailableTabs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la queue
          </button>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
              levelColors[levelDisplayName] || levelColors['Simple']
            }`}>
              Niveau {order.level} - {levelDisplayName}
            </span>
            {order.revisionCount && order.revisionCount > 0 && (
              <div className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg border border-orange-400/20">
                <RotateCcw className="w-3 h-3" />
                <span className="text-xs font-medium">Révision #{order.revisionCount}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Informations client
            </h3>
            
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-400">Nom :</span> {order.formData.firstName} {order.formData.lastName}</p>
              <p><span className="text-slate-400">Email :</span> {order.formData.email}</p>
              {order.formData.phone && (
                <p><span className="text-slate-400">Téléphone :</span> {order.formData.phone}</p>
              )}
              <p><span className="text-slate-400">Commande :</span> #{order.orderNumber}</p>
              <p><span className="text-slate-400">Prix :</span> {formatPrice(order.amount)}</p>
              <p><span className="text-slate-400">Créée le :</span> {formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Original Question */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              Question originale
            </h3>
            
            <div className="p-3 bg-white/10 rounded border border-white/20 text-sm text-white/90">
              {order.formData.specificQuestion || 'Aucune question spécifique fournie'}
            </div>
            
            {order.expertValidation?.validationNotes && order.revisionCount && order.revisionCount > 0 && (
              <div className="p-3 bg-orange-500/10 rounded border border-orange-500/20 text-sm text-white/90">
                <p className="font-medium mb-1 text-orange-400">Notes de révision précédente :</p>
                <p>{order.expertValidation.validationNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-400" />
          Aperçu du contenu généré
        </h3>

        {availableTabs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>Aucun contenu généré trouvé</p>
          </div>
        ) : (
          <>
            {/* Content Tabs */}
            <div className="flex gap-2 mb-4 border-b border-white/20">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="min-h-[300px]"
              >
                {activeTab === 'reading' && order.generatedContent?.reading && (
                  <div className="p-4 bg-white/10 rounded border border-white/20 text-sm text-white/90 leading-relaxed">
                    <div className="whitespace-pre-wrap">{order.generatedContent.reading}</div>
                  </div>
                )}

                {activeTab === 'pdf' && order.generatedContent?.pdfUrl && (
                  <div className="text-center py-8">
                    <Download className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                    <p className="text-lg font-medium mb-4">PDF généré</p>
                    <a
                      href={signedPdfUrl || order.generatedContent.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Ouvrir le PDF
                    </a>
                  </div>
                )}

                {activeTab === 'audio' && order.generatedContent?.audioUrl && (
                  <div className="text-center py-8">
                    <Headphones className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                    <p className="text-lg font-medium mb-4">Audio généré</p>
                    <audio controls className="mx-auto">
                      <source src={signedAudioUrl || order.generatedContent.audioUrl} type="audio/mpeg" />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                  </div>
                )}

                {activeTab === 'mandala' && order.generatedContent?.mandalaSvg && (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                    <p className="text-lg font-medium mb-4">Mandala généré</p>
                    <div 
                      className="mx-auto max-w-md"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(order.generatedContent.mandalaSvg, {
                        USE_PROFILES: { svg: true, svgFilters: true },
                        ADD_TAGS: ['svg', 'path', 'circle', 'rect', 'polygon', 'ellipse', 'line', 'polyline', 'g', 'defs', 'linearGradient', 'radialGradient', 'stop'],
                        ADD_ATTR: ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'transform', 'id', 'offset', 'stop-color']
                      }) }}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Validation Controls */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-amber-400" />
          Validation du contenu
        </h3>

        <div className="space-y-4">
          {/* Validation Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes de validation (optionnel)
            </label>
            <textarea
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              placeholder="Ajoutez vos commentaires sur la qualité du contenu..."
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
              rows={3}
            />
          </div>

          {/* Rejection Reason (only if rejecting) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Raison du rejet (requis pour rejection)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Expliquez pourquoi le contenu doit être régénéré..."
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleApprove}
              disabled={isProcessing || isValidating}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isValidating ? 'Validation...' : 'Approuver & Livrer'}
            </button>

            <button
              onClick={handleReject}
              disabled={isProcessing || isValidating || !rejectionReason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {isValidating ? 'Rejet...' : 'Rejeter & Régénérer'}
            </button>
          </div>

          <div className="text-xs text-slate-400 text-center pt-2">
            <p><strong>Approuver :</strong> Le contenu sera livré au sanctuaire du client</p>
            <p><strong>Rejeter :</strong> Le contenu sera régénéré par l'IA selon vos indications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentValidator;

