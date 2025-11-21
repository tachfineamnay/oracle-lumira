import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Download,
  AlertTriangle
} from 'lucide-react';
import type { Order } from '../types/Order';

interface Props {
  order: Order | null;
  onRegenerate: (order: Order) => void;
  isProcessing: boolean;
}

const HistoryViewer: React.FC<Props> = ({ order, onRegenerate, isProcessing }) => {
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

  if (!order) {
    return (
      <div className="glass rounded-xl p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">Aucune lecture sélectionnée</h3>
          <p className="text-sm text-slate-500">
            Sélectionnez une lecture dans l'historique pour voir les détails
          </p>
        </div>
      </div>
    );
  }

  const handleRegenerate = () => {
    onRegenerate(order);
    setShowConfirmRegenerate(false);
  };

  const isApproved = order.expertValidation?.validationStatus === 'approved';
  const isRejected = order.expertValidation?.validationStatus === 'rejected';

  return (
    <div className="glass rounded-xl p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg ${
            isApproved ? 'bg-green-400/10' : 
            isRejected ? 'bg-red-400/10' : 
            'bg-slate-400/10'
          }`}>
            {isApproved ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : isRejected ? (
              <XCircle className="w-6 h-6 text-red-400" />
            ) : (
              <FileText className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Lecture #{order.orderNumber}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-sm px-2 py-1 rounded ${
                isApproved ? 'bg-green-400/20 text-green-400' :
                isRejected ? 'bg-red-400/20 text-red-400' :
                'bg-slate-400/20 text-slate-400'
              }`}>
                {isApproved ? 'Validée et livrée' : 
                 isRejected ? 'Rejetée' : 
                 'En cours'}
              </span>
              {order.revisionCount && order.revisionCount > 0 && (
                <span className="text-sm px-2 py-1 rounded bg-orange-400/20 text-orange-400 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Version {order.revisionCount + 1}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Informations Client
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-sm text-slate-400">Nom complet</p>
              <p className="text-white font-medium">
                {order.formData.firstName} {order.formData.lastName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-white">{order.formData.email}</p>
            </div>
          </div>

          {order.formData.dateOfBirth && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-sm text-slate-400">Date de naissance</p>
                <p className="text-white">
                  {new Date(order.formData.dateOfBirth).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          )}

          {order.clientInputs?.birthPlace && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-sm text-slate-400">Lieu de naissance</p>
                <p className="text-white">{order.clientInputs.birthPlace}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question spirituelle */}
      {order.clientInputs?.lifeQuestion && (
        <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Question / Objectif spirituel
          </h3>
          <p className="text-white italic">"{order.clientInputs.lifeQuestion}"</p>
        </div>
      )}

      {/* Generated Content Preview */}
      {order.generatedContent?.pdfUrl && (
        <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            Contenu généré
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm">PDF de lecture généré</span>
            </div>
            <div className="flex gap-2">
              <a
                href={order.generatedContent.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 rounded transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                Voir
              </a>
              <a
                href={order.generatedContent.pdfUrl}
                download
                className="flex items-center gap-1 px-3 py-1.5 bg-green-400/10 text-green-400 hover:bg-green-400/20 rounded transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Validation Info */}
      {order.expertValidation && (
        <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            Informations de validation
          </h3>
          <div className="space-y-3">
            {order.expertValidation.validatorName && (
              <div>
                <p className="text-sm text-slate-400">Validé par</p>
                <p className="text-white">{order.expertValidation.validatorName}</p>
              </div>
            )}
            
            {order.expertValidation.validatedAt && (
              <div>
                <p className="text-sm text-slate-400">Date de validation</p>
                <p className="text-white">
                  {new Date(order.expertValidation.validatedAt).toLocaleString('fr-FR')}
                </p>
              </div>
            )}

            {order.expertValidation.validationNotes && (
              <div>
                <p className="text-sm text-slate-400">Notes de validation</p>
                <p className="text-white">{order.expertValidation.validationNotes}</p>
              </div>
            )}

            {order.expertValidation.rejectionReason && (
              <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                <p className="text-sm text-red-400 font-medium mb-1">Raison du rejet</p>
                <p className="text-red-300">{order.expertValidation.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regenerate Action */}
      {isApproved && (
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-4">
          {!showConfirmRegenerate ? (
            <>
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">Relancer cette lecture</h3>
                  <p className="text-sm text-amber-200/80">
                    Cette action va régénérer une nouvelle version de la lecture. 
                    L'ancien PDF dans le sanctuaire sera remplacé par le nouveau après validation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmRegenerate(true)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Relancer la génération
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">Confirmer la relance</h3>
                  <p className="text-sm text-red-200/80">
                    Êtes-vous sûr de vouloir relancer cette lecture ? 
                    Cette action est irréversible et le PDF actuel sera remplacé.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmRegenerate(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white hover:bg-slate-600 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      En cours...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryViewer;
