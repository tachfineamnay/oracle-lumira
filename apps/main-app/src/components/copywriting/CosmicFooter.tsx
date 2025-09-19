import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Heart,
  Shield,
  Lock,
  ExternalLink,
  Star
} from 'lucide-react';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours: string;
}

export interface CosmicFooterProps {
  brandName: string;
  tagline: string;
  sections: FooterSection[];
  contact: ContactInfo;
  socialLinks: FooterLink[];
  legalLinks: FooterLink[];
  certifications: string[];
  currentYear: number;
  className?: string;
}

const CosmicFooter: React.FC<CosmicFooterProps> = ({
  brandName,
  tagline,
  sections,
  contact,
  socialLinks,
  legalLinks,
  certifications,
  currentYear,
  className = ''
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <footer className={`relative bg-gradient-to-t from-mystical-900 via-mystical-800 to-mystical-700 ${className}`}>
      {/* Cosmic Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <div className="mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-mystical-600/20 flex items-center justify-center border border-amber-400/30">
                    <Star className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-cinzel font-light text-white">
                    {brandName}
                  </h3>
                </motion.div>
                
                <p className="text-white/70 mb-6 leading-relaxed">
                  {tagline}
                </p>

                {/* Certifications */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm uppercase tracking-wider">
                    Certifications & Garanties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs"
                      >
                        <Shield className="w-3 h-3 text-emerald-400" />
                        {cert}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Sections */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.map((section, sectionIndex) => (
                <motion.div key={sectionIndex} variants={itemVariants}>
                  <h4 className="text-white font-medium mb-6 text-sm uppercase tracking-wider">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <motion.a
                          href={link.href}
                          target={link.external ? '_blank' : '_self'}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          whileHover={{ x: 4 }}
                          className="inline-flex items-center gap-2 text-white/70 hover:text-amber-400 transition-colors duration-300 text-sm group"
                        >
                          {link.label}
                          {link.external && (
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </motion.a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Contact Info */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h4 className="text-white font-medium mb-6 text-sm uppercase tracking-wider">
                Contact
              </h4>
              <div className="space-y-4">
                <motion.div 
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 text-white/70 hover:text-amber-400 transition-colors duration-300"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-sm">
                    {contact.email}
                  </a>
                </motion.div>

                <motion.div 
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 text-white/70 hover:text-amber-400 transition-colors duration-300"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <a href={`tel:${contact.phone}`} className="text-sm">
                    {contact.phone}
                  </a>
                </motion.div>

                <div className="flex items-start gap-3 text-white/70">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{contact.address}</span>
                </div>

                <div className="flex items-start gap-3 text-white/70">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{contact.hours}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="border-t border-white/10 my-12"
          />

          {/* Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Social Links */}
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <span className="text-white/60 text-sm">Suivez-nous :</span>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300"
                  >
                    <span className="sr-only">{social.label}</span>
                    {/* Icon would be determined by social.label */}
                    <Heart className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={itemVariants} className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Paiement sécurisé SSL</span>
              </div>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
                <span className="text-white/60 text-sm ml-2">4.9/5 • 2,847 avis</span>
              </div>
            </motion.div>

            {/* Legal Links */}
            <motion.div variants={itemVariants} className="flex items-center gap-6">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-white/60 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          </div>

          {/* Copyright */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-8 pt-8 border-t border-white/10"
          >
            <p className="text-white/50 text-sm">
              © {currentYear} {brandName}. Tous droits réservés. 
              <span className="mx-2">•</span>
              Développé avec <Heart className="w-4 h-4 inline text-amber-400" /> pour les âmes en quête de lumière.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
    </footer>
  );
};

export default CosmicFooter;