/**
 * SanctuairePDFViewer - Lecteur PDF optimisé UX (react-pdf)
 *
 * - Toolbar unique (zoom, pagination, download, ouvrir, print, fermer)
 * - Thumbnails repliables
 * - Un seul scroll vertical, skeletons, gestion erreurs
 */

import React, { useMemo, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  Download,
  X,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Printer,
  PanelLeft,
  PanelLeftClose,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// Configuration du worker PDF.js pour Vite
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface SanctuairePDFViewerProps {
  pdfUrl: string;
  title?: string;
  onDownload?: () => void;
  onClose?: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const ToolbarButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
> = ({ children, active, ...props }) => (
  <button
    {...props}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
      active
        ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
    } ${props.className || ''}`}
  >
    {children}
  </button>
);

const SkeletonPage: React.FC = () => (
  <div className="animate-pulse w-full max-w-4xl mx-auto bg-white/10 h-[80vh] rounded-xl border border-white/10" />
);

const SanctuairePDFViewer: React.FC<SanctuairePDFViewerProps> = ({
  pdfUrl,
  title = 'Lecture PDF',
  onDownload,
  onClose,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [showThumbs, setShowThumbs] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentLoadSuccess = useCallback((doc: PDFDocumentProxy) => {
    setNumPages(doc.numPages || 0);
    setPageNumber(1);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleDocumentLoadError = useCallback((err: Error) => {
    console.error('[PDFViewer] Erreur chargement PDF:', err);
    setError("Impossible de charger le PDF. Vous pouvez le télécharger ci-dessous.");
    setIsLoading(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
      return;
    }
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [onDownload, pdfUrl, title]);

  const handleOpenNewTab = useCallback(() => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  }, [pdfUrl]);

  const handlePrint = useCallback(() => {
    const win = window.open(pdfUrl, '_blank');
    if (win) {
      const timer = setInterval(() => {
        if (win.document.readyState === 'complete') {
          clearInterval(timer);
          win.print();
        }
      }, 300);
    }
  }, [pdfUrl]);

  const zoomIn = () => setScale((s) => clamp(s + 0.15, 0.7, 2.5));
  const zoomOut = () => setScale((s) => clamp(s - 0.15, 0.7, 2.5));

  const goToPage = (n: number) => setPageNumber((prev) => clamp(n, 1, numPages || prev));
  const goNext = () => goToPage(pageNumber + 1);
  const goPrev = () => goToPage(pageNumber - 1);

  const mainPageWidth = useMemo(() => 980 * scale, [scale]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomIn();
    } else if (e.key === '-') {
      e.preventDefault();
      zoomOut();
    } else if (e.key === 'Escape' && onClose) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="relative w-full h-full bg-mystical-900/90 flex flex-col rounded-xl border border-white/10 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-mystical-800/80 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-white/90 text-sm font-semibold truncate">{title}</h3>
          {numPages > 0 && (
            <div className="text-xs text-white/60 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              Page {pageNumber} / {numPages}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ToolbarButton onClick={() => setShowThumbs((v) => !v)} active={showThumbs}>
            {showThumbs ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
            Vignettes
          </ToolbarButton>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
            <button
              onClick={zoomOut}
              className="p-2 rounded-md hover:bg-white/10 text-white/80"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="text-xs text-white/80 min-w-[54px] text-center font-semibold">
              {Math.round(scale * 100)}%
            </div>
            <button
              onClick={zoomIn}
              className="p-2 rounded-md hover:bg-white/10 text-white/80"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <ToolbarButton onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Télécharger
          </ToolbarButton>
          <ToolbarButton onClick={handleOpenNewTab}>
            <ExternalLink className="w-4 h-4" />
            Ouvrir
          </ToolbarButton>
          <ToolbarButton onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            Imprimer
          </ToolbarButton>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 border border-white/10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Corps */}
      <div
        className="flex-1 flex overflow-hidden bg-gradient-to-br from-mystical-900 via-mystical-950 to-mystical-900"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading={<SkeletonPage />}
          className="flex flex-1 overflow-hidden"
          externalLinkTarget="_blank"
        >
          {/* Rail de vignettes */}
          {showThumbs && numPages > 0 && (
            <div className="hidden lg:block w-36 border-r border-white/10 bg-white/5 overflow-y-auto p-2 space-y-2">
              {Array.from({ length: numPages }).map((_, idx) => {
                const page = idx + 1;
                const isActive = pageNumber === page;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-full rounded-lg border transition-all overflow-hidden ${
                      isActive
                        ? 'border-amber-400/60 shadow-lg shadow-amber-400/20'
                        : 'border-white/10 hover:border-amber-300/40'
                    }`}
                  >
                    <Page
                      pageNumber={page}
                      width={130}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                    <div
                      className={`text-[10px] py-1 text-center ${
                        isActive ? 'text-amber-300' : 'text-white/60'
                      }`}
                    >
                      {page}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Page principale */}
          <div className="flex-1 overflow-auto">
            {error ? (
              <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-white/80">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">{error}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ToolbarButton onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                    Télécharger
                  </ToolbarButton>
                  <ToolbarButton onClick={handleOpenNewTab}>
                    <ExternalLink className="w-4 h-4" />
                    Ouvrir dans un onglet
                  </ToolbarButton>
                </div>
              </div>
            ) : (
              <div className="py-6 px-4 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    disabled={pageNumber <= 1}
                    className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-xs text-white/70 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    Page {pageNumber} / {numPages || '...'}
                  </div>
                  <button
                    onClick={goNext}
                    disabled={pageNumber >= numPages}
                    className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="w-full flex justify-center">
                  {isLoading ? (
                    <SkeletonPage />
                  ) : (
                    <Page
                      pageNumber={pageNumber}
                      width={mainPageWidth}
                      renderTextLayer
                      renderAnnotationLayer
                      loading={
                        <div className="flex flex-col items-center gap-2 text-white/70">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs">Chargement de la page...</span>
                        </div>
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </Document>
      </div>

      {/* Footer (zoom reset + fit) */}
      <div className="px-4 py-2 border-t border-white/10 bg-mystical-800/80 flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-2">
          <span>Navigation clavier : ← → pour changer de page, + / - pour zoomer, Échap pour fermer.</span>
        </div>
        <div className="flex items-center gap-2">
          <ToolbarButton onClick={() => setScale(1)}>
            <Minimize2 className="w-4 h-4" />
            Reset zoom
          </ToolbarButton>
          <ToolbarButton onClick={() => setScale(1.2)}>
            <Maximize2 className="w-4 h-4" />
            Zoom confort
          </ToolbarButton>
        </div>
      </div>
    </div>
  );
};

export default SanctuairePDFViewer;
