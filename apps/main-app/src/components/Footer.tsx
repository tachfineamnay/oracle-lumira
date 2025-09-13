import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Shield, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-mystical-serenity via-mystical-whisper to-mystical-serenity border-t border-mystical-gold/40 py-20 relative overflow-hidden">
      {/* Ondulations footer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-mystical-gold/3 to-mystical-water/3"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          x: ['-50%', '50%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h3 className="font-playfair italic text-2xl font-medium text-mystical-copper/90 mb-4 tracking-wide">
              Oracle Lumira
            </h3>
            <p className="font-inter text-mystical-night/80 leading-relaxed mb-6 tracking-wide">
              Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées. 
              Une expérience mystique moderne pour explorer les profondeurs de ton âme.
            </p>
            <motion.div 
              className="flex items-center gap-2 text-mystical-gold/90"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-4 h-4" />
              <span className="font-inter text-sm tracking-wide">Avec amour et lumière</span>
            </motion.div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h4 className="font-inter font-semibold text-mystical-night/90 mb-4 tracking-wide">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-mystical-night/80">
                <Mail className="w-4 h-4 text-mystical-copper/90" />
                <span className="font-inter text-sm tracking-wide">oracle@lumira.com</span>
              </div>
              <p className="font-inter text-xs text-mystical-night/60 tracking-wide">
                Réponse sous 24h • Support disponible 7j/7
              </p>
            </div>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h4 className="font-inter font-semibold text-mystical-night/90 mb-4 tracking-wide">Légal</h4>
            <div className="space-y-3">
              <a 
                href="/mentions-legales" 
                className="flex items-center gap-2 text-mystical-night/80 hover:text-mystical-copper/90 transition-colors duration-500"
              >
                <Shield className="w-4 h-4" />
                <span className="font-inter text-sm tracking-wide">Mentions légales</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="font-inter text-xs text-mystical-night/60 tracking-wide">
                Paiements sécurisés • Données protégées
              </p>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div 
          className="border-t border-mystical-gold/40 my-12 relative"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center relative z-10"
        >
          <p className="font-inter text-sm text-mystical-night/70 tracking-wide">
            © 2024 Oracle Lumira. Tous droits réservés. 
            <motion.span 
              className="text-mystical-copper/90 ml-2"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ✨ Made with spiritual energy
            </motion.span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;