import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Shield, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-mystical-dark via-mystical-purple/10 to-mystical-dark border-t border-mystical-gold/30 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
              Oracle Lumira
            </h3>
            <p className="font-inter text-gray-400 leading-relaxed mb-6">
              Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées. 
              Une expérience mystique moderne pour explorer les profondeurs de ton âme.
            </p>
            <div className="flex items-center gap-2 text-mystical-gold">
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
            <h4 className="font-inter font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4 text-mystical-gold" />
                <span className="font-inter text-sm">oracle@lumira.com</span>
              </div>
              <p className="font-inter text-xs text-gray-500">
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
            <h4 className="font-inter font-semibold text-white mb-4">Légal</h4>
            <div className="space-y-3">
              <a 
                href="/mentions-legales" 
                className="flex items-center gap-2 text-gray-400 hover:text-mystical-gold transition-colors duration-300"
              >
                <Shield className="w-4 h-4" />
                <span className="font-inter text-sm">Mentions légales</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="font-inter text-xs text-gray-500">
                Paiements sécurisés • Données protégées
              </p>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-mystical-gold/20 my-8"></div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-inter text-sm text-gray-500">
            © 2024 Oracle Lumira. Tous droits réservés. 
            <span className="text-mystical-gold ml-2">✨ Made with spiritual energy</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
