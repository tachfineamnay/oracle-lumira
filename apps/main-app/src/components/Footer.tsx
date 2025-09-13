import React from 'react';
import { Heart, Mail, Shield, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-mystical-black border-t border-mystical-moonlight/20 py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="relative z-10">
            <h3 className="font-playfair text-2xl font-medium text-mystical-starlight mb-4">
              Oracle Lumira
            </h3>
            <p className="font-inter text-mystical-silver leading-relaxed mb-6">
              Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées. 
              Une expérience mystique moderne pour explorer les profondeurs de ton âme.
            </p>
            <div className="flex items-center gap-2 text-mystical-moonlight">
              <Heart className="w-4 h-4" />
              <span className="font-inter text-sm">Avec amour et lumière</span>
            </div>
          </div>

          {/* Contact */}
          <div className="relative z-10">
            <h4 className="font-inter font-semibold text-mystical-starlight mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-mystical-silver">
                <Mail className="w-4 h-4 text-mystical-moonlight" />
                <span className="font-inter text-sm">oracle@lumira.com</span>
              </div>
              <p className="font-inter text-xs text-mystical-silver/70">
                Réponse sous 24h • Support disponible 7j/7
              </p>
            </div>
          </div>

          {/* Legal */}
          <div className="relative z-10">
            <h4 className="font-inter font-semibold text-mystical-starlight mb-4">Légal</h4>
            <div className="space-y-3">
              <a 
                href="/mentions-legales" 
                className="flex items-center gap-2 text-mystical-silver hover:text-mystical-moonlight transition-colors duration-500"
              >
                <Shield className="w-4 h-4" />
                <span className="font-inter text-sm">Mentions légales</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="font-inter text-xs text-mystical-silver/70">
                Paiements sécurisés • Données protégées
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-mystical-moonlight/20 my-12" />

        {/* Bottom */}
        <div className="text-center relative z-10">
          <p className="font-inter text-sm text-mystical-silver/70">
            © 2024 Oracle Lumira. Tous droits réservés. 
            <span className="text-mystical-moonlight ml-2">
              ✨ Made with spiritual energy
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;