import React from 'react';
import { Heart, Mail, Shield, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-mystical-abyss border-t border-mystical-gold/20 py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="relative z-10">
            <h3 className="font-playfair italic text-2xl font-medium text-mystical-starlight mb-4">
              Oracle Lumira
            </h3>
            <p className="font-inter font-light text-mystical-silver leading-relaxed mb-6">
              Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées. 
              Une expérience mystique moderne pour explorer les profondeurs de ton âme.
            </p>
            <div className="flex items-center gap-2 text-mystical-gold">
              <Heart className="w-4 h-4 animate-gold-pulse" />
              <span className="font-inter font-light text-sm">Avec amour et lumière</span>
            </div>
          </div>

          {/* Contact */}
          <div className="relative z-10">
            <h4 className="font-inter font-light text-mystical-starlight mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-mystical-silver">
                <Mail className="w-4 h-4 text-mystical-gold" />
                <span className="font-inter font-light text-sm">oracle@lumira.com</span>
              </div>
              <p className="font-inter font-light text-xs text-mystical-silver/70">
                Réponse sous 24h • Support disponible 7j/7
              </p>
            </div>
          </div>

          {/* Legal */}
          <div className="relative z-10">
            <h4 className="font-inter font-light text-mystical-starlight mb-4">Légal</h4>
            <div className="space-y-3">
              <a 
                href="/mentions-legales" 
                className="flex items-center gap-2 text-mystical-silver hover:text-mystical-gold transition-colors duration-500"
              >
                <Shield className="w-4 h-4" />
                <span className="font-inter font-light text-sm">Mentions légales</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="font-inter font-light text-xs text-mystical-silver/70">
                Paiements sécurisés • Données protégées
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-mystical-gold/20 my-12" />

        {/* Bottom */}
        <div className="text-center relative z-10">
          <p className="font-inter font-light text-sm text-mystical-silver/70">
            © 2024 Oracle Lumira. Tous droits réservés. 
            <span className="text-mystical-gold ml-2 animate-gold-pulse">
              ✨ Made with spiritual energy
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

