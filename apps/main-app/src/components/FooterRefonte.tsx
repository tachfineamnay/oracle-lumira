import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * FooterRefonte - Footer avec accessibilité améliorée
 *
 * CHANGEMENTS vs version originale :
 * - Contraste optimisé partout (text-white/80, text-white/70)
 * - Layout 3 colonnes responsive
 * - Divider animé avec gradient
 * - Starfield background animation
 */
const FooterRefonte: React.FC = () => {
  return (
    <footer className="relative bg-cosmic-void/95 border-t border-cosmic-ethereal/10 py-16 px-6 overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Divider animé */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="h-px bg-gradient-to-r from-transparent via-cosmic-gold to-transparent mb-12"
        ></motion.div>

        {/* Contenu du footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Colonne 1 : Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-cosmic-gold" />
              <h3 className="text-2xl font-bold text-white">Oracle Lumira</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              Cartographie mystique personnalisée · Analyse vibratoire avancée · Révélation archétypale
            </p>
            <a href="mailto:oracle@oraclelumira.com" className="text-cosmic-gold hover:text-cosmic-aurora transition-colors text-sm font-medium">
              oracle@oraclelumira.com
            </a>
          </div>

          {/* Colonne 2 : Informations */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Service</h4>
            <ul className="space-y-2">
              <li>
                <p className="text-white/70 text-sm">⭐ Support 7j/7</p>
              </li>
              <li>
                <p className="text-white/70 text-sm">⚡ Réponse sous 24h</p>
              </li>
              <li>
                <p className="text-white/70 text-sm">🔒 Données chiffrées</p>
              </li>
              <li>
                <p className="text-white/70 text-sm">💫 Paiements protégés</p>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Informations Légales</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/mentions-legales" className="text-white/70 hover:text-cosmic-gold transition-colors text-sm">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link to="/cgv" className="text-white/70 hover:text-cosmic-gold transition-colors text-sm">
                  Conditions Générales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-white/70 hover:text-cosmic-gold transition-colors text-sm">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                {/* Lien d’ancre intra-page conservé pour un scroll immédiat */}
                <a href="#levels" className="text-white/70 hover:text-cosmic-gold transition-colors text-sm">
                  Nos Niveaux d'Éveil
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} Oracle Lumira. Tous droits réservés.</p>
          <p className="text-white/50 text-xs mt-2">Fait avec 💜 pour éveiller les âmes</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterRefonte;

