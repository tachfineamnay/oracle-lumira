import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Instagram, Youtube, User } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-16 relative border-t border-mystical-gold/20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
              Archétype Mystique
            </h3>
            <p className="font-inter font-light text-gray-400 leading-relaxed">
              Révélez votre essence profonde à travers des lectures vibratoires personnalisées.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-inter font-medium text-white mb-4">Liens utiles</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/mentions-legales"
                  className="font-inter text-gray-400 hover:text-mystical-gold transition-colors duration-300"
                >
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link
                  to="/mentions-legales"
                  className="font-inter text-gray-400 hover:text-mystical-gold transition-colors duration-300"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@oraclelumira.com"
                  className="font-inter text-gray-400 hover:text-mystical-gold transition-colors duration-300"
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  to="/mentions-legales"
                  className="font-inter text-gray-400 hover:text-mystical-gold transition-colors duration-300"
                >
                  À propos
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Social & Access */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="font-inter font-medium text-white mb-4">Suivez-nous</h4>
            <div className="flex gap-4 mb-6">
              {[
                { icon: Instagram, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Mail, href: "#" },
              ].map(({ icon: Icon, href }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  className="w-10 h-10 rounded-full bg-mystical-gold/20 border border-mystical-gold/30 flex items-center justify-center text-mystical-gold hover:bg-mystical-gold/30 hover:scale-110 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            <Link
              to="/sanctuaire"
              className="flex items-center gap-2 text-mystical-gold hover:text-mystical-gold-light transition-colors duration-300 font-inter text-sm"
            >
              <User className="w-4 h-4" />
              Déjà un compte ?
            </Link>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-mystical-gold/20 text-center"
        >
          <p className="font-inter text-gray-500">
            © 2025 Archétype Mystique. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;