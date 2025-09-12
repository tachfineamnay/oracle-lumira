import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, Variants } from 'framer-motion';

type Level = {
  id: string;
  roman: string;
  title: string;
  blurb: string;
  icon: 'sun' | 'moon' | 'star' | 'flame';
  gradient: string; // Tailwind gradient classes
};

const Icon = ({ name, className }: { name: Level['icon'] | 'compass' | 'tarot' | 'play' | 'sound'; className?: string }) => {
  const cn = `w-6 h-6 ${className ?? ''}`;
  switch (name) {
    case 'sun':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4 12H2m20 0h-2M18.4 5.6l-1.4 1.4M7 17l-1.4 1.4m12.8 0-1.4-1.4M7 7l-1.4-1.4" />
        </svg>
      );
    case 'moon':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
        </svg>
      );
    case 'star':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9L6.6 19l1-6L3.3 9.4l6-.9L12 3z" />
        </svg>
      );
    case 'flame':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 2s3 3 3 6-1.5 4.5-3 6c-1.5-1.5-3-3-3-6s3-6 3-6z" />
          <path d="M8 14a4 4 0 1 0 8 0c0-1.8-1.4-3.1-2.6-4.3" />
        </svg>
      );
    case 'compass':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3l-5 10m5-10 5 10" />
          <path d="M9 9l3-2 3 2" />
          <path d="M5 21l6-6 8 8" />
          <path d="M5 21h8v-2" />
        </svg>
      );
    case 'tarot':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="6" y="3" width="12" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      );
    case 'play':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polygon points="8,5 19,12 8,19" />
        </svg>
      );
    case 'sound':
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 10v4h4l5 4V6l-5 4H4z" />
          <path d="M16 9a4 4 0 0 1 0 6" />
          <path d="M18.5 7a7 7 0 0 1 0 10" />
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
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 22 } },
};

export default function Home() {
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Escape to close modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    if (modalOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const levels: Level[] = useMemo(
    () => [
      {
        id: 'lvl1',
        roman: 'I',
        title: 'Lecture Express',
        blurb: 'Un éclair de lumière sur votre question du moment.',
        icon: 'sun',
        gradient: 'bg-gradient-to-br from-[#FFF8E6] via-[#FAF3DF] to-[#FFFFFF]'
      },
      {
        id: 'lvl2',
        roman: 'II',
        title: 'Lecture Alchimique',
        blurb: 'Un mouvement qui relie raison et cœur pour transformer.',
        icon: 'flame',
        gradient: 'bg-gradient-to-br from-[#FFE9E3] via-[#FFF0E6] to-[#FFFFFF]'
      },
      {
        id: 'lvl3',
        roman: 'III',
        title: 'Lecture Intégrale',
        blurb: 'Un regard complet pour traverser votre étape de vie.',
        icon: 'moon',
        gradient: 'bg-gradient-to-br from-[#F2F8ED] via-[#F6FBF2] to-[#FFFFFF]'
      },
      {
        id: 'lvl4',
        roman: 'IV',
        title: 'Lecture Étoile',
        blurb: 'Un horizon cosmique pour éclairer votre trajectoire.',
        icon: 'star',
        gradient: 'bg-gradient-to-br from-[#EAF2F7] via-[#F0F6FA] to-[#FFFFFF]'
      }
    ],
    []
  );

  // In-view refs for the path glow
  const refs = levels.map(() => useRef<HTMLDivElement | null>(null));
  const inViews = refs.map((r) => useInView(r, { margin: '-30% 0% -30% 0%', once: false }));

  return (
    <div className="bg-[#F9F7F4] text-slate-800 scroll-smooth min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F9F7F4]/90 backdrop-blur border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A] rounded">
            <span className="text-[#C9A46A]" aria-hidden>
              <Icon name="star" className="w-5 h-5" />
            </span>
            <span style={{ fontFamily: '"Cormorant Garamond", serif' }} className="text-xl font-semibold text-[#B07B54]">Oracle Lumira</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#sanctuaire" className="text-sm font-medium hover:text-[#B07B54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A] rounded px-2 py-1">Accès sanctuaire</a>
          </nav>
          <button aria-label="Ouvrir le menu" className="md:hidden p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A]" onClick={() => setMenuOpen(v => !v)}>
            <span className="block w-5 h-[2px] bg-slate-700 mb-[5px]" />
            <span className="block w-5 h-[2px] bg-slate-700" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-black/5">
            <a href="#sanctuaire" className="block px-4 py-3 hover:bg-[#EAF2F7]" onClick={() => setMenuOpen(false)}>Accès sanctuaire</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative">
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-10">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="h-96 flex flex-col items-center justify-center text-center bg-[radial-gradient(1200px_circle_at_center,_rgba(201,164,106,0.18),_transparent_60%)]">
              <h1 style={{ fontFamily: '"Cormorant Garamond", serif' }} className="text-5xl md:text-6xl text-slate-900 tracking-tight">Oracle Lumira</h1>
              <p className="mt-4 text-lg md:text-xl text-slate-700">Lectures spirituelles & philosophiques progressives</p>
              <a href="#niveaux" aria-label="Commencer le voyage" className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#C9A46A] text-[#B07B54] px-6 py-3 font-semibold hover:bg-[#C9A46A] hover:text-[#0B1F3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A]">Commencer le voyage</a>
            </div>
          </div>
        </div>
      </section>

      {/* Levels - Ascending path */}
      <section id="niveaux" className="relative">
        <div className="max-w-4xl mx-auto px-4 pb-16">
          {/* Central vertical line */}
          <svg aria-hidden className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 hidden md:block" width="2" height="100%" viewBox="0 0 2 1200" preserveAspectRatio="none">
            <rect x="0" y="0" width="2" height="1200" fill="#C9A46A33" />
          </svg>

          <motion.div initial={reduce ? undefined : 'hidden'} whileInView={reduce ? undefined : 'show'} viewport={{ once: false, amount: 0.2 }} variants={containerVariants} className="relative flex flex-col gap-10">
            {levels.map((lvl, idx) => (
              <motion.article
                key={lvl.id}
                ref={refs[idx]}
                variants={cardVariants}
                className={`${lvl.gradient} rounded-3xl ring-1 ring-[#C9A46A]/40 p-6 sm:p-8 shadow-[0_0_40px_-10px_#E5C896]`}
              >
                {/* Roman numeral background */}
                <div className="pointer-events-none absolute inset-0 select-none">
                  <div style={{ fontFamily: '"Cormorant Garamond", serif' }} className="absolute right-6 top-4 text-7xl font-bold text-[#B07B54] opacity-10">{lvl.roman}</div>
                </div>

                {/* Top-right icon */}
                <div className="flex justify-end text-[#C9A46A]" aria-hidden>
                  <Icon name={lvl.icon} />
                </div>

                <div className="mt-2">
                  <h3 style={{ fontFamily: '"Cormorant Garamond", serif' }} className="text-2xl md:text-3xl text-slate-900">{lvl.title}</h3>
                  <p className="mt-2 text-slate-700">{lvl.blurb}</p>
                  <div className="mt-6">
                    <a href="#commande" aria-label={`Entrer dans cette étape — ${lvl.title}`} className="inline-flex items-center rounded-full border border-[#C9A46A] text-[#B07B54] px-4 py-2 font-semibold hover:bg-[#C9A46A] hover:text-[#0B1F3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A]">
                      Entrer dans cette étape
                    </a>
                  </div>
                </div>

                {/* Glow dot aligned to the path */}
                <div className="hidden md:block absolute -left-3 right-0 top-1/2">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-12">
                    <div className={`h-4 w-4 rounded-full ${inViews[idx] ? 'bg-[#C9A46A] ring-4 ring-[#E5C896]/70' : 'bg-[#C9A46A]/50 ring-2 ring-[#C9A46A]/30'} transition-all duration-500`} />
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sur-mesure */}
      <section className="bg-[#F5F1E8] border-y border-black/5">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif' }} className="text-3xl text-slate-900">Création sur‑mesure</h3>
            <p className="mt-2 text-slate-700">Carte symbolique, vidéo inspirée, musique dédiée — composez votre œuvre unique.</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { key: 'carte', label: 'Carte symbolique', icon: 'tarot' as const },
              { key: 'video', label: 'Vidéo', icon: 'play' as const },
              { key: 'musique', label: 'Musique', icon: 'sound' as const },
            ].map((o) => (
              <button key={o.key} type="button" aria-label={`Choisir ${o.label}`} onClick={() => setModalOpen(true)} className="w-48 h-16 rounded-full bg-white/70 ring-1 ring-[#C9A46A]/40 hover:bg-[#EAF2F7] text-[#B07B54] font-medium flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A]">
                <Icon name={o.icon} />
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center rounded-full border border-[#C9A46A] text-[#B07B54] px-5 py-3 font-semibold hover:bg-[#C9A46A] hover:text-[#0B1F3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A]">
              Découvrir la personnalisation
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="customTitle" className="fixed inset-0 z-40 flex items-center justify-center bg-[#0B1F3B]/95 px-4">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 ring-1 ring-[#C9A46A]/40">
            <div className="flex items-start gap-3">
              <span className="text-[#C9A46A]"><Icon name="compass" /></span>
              <h4 id="customTitle" style={{ fontFamily: '"Cormorant Garamond", serif' }} className="text-2xl text-slate-900">Créer votre œuvre sur‑mesure</h4>
            </div>
            <p className="mt-3 text-slate-700">Partagez votre intention, choisissez le medium et recevez une création unique.</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#F9F7F4] p-4 ring-1 ring-[#C9A46A]/30"><div className="text-[#B07B54]"><Icon name="tarot" /></div><p className="mt-2 text-slate-800 font-medium">Carte symbolique</p></div>
              <div className="rounded-2xl bg-[#F9F7F4] p-4 ring-1 ring-[#C9A46A]/30"><div className="text-[#B07B54]"><Icon name="play" /></div><p className="mt-2 text-slate-800 font-medium">Vidéo</p></div>
              <div className="rounded-2xl bg-[#F9F7F4] p-4 ring-1 ring-[#C9A46A]/30"><div className="text-[#B07B54]"><Icon name="sound" /></div><p className="mt-2 text-slate-800 font-medium">Musique</p></div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A]">Fermer</button>
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-full border border-[#C9A46A] text-[#B07B54] hover:bg-[#C9A46A] hover:text-[#0B1F3B] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A46A]">Découvrir la personnalisation</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="sanctuaire" className="bg-[#F9F7F4] border-t border-black/5">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-[#C9A46A]"><Icon name="compass" className="w-4 h-4" /></span>
            <span style={{ fontFamily: '"Cormorant Garamond", serif' }} className="text-lg font-semibold text-[#B07B54]">Oracle Lumira</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/mentions-legales" className="hover:text-[#B07B54]">Mentions légales</a>
            <a href="#top" className="hover:text-[#B07B54]">Haut de page</a>
          </nav>
          <p className="text-sm text-slate-600">© 2025 — Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

