import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/ui/PageLayout';
import MandalaNav from '../components/mandala/MandalaNav';
import StarField from '../components/micro/StarField';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../hooks/useAuth';
import { labels } from '../lib/sphereLabels';

const ContextualHint: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/sanctuaire' || path === '/sanctuaire/') {
    return null;
  }

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

const ascensionLevels = [
  {
    title: 'Niveau I : Le Voile Initiatique',
    price: '27 € • 3 mois',
    description: "Introduction aux langages symboliques, aux cycles vibratoires et aux fondements de l'énergie cosmique.",
    bullets: [
      'Lexique vibratoire et cosmique',
      "Méditations d'ancrage stellaire",
      "Cercle communautaire d'Initiés",
    ],
    cta: 'Ouvrir le premier Sceau',
  },
  {
    title: 'Niveau II : Le Temple Mystique',
    price: '47 € • 6 mois',
    description: 'Activation des rituels personnels et exploration des cartes archétypales avancées.',
    bullets: [
      'Accès au contenu Initiatique',
      'Rituels de transmutation',
      "Sessions d'alignement vibratoire",
      'Portails événementiels prioritaires',
    ],
    cta: 'Passer le Deuxième Portail',
  },
  {
    title: "Niveau III : L'Ordre Profond",
    price: '67 € • 12 mois',
    description: "Maîtrise des cycles karmiques et lecture des codes fractals de l'âme.",
    bullets: [
      'Accès illimité aux enseignements',
      'Mentorat vibratoire personnalisé',
      'Archives occultes numérologiques',
      'Certification Oracle Lumira',
      'Accès au Cercle Fermé',
    ],
    cta: "Pénétrer l'Ordre Profond",
  },
  {
    title: "Niveau IV : L'Intelligence Intégrale",
    price: '97 € • 12 mois',
    description: "Cartographie complète de ta fréquence d'âme, analyse karmique et modélisation multidimensionnelle.",
    bullets: [
      'Lecture des cycles de vie',
      "Lignée et mémoire karmique",
      'Synthèse audio vibratoire',
      'Mandala HD à haute fréquence',
      'Suivi vibratoire 30 jours',
    ],
    cta: "Activer l'Intelligence Cosmique",
  },
];

const testimonials = [
  {
    quote: "J'ai senti mes centres énergétiques s'ouvrir à l'écoute de l'audio. Une clarté que je n'avais jamais connue.",
    author: 'Sarah M.',
    role: 'Exploratrice du Soi',
  },
  {
    quote: "Le mandala agit comme une clé visuelle méditative. Je l'utilise chaque matin.",
    author: 'Marc L.',
    role: 'Sage Stellaire',
  },
  {
    quote: "Je me suis révélée à une créativité ancienne. Comme si j'avais accès à une mémoire oubliée.",
    author: 'Emma K.',
    role: 'Créatrice Galactique',
  },
];

const complements = [
  { name: 'Mandala HD Fractal', price: '19 €' },
  { name: 'Audio 432 Hz Cosmique', price: '14 €' },
  { name: 'Rituel sur mesure', price: '22 €' },
  { name: "Pack d'Intégration Totale", price: '49 €' },
];

const Sanctuaire: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const progress = Math.round(((user?.level || 1) / 4) * 100);
  const isBaseSanctuaire = location.pathname === '/sanctuaire' || location.pathname === '/sanctuaire/';

  return (
    <PageLayout variant="dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="space-y-8 py-6 sm:py-8 lg:py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="relative w-full h-[380px] sm:h-[420px] lg:h-[460px] rounded-3xl overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-mystical-900/40 via-mystical-800/30 to-mystical-700/20 border border-white/10 shadow-2xl">
              <StarField progress={progress} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-mystical-900/70 via-transparent to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-4 max-w-2xl"
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-light text-amber-300 tracking-wide">
                    Oracle Lumira
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-light leading-relaxed">
                    Explore les lois cachées de ton identité cosmique
                  </p>
                  <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed">
                    Grâce à une cartographie vibratoire personnalisée, Oracle Lumira décrypte les trames subtiles de ton archétype spirituel. Entre analyse fractale, algorithmes mystiques et résonances stellaires, reçois une lecture unique de ton code originel.
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <motion.a
                      href="#analyse-form"
                      className="inline-flex items-center justify-center rounded-full bg-amber-400/90 hover:bg-amber-300 text-mystical-900 font-medium px-6 py-3 transition-colors duration-300 shadow-lg shadow-amber-400/20"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Lancer mon exploration cosmique
                    </motion.a>
                    <span className="text-sm sm:text-base text-amber-200/80">
                      ✨ Analyse sous 24h • PDF initiatique + Audio 432Hz + Mandala fractal ✨
                    </span>
                  </div>

                  <div className="pt-6 flex items-center space-x-3">
                    <div className="w-32 sm:w-40 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      />
                    </div>
                    <span className="text-sm text-amber-300 font-medium">{progress}% éveil atteint</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MandalaNav />
          </motion.div>

          {isBaseSanctuaire && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-8"
            >
              <GlassCard className="bg-white/5 border-white/10 backdrop-blur-xl">
                <div className="space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-cinzel text-white/90">L'Ascension des Niveaux d'Éveil</h2>
                  <p className="text-base text-white/80 leading-relaxed">
                    Tu n'achètes pas un produit. Tu ouvres une porte. Chaque niveau est une clef vibratoire pour franchir les couches profondes de ta conscience.
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {ascensionLevels.map((level, index) => (
                      <motion.div
                        key={level.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      >
                        <GlassCard className="h-full bg-mystical-900/40 border-white/10 backdrop-blur-2xl flex flex-col">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col">
                              <span className="text-sm uppercase tracking-widest text-amber-300/80">{level.price}</span>
                              <h3 className="text-xl font-cinzel text-white/90">{level.title}</h3>
                            </div>
                            <p className="text-sm text-white/75 leading-relaxed">{level.description}</p>
                          </div>
                          <ul className="mt-4 space-y-2 text-sm text-white/80 flex-1">
                            {level.bullets.map((bullet) => (
                              <li key={bullet} className="flex items-start gap-2">
                                <span className="text-amber-300 pt-1">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                          <motion.button
                            type="button"
                            className="mt-6 inline-flex items-center justify-center rounded-full bg-amber-400/90 hover:bg-amber-300 text-mystical-900 font-medium px-5 py-2 transition-colors duration-300 shadow-md shadow-amber-400/20"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            {level.cta}
                          </motion.button>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <GlassCard id="analyse-form" className="bg-white/5 border-white/10 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-cinzel text-white/90">Commence ton analyse fractale</h2>
                    <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                      Remplis ce champ vibratoire pour synchroniser ta lecture cosmique.
                    </p>
                  </div>
                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                    }}
                  >
                    <label className="block text-sm font-medium text-white/70">
                      Prénom
                      <input
                        name="prenom"
                        type="text"
                        placeholder="Identité vibratoire actuelle"
                        className="mt-2 w-full rounded-xl border border-white/20 bg-mystical-900/60 px-4 py-3 text-white placeholder-white/40 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/40 transition"
                        required
                      />
                    </label>
                    <motion.button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-amber-400/90 hover:bg-amber-300 text-mystical-900 font-medium px-6 py-3 transition-colors duration-300 shadow-lg shadow-amber-400/25"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Harmoniser ma lecture
                    </motion.button>
                  </form>
                </div>
              </GlassCard>

              <div className="grid gap-6 lg:grid-cols-2">
                <GlassCard className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-cinzel text-white/90">Témoignages vibratoires</h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {testimonials.map((testimonial) => (
                        <GlassCard
                          key={testimonial.author}
                          className="bg-mystical-900/50 border-white/10 backdrop-blur-2xl space-y-3"
                        >
                          <p className="text-sm text-white/80 leading-relaxed italic">"{testimonial.quote}"</p>
                          <div className="text-sm text-amber-200/90">
                            <p className="font-medium">{testimonial.author}</p>
                            <p>{testimonial.role}</p>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-cinzel text-white/90">Compléments dimensionnels</h2>
                    <ul className="space-y-3 text-sm text-white/80">
                      {complements.map((item) => (
                        <li key={item.name} className="flex items-center justify-between rounded-xl bg-mystical-900/40 border border-white/10 px-4 py-3">
                          <span>{item.name}</span>
                          <span className="text-amber-300 font-medium">{item.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              </div>

              <motion.footer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="rounded-3xl border border-white/10 bg-mystical-900/60 px-6 py-8 text-white/75 backdrop-blur-2xl"
              >
                <div className="space-y-3">
                  <p className="text-lg font-cinzel text-white">Oracle Lumira</p>
                  <p className="text-sm leading-relaxed">
                    Cartographie mystique personnalisée • Analyse vibratoire avancée • Révélation archétypale
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-white/70">
                    <span>oracle@lumira.com</span>
                    <span>Support 7j/7</span>
                    <span>Réponse sous 24h</span>
                    <span>Mentions légales</span>
                    <span>Données chiffrées</span>
                    <span>Paiements gardés par les Sceaux</span>
                  </div>
                </div>
              </motion.footer>
            </motion.section>
          )}

          <ContextualHint />

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
