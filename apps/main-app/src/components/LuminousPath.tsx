import React, { useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, Variants } from 'framer-motion';
import microCopy from '../content/micro-copy.json';

type Level = {
  id: string;
  title: string;
  blurb: string;
  icon: 'sun' | 'flame' | 'moon' | 'star';
  gradient: string; // Tailwind gradient classes
};

const Icon = ({ name, className }: { name: Level['icon'] | 'compass'; className?: string }) => {
  const common = 'w-6 h-6 md:w-7 md:h-7';
  switch (name) {
    case 'sun':
      return (
        <svg aria-hidden="true" className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.5-7.5-1.4 1.4M7.9 17.1 6.5 18.5m10.6 0-1.4-1.4M7.9 6.9 6.5 5.5" />
        </svg>
      );
    case 'moon':
      return (
        <svg aria-hidden="true" className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
        </svg>
      );
    case 'star':
      return (
        <svg aria-hidden="true" className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9L6.6 19l1-6L3.3 9.4l6-.9L12 3z" />
        </svg>
      );
    case 'flame':
      return (
        <svg aria-hidden="true" className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2s3 3 3 6-1.5 4.5-3 6c-1.5-1.5-3-3-3-6s3-6 3-6z" />
          <path d="M8 14a4 4 0 1 0 8 0c0-1.8-1.4-3.1-2.6-4.3" />
        </svg>
      );
    case 'compass':
      return (
        <svg aria-hidden="true" className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l-5 10m5-10l5 10" />
          <path d="M9 9l3-2 3 2" />
          <path d="M5 21l6-6 8 8" />
          <path d="M5 21h8v-2" />
        </svg>
      );
    default:
      return null;
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
};

const dotVariants: Variants = {
  inactive: { scale: 0.8, opacity: 0.4 },
  active: { scale: 1.1, opacity: 1 },
};

export const LuminousPath: React.FC = () => {
  const reduce = useReducedMotion();
  const [modalOpen, setModalOpen] = useState(false);

  const levels: Level[] = useMemo(
    () => [
      {
        id: microCopy.levels[0].id,
        title: microCopy.levels[0].title,
        blurb: microCopy.levels[0].blurb,
        icon: 'sun',
        gradient: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-white',
      },
      {
        id: microCopy.levels[1].id,
        title: microCopy.levels[1].title,
        blurb: microCopy.levels[1].blurb,
        icon: 'flame',
        gradient: 'bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50',
      },
      {
        id: microCopy.levels[2].id,
        title: microCopy.levels[2].title,
        blurb: microCopy.levels[2].blurb,
        icon: 'moon',
        gradient: 'bg-gradient-to-br from-stone-50 via-emerald-50 to-lime-50',
      },
      {
        id: microCopy.levels[3].id,
        title: microCopy.levels[3].title,
        blurb: microCopy.levels[3].blurb,
        icon: 'star',
        gradient: 'bg-gradient-to-br from-sky-50 via-indigo-50 to-white',
      },
    ],
    []
  );

  // Refs for in-view detection
  const refs = levels.map(() => useRef<HTMLDivElement | null>(null));
  const inViews = refs.map((r) => useInView(r, { margin: '-20% 0% -20% 0%', once: false }));

  return (
    <section aria-label="Chemin lumineux" className="relative">
      {/* Hero / Intro */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <motion.div
          initial={reduce ? undefined : 'hidden'}
          whileInView={reduce ? undefined : 'show'}
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="text-center space-y-4"
        >
          <motion.h2 variants={cardVariants} className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            Un chemin d’éveil clair et humain
          </motion.h2>
          <motion.p variants={cardVariants} className="mx-auto max-w-2xl text-base md:text-lg text-slate-700">
            Avancez étape par étape, dans la clarté. Des lectures progressives, modernes et apaisées — sans symboles lourds, avec une poésie légère.
          </motion.p>

          <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              aria-label={microCopy.ctas.receiveReading}
              className="px-5 py-3 text-sm font-semibold rounded-full border border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 transition-colors"
            >
              {microCopy.ctas.receiveReading}
            </button>
            <button
              type="button"
              aria-label={microCopy.ctas.discoverCustomization}
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 text-sm font-semibold rounded-full border border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 transition-colors"
            >
              {microCopy.ctas.discoverCustomization}
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Path container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Central vertical SVG line */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 hidden md:block"
          width="2"
          height="100%"
          viewBox="0 0 2 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="2" height="1000" fill="url(#pathGradient)" />
        </svg>

        {/* Levels */}
        <div className="relative flex flex-col gap-10">
          {levels.map((lvl, idx) => (
            <div key={lvl.id} className="relative">
              {/* Dot aligned with the path */}
              <motion.div
                role="img"
                aria-label={`Point d’étape ${lvl.title}`}
                variants={dotVariants}
                animate={inViews[idx] ? 'active' : 'inactive'}
                className="hidden md:block absolute left-1/2 -translate-x-1/2 -top-3 z-10"
              >
                <div
                  className={`h-4 w-4 rounded-full bg-amber-400 ring-4 ${
                    inViews[idx] ? 'ring-amber-200/80' : 'ring-amber-200/40'
                  } shadow-lg`}
                />
              </motion.div>

              {/* Card */}
              <motion.article
                ref={refs[idx]}
                initial={reduce ? undefined : 'hidden'}
                whileInView={reduce ? undefined : 'show'}
                viewport={{ once: false, amount: 0.5 }}
                variants={cardVariants}
                className={`${lvl.gradient} rounded-3xl shadow-xl ring-1 ring-amber-200/50 p-6 sm:p-8 lg:p-10`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-white/70 text-amber-700 ring-1 ring-amber-300/60">
                    <Icon name={lvl.icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-900">{lvl.title}</h3>
                    <p className="mt-2 text-slate-700 leading-relaxed">{lvl.blurb}</p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        aria-label={`${microCopy.ctas.enterStep} — ${lvl.title}`}
                        className="px-4 py-2.5 text-sm font-semibold rounded-full border border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 transition-colors"
                      >
                        {microCopy.ctas.enterStep}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            </div>
          ))}
        </div>
      </div>

      {/* Sur-mesure section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900">{microCopy.customization.title}</h3>
          <p className="mt-2 text-slate-700">Composez une création unique, adaptée à votre question et à votre sensibilité.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { key: 'carte', label: microCopy.customization.options[0].label, icon: 'star' as const },
            { key: 'video', label: microCopy.customization.options[1].label, icon: 'sun' as const },
            { key: 'musique', label: microCopy.customization.options[2].label, icon: 'moon' as const },
          ].map((opt) => (
            <motion.button
              key={opt.key}
              type="button"
              role="button"
              aria-label={`${microCopy.ctas.discoverCustomization} — ${opt.label}`}
              onClick={() => setModalOpen(true)}
              whileHover={reduce ? undefined : { scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-white via-sky-50 to-amber-50 ring-1 ring-amber-200/60 shadow-xl flex flex-col items-center justify-center gap-3 text-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              <Icon name={opt.icon} className="text-amber-700" />
              <span className="text-sm font-medium text-slate-800 text-center px-4">{opt.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            aria-label={microCopy.ctas.discoverCustomization}
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 text-sm font-semibold rounded-full border border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 transition-colors"
          >
            {microCopy.ctas.discoverCustomization}
          </button>
        </div>
      </div>

      {/* Modal plein écran (fond night) */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="surMesureTitle"
          className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/95 px-4"
        >
          {/* Constellations discrètes */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0.2 }}
              animate={reduce ? undefined : { opacity: [0.2, 0.4, 0.2] }}
              transition={reduce ? undefined : { duration: 4, repeat: Infinity }}
              className="grid grid-cols-6 gap-6 text-sky-200/40"
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <Icon key={i} name="star" />
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 24 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            className="relative max-w-2xl w-full bg-white/95 rounded-3xl p-6 sm:p-10 shadow-2xl ring-1 ring-amber-200"
          >
            <div className="flex items-start gap-3">
              <span className="text-amber-700"><Icon name="compass" /></span>
              <h4 id="surMesureTitle" className="text-xl md:text-2xl font-semibold text-slate-900">
                {microCopy.customization.modalTitle}
              </h4>
            </div>
            <p className="mt-3 text-slate-700">
              Choisissez votre medium (carte symbolique, vidéo ou musique) et recevez une œuvre créée pour vous, guidée par votre intention.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {microCopy.customization.options.map((o) => (
                <div key={o.key} className="rounded-2xl bg-gradient-to-br from-white via-amber-50 to-sky-50 p-4 ring-1 ring-amber-200/60">
                  <div className="flex items-center gap-3 text-amber-700">
                    {o.key === 'carte' && <Icon name="star" />}
                    {o.key === 'video' && <Icon name="sun" />}
                    {o.key === 'musique' && <Icon name="moon" />}
                    <span className="font-medium text-slate-900">{o.label}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">Une création unique, envoyée avec un soin particulier.</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold rounded-full border border-slate-300 text-slate-700 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
              >
                Fermer
              </button>
              <button
                type="button"
                className="px-4 py-2.5 text-sm font-semibold rounded-full border border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
              >
                {microCopy.ctas.discoverCustomization}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer discret avec compas-équerre */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-6">
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <span className="sr-only">Compas et équerre</span>
          <Icon name="compass" className="text-slate-500" />
          <span className="text-xs">Un repère discret sur votre chemin</span>
        </div>
      </footer>
    </section>
  );
};

export default LuminousPath;

