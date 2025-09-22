import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/ui/PageLayout';
import MandalaNav from '../components/mandala/MandalaNav';
import StarField from '../components/micro/StarField';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { labels } from '../lib/sphereLabels';
import { useUserLevel } from '../contexts/UserLevelContext';

const ContextualHint: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let hint = '';
  if (path.includes('/path')) hint = labels.emptyPath;
  else if (path.includes('/draws')) hint = labels.emptyDraws;
  else if (path.includes('/synthesis')) hint = 'Explorez vos insights par catégories spirituelles';
  else if (path.includes('/chat')) hint = labels.emptyConv;
  else if (path.includes('/tools')) hint = labels.emptyTools;
  else hint = 'Naviguez dans votre sanctuaire personnel';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <GlassCard className="p-6 backdrop-blur-xl bg-white/5 border-white/10">
        <p className="text-sm text-white/70 italic font-light leading-relaxed">{hint}</p>
      </GlassCard>
    </motion.div>
  );
};

const Sanctuaire: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { userLevel } = useUserLevel();

  const progress = Math.round(((user?.level || 1) / 4) * 100);

  // Compute upload progress from UserLevel context to surface in UI + mandala
  const uploadProgress = (() => {
    if (!userLevel?.currentLevel) return 0;
    const requiredFilesMap: Record<string, number> = {
      initie: 1,
      mystique: 2,
      profond: 3,
      integrale: 4,
    };
    const required = requiredFilesMap[userLevel.currentLevel] ?? 1;
    const uploaded = userLevel.uploadedFiles?.length ?? 0;
    return Math.min(Math.round((uploaded / required) * 100), 100);
  })();

  // ux: cosmic breath - generous spacing for premium feel
  return (
    <PageLayout variant="dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="space-y-8 py-6 sm:py-8 lg:py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          {/* Cosmic Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-3xl overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-mystical-900/40 via-mystical-800/30 to-mystical-700/20 border border-white/10 shadow-2xl">
              <StarField progress={progress} className="absolute inset-0" />
              {/* ux: cosmic overlay gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-mystical-900/60 via-transparent to-transparent" />
              
              <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-light text-amber-400 mb-3 tracking-wide">
                    Bienvenue, âme lumineuse
                  </h1>
                  <p className="text-lg sm:text-xl text-white/80 font-light">
                    {user?.firstName ? `Bonjour ${user.firstName}` : 'Bonjour'}
                  </p>
                  {/* ux: progress indicator */}
                  <div className="mt-6 flex items-center space-x-3">
                    <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      />
                    </div>
                    <span className="text-sm text-amber-400 font-medium">{progress}%</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Mandala Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MandalaNav progress={[uploadProgress, 0, 0, 0, 0]} />
          </motion.div>

          {/* Upload Callout (integrates new Sanctuaire upload flow) */}
          {userLevel?.hasAccess && userLevel?.uploadStatus !== 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <GlassCard className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border-white/10">
                <div>
                  <div className="text-sm text-white/80 mb-1">Progression d'upload</div>
                  <div className="flex items-center gap-3">
                    <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <span className="text-amber-400 text-sm font-medium">{uploadProgress}%</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/upload-sanctuaire?level=${userLevel.currentLevel ?? ''}`)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-medium hover:from-amber-500 hover:to-amber-600 transition-colors"
                >
                  Compléter mes fichiers
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* Contextual Hint */}
          <ContextualHint />

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard className="min-h-[400px] backdrop-blur-xl bg-white/5 border-white/10">
              <Outlet />
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Sanctuaire;
