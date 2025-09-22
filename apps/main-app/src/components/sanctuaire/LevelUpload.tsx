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
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { useUploadConfig } from '../../hooks/useProductsSimple';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  category: 'face' | 'palm' | 'photo' | 'document' | 'audio' | 'video' | 'other';
  previewUrl?: string;
}

export const LevelUpload: React.FC = () => {
  const { userLevel, addUploadedFile, updateUploadStatus } = useUserLevel();
  const uploadConfig = useUploadConfig(userLevel.currentLevel || '');
  const [uploadFiles, setUploadFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const palmInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();

  // Informations complémentaires
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [objective, setObjective] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const getFileCategory = (file: File, override?: FileUploadState['category']): FileUploadState['category'] => {
    if (override) return override;
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

  const simulateUpload = async (file: File, categoryOverride?: FileUploadState['category']): Promise<void> => {
    return new Promise((resolve, reject) => {
      const fileState: FileUploadState = {
        file,
        progress: 0,
        status: 'uploading',
        category: getFileCategory(file, categoryOverride),
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
          category: getFileCategory(file, categoryOverride) as any,
          url: `https://storage.oraclelumira.com/${userLevel.currentLevel}/${file.name}`,
        });

        resolve();
      }, 2000 + Math.random() * 2000);
    });
  };

  const handleFiles = useCallback(async (files: FileList, categoryOverride?: FileUploadState['category']) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        // TODO: Afficher toast d'erreur
        console.error(error);
        continue;
      }
      
      try {
        await simulateUpload(file, categoryOverride);
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

  const handleDrop = useCallback((e: React.DragEvent, categoryOverride?: FileUploadState['category']) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files, categoryOverride);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, categoryOverride?: FileUploadState['category']) => {
    if (e.target.files) {
      handleFiles(e.target.files, categoryOverride);
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
      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {[1,2,3].map((i) => (
          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step===i ? 'bg-cosmic-gold text-cosmic-void' : 'bg-white/10 text-white/70'}`}>{i}</div>
        ))}
      </div>

      {step === 1 && (
        <motion.div
          className="p-6 bg-cosmic-deep/60 rounded-2xl border border-cosmic-gold/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-bold text-cosmic-divine mb-4">Coordonnées</h3>
          <p className="text-sm text-cosmic-ethereal mb-4">Votre email et téléphone (pour vous notifier par SMS)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cosmic-ethereal mb-1">Email</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="block text-sm text-cosmic-ethereal mb-1">Téléphone (SMS)</label>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" placeholder="+33 6 12 34 56 78" />
            </div>
          </div>
          <div className="mt-6 text-right">
            <button disabled={!email || !phone} onClick={()=>setStep(2)} className={`px-6 py-2 rounded-xl font-semibold ${email && phone ? 'bg-cosmic-gold text-cosmic-void' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}>Continuer</button>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging ? 'border-cosmic-gold bg-cosmic-gold/10' : 'border-cosmic-gold/40 hover:border-cosmic-gold/60'}`}
          onDragOver={(e)=>{e.preventDefault(); setIsDragging(true);}}
          onDragLeave={()=>setIsDragging(false)}
          onDrop={(e)=>handleDrop(e, 'face')}
        >
          <Cloud className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
          <h3 className="text-xl font-bold text-cosmic-divine mb-2">Photo fractale (de face)</h3>
          <p className="text-cosmic-ethereal mb-6">Glissez la photo ou cliquez pour sélectionner</p>
          <button onClick={()=>faceInputRef.current?.click()} className="px-8 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm text-cosmic-void font-bold rounded-xl hover:shadow-stellar transition-all duration-300"><Upload className="w-5 h-5 inline mr-2" />Sélectionner la photo</button>
          <input ref={faceInputRef} type="file" accept="image/*" onChange={(e)=>handleFileInput(e,'face')} className="hidden" />
          <div className="mt-6">
            <AnimatePresence>
              {uploadFiles.filter(f=>f.category==='face').map((fileState)=> (
                <motion.div key={fileState.file.name} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="p-4 bg-cosmic-deep/40 rounded-xl border border-cosmic-gold/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image className="w-6 h-6 text-cosmic-gold" />
                      <span className="text-cosmic-divine">{fileState.file.name}</span>
                    </div>
                    {fileState.status === 'uploading' ? <span className="text-sm text-cosmic-ethereal">{Math.round(fileState.progress)}%</span> : <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={()=>setStep(1)} className="px-4 py-2 rounded-xl bg-white/10 text-white/80">Retour</button>
            <button onClick={()=>setStep(3)} disabled={!uploadFiles.some(f=>f.category==='face' && f.status==='completed')} className={`px-6 py-2 rounded-xl font-semibold ${uploadFiles.some(f=>f.category==='face' && f.status==='completed') ? 'bg-cosmic-gold text-cosmic-void' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}>Continuer</button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging ? 'border-cosmic-gold bg-cosmic-gold/10' : 'border-cosmic-gold/40 hover:border-cosmic-gold/60'}`}
            onDragOver={(e)=>{e.preventDefault(); setIsDragging(true);}}
            onDragLeave={()=>setIsDragging(false)}
            onDrop={(e)=>handleDrop(e, 'palm')}
          >
            <Cloud className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
            <h3 className="text-xl font-bold text-cosmic-divine mb-2">Photo de la paume</h3>
            <p className="text-cosmic-ethereal mb-6">Glissez la photo ou cliquez pour sélectionner</p>
            <button onClick={()=>palmInputRef.current?.click()} className="px-8 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm text-cosmic-void font-bold rounded-xl hover:shadow-stellar transition-all duration-300"><Upload className="w-5 h-5 inline mr-2" />Sélectionner la photo</button>
            <input ref={palmInputRef} type="file" accept="image/*" onChange={(e)=>handleFileInput(e,'palm')} className="hidden" />
            <div className="mt-6">
              <AnimatePresence>
                {uploadFiles.filter(f=>f.category==='palm').map((fileState)=> (
                  <motion.div key={fileState.file.name} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="p-4 bg-cosmic-deep/40 rounded-xl border border-cosmic-gold/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image className="w-6 h-6 text-cosmic-gold" />
                        <span className="text-cosmic-divine">{fileState.file.name}</span>
                      </div>
                      {fileState.status === 'uploading' ? <span className="text-sm text-cosmic-ethereal">{Math.round(fileState.progress)}%</span> : <CheckCircle className="w-5 h-5 text-green-400" />}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 p-4 bg-cosmic-deep/60 rounded-xl border border-cosmic-gold/30">
            <label className="block text-sm text-cosmic-ethereal mb-1">Dites ce que vous désirez à l'oracle...</label>
            <textarea value={objective} onChange={(e)=>setObjective(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" placeholder="Décrivez votre intention..." />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cosmic-ethereal mb-1">Date (optionnel)</label>
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" />
            </div>
            <div>
              <label className="block text-sm text-cosmic-ethereal mb-1">Heure (optionnel)</label>
              <input type="time" value={time} onChange={(e)=>setTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button onClick={()=>setStep(2)} className="px-4 py-2 rounded-xl bg-white/10 text-white/80">Retour</button>
            <button
              onClick={async ()=>{
                const orderId = searchParams.get('order_id');
                if (!orderId) { setSubmitMessage("Identifiant de commande manquant"); return; }
                const hasFace = uploadFiles.some(f=>f.category==='face' && f.status==='completed');
                const hasPalm = uploadFiles.some(f=>f.category==='palm' && f.status==='completed');
                if (!hasFace || !hasPalm || !objective) { setSubmitMessage('Veuillez compléter les étapes: photos et objectif.'); return; }
                try {
                  setIsSubmitting(true); setSubmitMessage(null);
                  const filesPayload = (userLevel.uploadedFiles || []).map(f=>({ name: f.name, originalName: f.name, url: f.url, type: f.type, size: f.size }));
                  const face = (userLevel.uploadedFiles || []).find(f=> (f as any).category==='face');
                  const palm = (userLevel.uploadedFiles || []).find(f=> (f as any).category==='palm');
                  const payload = {
                    files: filesPayload,
                    formData: { email, phone, objective, dateOfBirth: date ? new Date(date).toISOString() : undefined },
                    clientInputs: { birthTime: time || undefined, specificContext: objective || undefined, facePhotoUrl: face?.url, palmPhotoUrl: palm?.url }
                  };
                  await apiRequest(`/orders/by-payment-intent/${orderId}/client-submit`, { method: 'POST', body: JSON.stringify(payload) });
                  updateUploadStatus('completed');
                  setSubmitMessage('Informations transmises au Desk. Merci.');
                } catch(e:any) {
                  console.error(e); setSubmitMessage(e?.message || 'Échec de transmission au Desk');
                } finally { setIsSubmitting(false); }
              }}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-xl font-semibold ${!isSubmitting ? 'bg-cosmic-gold text-cosmic-void hover:shadow-stellar' : 'bg-white/10 text-white/50'}`}
            >
              {isSubmitting ? 'Transmission...' : 'Valider et envoyer'}
            </button>
          </div>
          {submitMessage && <div className="mt-3 text-sm text-cosmic-ethereal">{submitMessage}</div>}
        </motion.div>
      )}

      {/* Informations complémentaires */}
      <motion.div 
        className="mt-8 p-4 bg-cosmic-deep/60 rounded-xl border border-cosmic-gold/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="font-bold text-cosmic-gold mb-4">Informations complémentaires</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-cosmic-ethereal mb-1">Téléphone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="ex: +33 6 12 34 56 78" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" />
          </div>
          <div>
            <label className="block text-sm text-cosmic-ethereal mb-1">Objectif</label>
            <input value={objective} onChange={e => setObjective(e.target.value)} placeholder="Votre intention/objectif" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" />
          </div>
          <div>
            <label className="block text-sm text-cosmic-ethereal mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" />
          </div>
          <div>
            <label className="block text-sm text-cosmic-ethereal mb-1">Heure</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-cosmic-gold" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={async () => {
              const orderId = searchParams.get('order_id');
              if (!orderId) { setSubmitMessage("Identifiant de commande manquant"); return; }
              if (!(uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'completed'))) { setSubmitMessage('Veuillez compléter vos uploads.'); return; }
              try {
                setIsSubmitting(true);
                setSubmitMessage(null);
                const filesPayload = (userLevel.uploadedFiles || []).map(f => ({
                  name: f.name,
                  originalName: f.name,
                  url: f.url,
                  type: f.type,
                  size: f.size,
                }));
                const payload = {
                  files: filesPayload,
                  formData: {
                    phone,
                    objective,
                    dateOfBirth: date ? new Date(date).toISOString() : undefined,
                  },
                  clientInputs: {
                    birthTime: time || undefined,
                    specificContext: objective || undefined,
                  }
                };
                await apiRequest(`/orders/by-payment-intent/${orderId}/client-submit`, { method: 'POST', body: JSON.stringify(payload) });
                updateUploadStatus('completed');
                setSubmitMessage('Informations transmises au Desk. Merci.');
              } catch (e: any) {
                console.error(e);
                setSubmitMessage(e?.message || 'Échec de transmission au Desk');
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={!(uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'completed')) || isSubmitting}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${ (uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'completed')) && !isSubmitting ? 'bg-cosmic-gold text-cosmic-void hover:shadow-stellar' : 'bg-white/10 text-white/50 cursor-not-allowed'}`}
          >
            {isSubmitting ? 'Transmission...' : 'Valider et envoyer'}
          </button>
          {submitMessage && <span className="text-sm text-cosmic-ethereal">{submitMessage}</span>}
        </div>
      </motion.div>
    </div>
  );
};
