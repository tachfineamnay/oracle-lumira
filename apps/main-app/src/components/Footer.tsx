import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Shield, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-lumira-pearl via-lumira-mist to-lumira-pearl border-t border-lumira-gold-soft/30 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="font-playfair italic text-2xl font-medium text-lumira-copper mb-4">
              Oracle Lumira
            </h3>
            <p className="font-inter text-lumira-night/70 leading-relaxed mb-6">
              Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées. 
              Une expérience mystique moderne pour explorer les profondeurs de ton âme.
            </p>
            <div className="flex items-center gap-2 text-lumira-gold-soft">
              <Heart className="w-4 h-4" />
              <span className="font-inter text-sm">Avec amour et lumière</span>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-inter font-semibold text-lumira-night mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-lumira-night/70">
                <Mail className="w-4 h-4 text-lumira-copper" />
                <span className="font-inter text-sm">oracle@lumira.com</span>
              </div>
              <p className="font-inter text-xs text-lumira-night/50">
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
          >
            <h4 className="font-inter font-semibold text-lumira-night mb-4">Légal</h4>
            <div className="space-y-3">
              <a 
                href="/mentions-legales" 
                className="flex items-center gap-2 text-lumira-night/70 hover:text-lumira-copper transition-colors duration-300"
              >
                <Shield className="w-4 h-4" />
                <span className="font-inter text-sm">Mentions légales</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="font-inter text-xs text-lumira-night/50">
                Paiements sécurisés • Données protégées
              </p>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-lumira-gold-soft/30 my-8"></div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-inter text-sm text-lumira-night/60">
            © 2024 Oracle Lumira. Tous droits réservés. 
            <span className="text-lumira-copper ml-2">✨ Made with spiritual energy</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;