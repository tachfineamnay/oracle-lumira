/**
 * SanctuairePDFViewer - Lecteur PDF simple via iframe pour le Sanctuaire
 * 
 * Solution simple et fiable sans dépendance PDF.js
 */

import React from 'react';
import { Download, X } from 'lucide-react';

interface SanctuairePDFViewerProps {
  pdfUrl: string;
  title?: string;
  onDownload?: () => void;
}

const SanctuairePDFViewer: React.FC<SanctuairePDFViewerProps> = ({
  pdfUrl,
  title = 'Lecture PDF',
  onDownload,
}) => {
  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
    } else {
      // Téléchargement direct
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="relative w-full h-full bg-black/20 flex flex-col">
      {/* Toolbar simple */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-mystical-900/95 to-mystical-800/95 backdrop-blur-sm border-b border-white/10">
        <h3 className="text-white/90 text-sm font-medium truncate">
          {title}
        </h3>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Télécharger</span>
        </button>
      </div>

      {/* PDF via iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={title}
          loading="eager"
        />
      </div>
    </div>
  );
};

export default SanctuairePDFViewer;
