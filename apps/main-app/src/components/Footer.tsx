import React from 'react';
import { Heart, Mail, Shield, ExternalLink, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cosmic-void border-t border-cosmic-gold/20 py-20 relative overflow-hidden">
      {/* Aurore de footer subtile */}
      <div className="absolute inset-0 bg-gradient-to-t from-cosmic-void via-cosmic-deep/30 to-transparent"></div>
      
      {/* Étoiles de footer discrètes */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-star rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h3 
              className="font-playfair italic text-3xl font-bold text-cosmic-divine mb-4"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.3)',
                  '0 0 30px rgba(255, 215, 0, 0.5)',
                  '0 0 20px rgba(255, 215, 0, 0.3)',
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Oracle Lumira
            </motion.h3>
            <p className="font-inter font-light text-cosmic-ethereal leading-relaxed mb-6">
              Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées. 
              Une expérience mystique moderne pour explorer les profondeurs cosmiques de ton âme.
            </p>
            <motion.div 
              className="flex items-center gap-2 text-cosmic-gold"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-5 h-5" />
              </motion.div>
              <span className="font-inter font-light text-sm">Avec amour et lumière stellaire</span>
            </motion.div>
          </motion.div>

          {/* Contact */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-inter font-medium text-cosmic-divine mb-4">Contact Cosmique</h4>
            <div className="space-y-3">
              <motion.div 
                className="flex items-center gap-3 text-cosmic-ethereal"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Mail className="w-5 h-5 text-cosmic-gold" />
                <span className="font-inter font-light text-sm">oracle@lumira.com</span>
              </motion.div>
              <p className="font-inter font-light text-xs text-cosmic-silver/70">
                Réponse sous 24h • Support disponible 7j/7 sous les étoiles
              </p>
            </div>
          </motion.div>

          {/* Legal */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="font-inter font-medium text-cosmic-divine mb-4">Légal</h4>
            <div className="space-y-3">
              <motion.a 
                href="/mentions-legales" 
                className="flex items-center gap-2 text-cosmic-ethereal hover:text-cosmic-gold transition-colors duration-500"
                whileHover={{ x: 5 }}
              >
                <Shield className="w-4 h-4" />
                <span className="font-inter font-light text-sm">Mentions légales</span>
                <ExternalLink className="w-3 h-3" />
              </motion.a>
              <p className="font-inter font-light text-xs text-cosmic-silver/70">
                Paiements sécurisés • Données protégées par les gardiens cosmiques
              </p>
            </div>
          </motion.div>
        </div>

        {/* Divider cosmique */}
        <motion.div 
          className="border-t border-cosmic-gold/20 my-12 relative"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmic-gold/30 to-transparent h-px"></div>
        </motion.div>

        {/* Bottom */}
        <motion.div 
          className="text-center relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="font-inter font-light text-sm text-cosmic-silver/70">
            © 2024 Oracle Lumira. Tous droits réservés. 
            <motion.span 
              className="text-cosmic-gold ml-2 inline-flex items-center gap-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="w-4 h-4" />
              Made with cosmic energy
              <Star className="w-4 h-4" />
            </motion.span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;