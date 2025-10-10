import React from 'react';
import { X, Download } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  pdfUrl?: string;
  mandalaSvg?: string;
  onDownload?: () => void;
};

const AssetsModal: React.FC<Props> = ({ open, onClose, title, pdfUrl, mandalaSvg, onDownload }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-mystical-900/95 border border-white/10 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="text-white/90 text-sm font-medium truncate">{title || 'Aperçu'}</div>
          <div className="flex items-center gap-2">
            {onDownload && (
              <button onClick={onDownload} className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span className="text-sm">Télécharger</span>
              </button>
            )}
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="bg-black/20">
          {pdfUrl && (
            <iframe title="PDF" src={pdfUrl} className="w-full h-[75vh]" />
          )}
          {!pdfUrl && mandalaSvg && (
            <div className="p-4 max-h-[75vh] overflow-auto" dangerouslySetInnerHTML={{ __html: mandalaSvg }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetsModal;

