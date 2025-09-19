import React from 'react';
import { Check, Shield, Star, Clock, Plus } from 'lucide-react';
import {
  HeroLumira,
  LevelSection,
  VibratoryForm,
  TestimonialCarousel,
  DimensionalUpsells,
  CosmicFooter,
  copyLabels
} from './index';

/**
 * Example Oracle Lumira Marketing Page
 * Demonstrates usage of all copywriting components with proper data structure
 */
const OracleLumiraExample: React.FC = () => {
  const locale = 'fr'; // or 'en'
  const copy = copyLabels[locale];

  // Example handlers
  const handleVibratorySubmit = (data: { firstName: string; energyLevel?: number; intention?: string }) => {
    console.log('Vibratory form submitted:', data);
    // Handle form submission logic
  };

  const handleUpsellSelect = (upsellId: string) => {
    console.log('Upsell selected:', upsellId);
    // Handle upsell selection logic
  };

  // Example testimonials data
  const testimonials = [
    {
      id: '1',
      name: 'Marie Dubois',
      location: 'Paris, France',
      rating: 5,
      text: 'Oracle Lumira a transformé ma compréhension spirituelle. Les guidances sont d\'une précision remarquable.',
      service: 'Consultation Complète',
      date: 'Janvier 2024'
    },
    {
      id: '2',
      name: 'Sophie Laurent',
      location: 'Lyon, France',
      rating: 5,
      text: 'Une expérience transcendante qui m\'a reconnectée à mon essence profonde. Merci infiniment.',
      service: 'Guidance Spirituelle',
      date: 'Décembre 2023'
    },
    {
      id: '3',
      name: 'Claire Martin',
      location: 'Marseille, France',
      rating: 5,
      text: 'Des révélations qui ont éclairé mon chemin de vie. Un service d\'exception avec une approche authentique.',
      service: 'Lecture Énergétique',
      date: 'Février 2024'
    }
  ];

  // Example upsells data
  const upsells = [
    {
      id: 'premium-guidance',
      title: 'Guidance Premium',
      subtitle: 'Accès complet aux énergies',
      price: '97€',
      originalPrice: '147€',
      badge: 'Offre limitée',
      description: 'Plongez dans une guidance spirituelle complète avec accès aux dimensions supérieures.',
      features: [
        { icon: <Star className="w-4 h-4" />, text: 'Consultation privée 90 min' },
        { icon: <Check className="w-4 h-4" />, text: 'Rapport énergétique détaillé' },
        { icon: <Shield className="w-4 h-4" />, text: 'Protection spirituelle incluse' }
      ],
      ctaLabel: 'Choisir Premium',
      popular: true,
      urgency: 'Plus que 3 places disponibles',
      type: 'premium' as const
    },
    {
      id: 'extended-session',
      title: 'Session Étendue',
      subtitle: 'Temps d\'exploration approfondi',
      price: '67€',
      description: 'Prolongez votre session pour une exploration spirituelle plus profonde.',
      features: [
        { icon: <Clock className="w-4 h-4" />, text: '+30 minutes de guidance' },
        { icon: <Check className="w-4 h-4" />, text: 'Questions supplémentaires' },
        { icon: <Star className="w-4 h-4" />, text: 'Méditation guidée bonus' }
      ],
      ctaLabel: 'Étendre la session',
      type: 'extended' as const
    },
    {
      id: 'protection-shield',
      title: 'Bouclier Énergétique',
      subtitle: 'Protection spirituelle renforcée',
      price: '37€',
      description: 'Activez une protection énergétique puissante pour votre parcours spirituel.',
      features: [
        { icon: <Shield className="w-4 h-4" />, text: 'Bouclier énergétique 30 jours' },
        { icon: <Check className="w-4 h-4" />, text: 'Rituel de protection personnalisé' },
        { icon: <Star className="w-4 h-4" />, text: 'Méditation de purification' }
      ],
      ctaLabel: 'Activer la protection',
      type: 'protection' as const
    },
    {
      id: 'priority-access',
      title: 'Accès Prioritaire',
      subtitle: 'Réservations en urgence',
      price: '27€',
      description: 'Obtenez un accès prioritaire aux créneaux de consultation.',
      features: [
        { icon: <Clock className="w-4 h-4" />, text: 'Réservation sous 24h' },
        { icon: <Plus className="w-4 h-4" />, text: 'Support prioritaire' },
        { icon: <Star className="w-4 h-4" />, text: 'Rappels personnalisés' }
      ],
      ctaLabel: 'Accès prioritaire',
      type: 'priority' as const
    }
  ];

  // Footer data
  const footerSections = [
    {
      title: 'Services',
      links: [
        { label: 'Guidance Spirituelle', href: '/guidance' },
        { label: 'Lecture Énergétique', href: '/lecture-energetique' },
        { label: 'Consultation Privée', href: '/consultation' },
        { label: 'Méditation Guidée', href: '/meditation' }
      ]
    },
    {
      title: 'Ressources',
      links: [
        { label: 'Blog Spirituel', href: '/blog' },
        { label: 'Méditations Gratuites', href: '/meditations' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Témoignages', href: '/testimonials' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Centre d\'Aide', href: '/help' },
        { label: 'Contact', href: '/contact' },
        { label: 'Réserver une Session', href: '/booking' },
        { label: 'Urgence Spirituelle', href: '/urgence', external: true }
      ]
    }
  ];

  const contactInfo = {
    email: 'lumiere@oracle-lumira.com',
    phone: '+33 1 23 45 67 89',
    address: 'Centre Spirituel, Paris, France',
    hours: 'Lun-Ven 9h-18h, Sam 10h-16h'
  };

  const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com/oracle-lumira' },
    { label: 'Instagram', href: 'https://instagram.com/oracle-lumira' },
    { label: 'YouTube', href: 'https://youtube.com/oracle-lumira' },
    { label: 'TikTok', href: 'https://tiktok.com/@oracle-lumira' }
  ];

  const legalLinks = [
    { label: 'Mentions Légales', href: '/legal' },
    { label: 'Confidentialité', href: '/privacy' },
    { label: 'CGV', href: '/terms' },
    { label: 'Cookies', href: '/cookies' }
  ];

  const certifications = [
    'Certifié ISO 27001',
    'RGPD Conforme',
    'SSL Sécurisé',
    'Paiement PCI DSS'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-mystical-900 via-mystical-800 to-mystical-700">
      {/* Hero Section */}
      <HeroLumira
        title={copy.hero.title}
        subTitle={copy.hero.subTitle}
        ctaLabel={copy.hero.ctaLabel}
        perks={copy.hero.perks}
        onCTAClick={() => console.log('Primary CTA clicked')}
      />

      {/* Levels Section */}
      <LevelSection
        title="Choisissez Votre Niveau de Guidance"
        subtitle="Découvrez la guidance spirituelle adaptée à votre cheminement personnel"
        levels={[
          { level: 1 as const, ...copy.levels.decouverte },
          { level: 2 as const, ...copy.levels.evolution },
          { level: 3 as const, ...copy.levels.maitrise },
          { level: 4 as const, ...copy.levels.transcendance }
        ]}
      />

      {/* Vibratory Form */}
      <VibratoryForm
        title={copy.vibratory.title}
        nameLabel={copy.vibratory.nameLabel}
        namePlaceholder={copy.vibratory.namePlaceholder}
        syncLabel={copy.vibratory.syncLabel}
        submitLabel={copy.vibratory.submitLabel}
        description={copy.vibratory.description}
        onSubmit={handleVibratorySubmit}
      />

      {/* Testimonials */}
      <TestimonialCarousel
        title={copy.testimonials.title}
        subtitle="Découvrez les expériences transformatrices de nos consultants"
        testimonials={testimonials}
        autoPlayDelay={6000}
        showControls={true}
      />

      {/* Upsells */}
      <DimensionalUpsells
        title={copy.upsells.title}
        subtitle="Enrichissez votre expérience spirituelle avec nos compléments sacrés"
        upsells={upsells}
        onSelectUpsell={handleUpsellSelect}
      />

      {/* Footer */}
      <CosmicFooter
        brandName="Oracle Lumira"
        tagline="Votre passerelle vers la lumière spirituelle et la guidance divine"
        sections={footerSections}
        contact={contactInfo}
        socialLinks={socialLinks}
        legalLinks={legalLinks}
        certifications={certifications}
        currentYear={new Date().getFullYear()}
      />
    </div>
  );
};

export default OracleLumiraExample;