// Oracle Lumira - Upload de fichiers adaptatif par niveau acheté
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Image, 
  Music, 
  Video, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Cloud,
  RotateCcw
} from 'lucide-react';
import { useUserLevel } from '../../contexts/UserLevelContext';
import { useUploadConfig } from '../../hooks/useProductsSimple';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  category: 'photo' | 'document' | 'audio' | 'video' | 'other';
  previewUrl?: string;
}

export const LevelUpload: React.FC = () => {
  const { userLevel, addUploadedFile, updateUploadStatus } = useUserLevel();
  const uploadConfig = useUploadConfig(userLevel.currentLevel || '');
  const [uploadFiles, setUploadFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileCategory = (file: File): FileUploadState['category'] => {
    if (file.type.startsWith('image/')) return 'photo';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf' || file.type.startsWith('text/')) return 'document';
    return 'other';
  };

  const getFileIcon = (category: FileUploadState['category']) => {
    const icons = {
      photo: Image,
      audio: Music,
      video: Video,
      document: FileText,
      other: File,
    };
    return icons[category];
  };

  const validateFile = (file: File): string | null => {
    if (!uploadConfig) return 'Configuration de niveau non trouvée';

    const isAllowedType = (mime: string, name: string) => {
      const lowerMime = (mime || '').toLowerCase();
      const lowerName = (name || '').toLowerCase();
      return uploadConfig.allowedTypes.some((t) => {
        const tt = t.toLowerCase();
        if (tt.startsWith('.')) {
          // Extension check, e.g., .pdf, .docx
          return lowerName.endsWith(tt);
        }
        if (tt.endsWith('/*')) {
          // Wildcard family, e.g., image/*, audio/*
          const prefix = tt.slice(0, -2);
          return lowerMime.startsWith(prefix + '/');
        }
        // Exact MIME match, e.g., image/jpeg
        return lowerMime === tt;
      });
    };

    if (!isAllowedType(file.type, file.name)) {
      return `Type de fichier non autorisé. Types acceptés: ${uploadConfig.allowedTypes.join(', ')}`;
    }

    if (file.size > uploadConfig.maxSizeBytes) {
      const maxSizeMB = uploadConfig.maxSizeBytes / (1024 * 1024);
      return `Fichier trop volumineux. Taille maximum: ${maxSizeMB}MB`;
    }

    if (uploadFiles.length >= uploadConfig.maxFiles) {
      return `Nombre maximum de fichiers atteint (${uploadConfig.maxFiles})`;
    }

    return null;
  };

  const simulateUpload = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const fileState: FileUploadState = {
        file,
        progress: 0,
        status: 'uploading',
        category: getFileCategory(file),
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };

      setUploadFiles(prev => [...prev, fileState]);

      // Simulation du progress d'upload
      const interval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => 
          f.file.name === file.name 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 100) }
            : f
        ));
      }, 200);

      // Simulation réussite après 2-4 secondes
      setTimeout(() => {
        clearInterval(interval);
        setUploadFiles(prev => prev.map(f => 
          f.file.name === file.name 
            ? { ...f, progress: 100, status: 'completed' }
            : f
        ));

        // Ajout au context global
        addUploadedFile({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date(),
          category: getFileCategory(file),
          url: `https://storage.oraclelumira.com/${userLevel.currentLevel}/${file.name}`,
        });

        resolve();
      }, 2000 + Math.random() * 2000);
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        // TODO: Afficher toast d'erreur
        console.error(error);
        continue;
      }
      
      try {
        await simulateUpload(file);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadFiles(prev => prev.map(f => 
          f.file.name === file.name 
            ? { ...f, status: 'error' }
            : f
        ));
      }
    }
    
    // Mise à jour du statut global si tous les uploads sont complétés
    updateUploadStatus('in-progress');
  }, [uploadConfig, uploadFiles.length, addUploadedFile, updateUploadStatus, userLevel.currentLevel]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (fileName: string) => {
    setUploadFiles(prev => prev.filter(f => f.file.name !== fileName));
  };

  const retryUpload = async (fileName: string) => {
    const fileState = uploadFiles.find(f => f.file.name === fileName);
    if (fileState) {
      await simulateUpload(fileState.file);
    }
  };

  if (!userLevel.currentLevel || !uploadConfig) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-cosmic-gold mx-auto mb-4" />
        <p className="text-cosmic-ethereal font-inter">
          Aucun niveau détecté. Veuillez d'abord effectuer un achat.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-playfair italic text-3xl md:text-4xl font-bold text-cosmic-divine mb-4">
          Upload Niveau {userLevel.currentLevel}
        </h2>
        <p className="text-cosmic-ethereal font-inter">
          Envoyez vos fichiers selon votre niveau acheté ({uploadConfig.maxFiles} fichiers maximum)
        </p>
      </motion.div>

      {/* Zone de Drop */}
      <motion.div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-cosmic-gold bg-cosmic-gold/10' 
            : 'border-cosmic-gold/40 hover:border-cosmic-gold/60'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
      >
        <Cloud className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
        <h3 className="text-xl font-bold text-cosmic-divine mb-2">
          Glissez vos fichiers ici
        </h3>
        <p className="text-cosmic-ethereal mb-6">
          ou cliquez pour sélectionner
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-8 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm text-cosmic-void font-bold rounded-xl hover:shadow-stellar transition-all duration-300"
        >
          <Upload className="w-5 h-5 inline mr-2" />
          Sélectionner fichiers
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={uploadConfig.allowedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </motion.div>

      {/* Configuration du niveau */}
      <motion.div 
        className="mt-6 p-4 bg-cosmic-deep/60 rounded-xl border border-cosmic-gold/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="font-bold text-cosmic-gold mb-2">Configuration niveau {userLevel.currentLevel}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-cosmic-ethereal">
          <div>
            <span className="font-medium">Fichiers max:</span> {uploadConfig.maxFiles}
          </div>
          <div>
            <span className="font-medium">Taille max:</span> {(uploadConfig.maxSizeBytes / (1024 * 1024)).toFixed(0)}MB
          </div>
          <div>
            <span className="font-medium">Types:</span> {uploadConfig.allowedTypes.length} formats
          </div>
        </div>
      </motion.div>

      {/* Liste des fichiers uploadés */}
      <AnimatePresence>
        {uploadFiles.map((fileState, index) => {
          const Icon = getFileIcon(fileState.category);
          return (
            <motion.div
              key={fileState.file.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-cosmic-deep/40 rounded-xl border border-cosmic-gold/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="w-8 h-8 text-cosmic-gold" />
                  <div>
                    <p className="font-medium text-cosmic-divine">{fileState.file.name}</p>
                    <p className="text-sm text-cosmic-ethereal">
                      {(fileState.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {fileState.status === 'uploading' && (
                    <div className="w-24">
                      <div className="h-2 bg-cosmic-deep rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm"
                          style={{ width: `${fileState.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-cosmic-ethereal mt-1">
                        {Math.round(fileState.progress)}%
                      </p>
                    </div>
                  )}
                  
                  {fileState.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  
                  {fileState.status === 'error' && (
                    <div className="flex space-x-2">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                      <button
                        onClick={() => retryUpload(fileState.file.name)}
                        className="text-cosmic-gold hover:text-cosmic-gold-warm"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFile(fileState.file.name)}
                    className="text-cosmic-silver hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
