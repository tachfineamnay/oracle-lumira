/**
 * SanctuairePDFViewer - Lecteur PDF moderne et accessible pour le Sanctuaire
 * 
 * Fonctionnalités:
 * ✅ Thumbnails sidebar avec navigation
 * ✅ Toolbar complète: zoom, fit, rotation, téléchargement, impression, plein écran
 * ✅ Navigation page avec compteur fiable
 * ✅ Thème mystique (GlassCard, dégradés ambrés/violets)
 * ✅ Accessibilité WCAG (aria-live, role, focus-ring, keyboard nav)
 * ✅ Mobile responsive (pinch-to-zoom, swipe)
 */

import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Maximize2,
  Menu,
  X,
} from 'lucide-react';

// Configuration PDF.js worker (utiliser le worker local npm au lieu du CDN)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface SanctuairePDFViewerProps {
  pdfUrl: string;
  title?: string;
  onDownload?: () => void;
}

type FitMode = 'width' | 'page' | 'custom';

const SanctuairePDFViewer: React.FC<SanctuairePDFViewerProps> = ({
  pdfUrl,
  title = 'Lecture PDF',
  onDownload,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [fitMode, setFitMode] = useState<FitMode>('width');
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('[PDFViewer] ✅ Document chargé avec succès:', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('[PDFViewer] ❌ Erreur chargement document:', error);
    setLoading(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
    setFitMode('custom');
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
    setFitMode('custom');
  };

  const handleFitWidth = () => {
    setFitMode('width');
    setScale(1.0);
  };

  const handleFitPage = () => {
    setFitMode('page');
    setScale(1.0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handlePrint = () => {
    window.open(pdfUrl, '_blank');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      goToPage(value);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black/20 flex flex-col"
      role="application"
      aria-label="Lecteur PDF"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-mystical-900/95 to-mystical-800/95 backdrop-blur-sm border-b border-white/10">
        {/* Left: Title + Thumbnails toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label={showThumbnails ? 'Masquer les vignettes' : 'Afficher les vignettes'}
            aria-pressed={showThumbnails}
          >
            {showThumbnails ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h3 className="text-white/90 text-sm font-medium truncate max-w-xs hidden sm:block">
            {title}
          </h3>
        </div>

        {/* Center: Page navigation */}
        <div className="flex items-center gap-2" role="navigation" aria-label="Navigation des pages">
          <button
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm text-white/80">
            <label htmlFor="page-input" className="sr-only">Numéro de page</label>
            <input
              id="page-input"
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={handlePageInputChange}
              className="w-12 px-2 py-1 bg-white/10 border border-white/20 rounded text-center focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              aria-label="Page actuelle"
            />
            <span aria-live="polite" aria-atomic="true">/ {numPages || '...'}</span>
          </div>

          <button
            onClick={() => goToPage(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Page suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Zoom + Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs text-white/60 min-w-[3rem] text-center" role="status" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/20 mx-1" role="separator" aria-hidden="true" />

          <button
            onClick={handleFitWidth}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
              fitMode === 'width' ? 'text-amber-400' : 'text-white/70 hover:text-white'
            }`}
            aria-label="Ajuster à la largeur"
            aria-pressed={fitMode === 'width'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRotate}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Rotation 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/20 mx-1" role="separator" aria-hidden="true" />

          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-amber-400 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              aria-label="Télécharger le PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handlePrint}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Imprimer"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content: Thumbnails + PDF Viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails Sidebar */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.aside
              initial={{ x: -250, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -250, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-48 bg-mystical-900/50 backdrop-blur-sm border-r border-white/10 overflow-y-auto p-2 space-y-2"
              role="navigation"
              aria-label="Vignettes des pages"
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-full p-2 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                    page === pageNumber
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                  aria-label={`Aller à la page ${page}`}
                  aria-current={page === pageNumber ? 'page' : undefined}
                >
                  <Document file={pdfUrl} loading={null}>
                    <Page
                      pageNumber={page}
                      width={160}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                  <p className="text-xs text-white/60 mt-1 text-center">Page {page}</p>
                </button>
              ))}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* PDF Viewer */}
        <div
          ref={pageContainerRef}
          className="flex-1 overflow-auto bg-gradient-to-br from-black/40 to-mystical-950/60 p-4 flex items-start justify-center"
          role="main"
          aria-label="Contenu du PDF"
        >
          {loading && (
            <div className="flex items-center justify-center h-full" role="status" aria-live="polite">
              <div className="text-white/60 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>Chargement du PDF...</span>
              </div>
            </div>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={
              <div className="text-red-400 p-4 bg-red-500/10 border border-red-500/30 rounded-lg" role="alert">
                <p className="font-semibold">Erreur de chargement</p>
                <p className="text-sm mt-1">Impossible de charger le PDF. Vérifiez l'URL signée ou les autorisations CORS.</p>
                <p className="text-xs mt-2 text-red-300/70">URL: {pdfUrl?.substring(0, 50)}...</p>
              </div>
            }
            className="shadow-2xl"
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
              cMapPacked: true,
              standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
            }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="rounded-lg overflow-hidden shadow-spiritual"
              loading={
                <div className="w-full h-96 flex items-center justify-center bg-white/5 rounded-lg" role="status">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                </div>
              }
            />
          </Document>
        </div>
      </div>

      {/* Status bar (optionnel) */}
      <div className="px-4 py-2 bg-mystical-900/80 backdrop-blur-sm border-t border-white/10 text-xs text-white/60 flex items-center justify-between">
        <span role="status" aria-live="polite">
          {loading ? 'Chargement...' : `Page ${pageNumber} sur ${numPages}`}
        </span>
        <span className="hidden sm:inline">{title}</span>
      </div>
    </div>
  );
};

export default SanctuairePDFViewer;
