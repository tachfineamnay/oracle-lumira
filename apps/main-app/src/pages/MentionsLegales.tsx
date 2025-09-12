import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';

const MentionsLegales: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout variant="dark" className="py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-mystical-gold hover:text-mystical-gold-light transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-inter text-sm">Retour à l'accueil</span>
          </button>

          <SectionHeader
            title="Mentions Légales"
            icon={<Shield className="w-8 h-8 text-mystical-gold" />}
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassCard>
            <div className="prose prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
                  Éditeur du site
                </h2>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Oracle Lumira</strong></p>
                  <p>Auto-entreprise</p>
                  <p>SIRET : 12345678901234</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-mystical-gold" />
                    <span>123 Rue de la Spiritualité, 75001 Paris, France</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-mystical-gold" />
                    <span>contact@oraclelumira.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-mystical-gold" />
                    <span>+33 1 23 45 67 89</span>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
                  Hébergement
                </h2>
                <p className="text-gray-300">
                  Ce site est hébergé par Coolify v4 - France
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
                  Propriété intellectuelle
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes)
                  est protégé par le droit d'auteur et appartient à Oracle Lumira ou à ses partenaires.
                  Toute reproduction, même partielle, est interdite sans autorisation préalable.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
                  Protection des données
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Conformément au RGPD, vos données personnelles sont collectées uniquement
                  dans le cadre de la prestation de services. Vous disposez d'un droit d'accès,
                  de rectification et de suppression de vos données en nous contactant à
                  privacy@oraclelumira.com.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
                  Nature des prestations
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Les lectures proposées par Oracle Lumira sont des prestations de développement
                  personnel et de bien-être. Elles ne constituent en aucun cas un avis médical,
                  juridique ou financier. Ces services sont destinés au divertissement et à
                  l'introspection personnelle.
                </p>
              </section>

              <section>
                <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
                  Responsabilité
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Oracle Lumira ne saurait être tenue responsable des décisions prises par
                  les utilisateurs suite aux lectures fournies. Chaque individu reste seul
                  responsable de ses choix et de ses actes.
                </p>
              </section>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default MentionsLegales;

