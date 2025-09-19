// Single source of truth for Oracle Lumira copywriting
// Supports FR/EN i18n with prop-driven components

export type Locale = 'fr' | 'en';

export interface CopyLabels {
  hero: {
    title: string;
    subTitle: string;
    ctaLabel: string;
    perks: string[];
  };
  levels: {
    [key: string]: {
      title: string;
      price: string;
      duration: string;
      features: string[];
      ctaLabel: string;
      popular?: boolean;
    };
  };
  vibratory: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    syncLabel: string;
    submitLabel: string;
    description: string;
  };
  testimonials: {
    title: string;
    items: Array<{
      text: string;
      author: string;
      level: string;
    }>;
  };
  upsells: {
    title: string;
    items: Array<{
      title: string;
      description: string;
      price: string;
      ctaLabel: string;
    }>;
  };
  footer: {
    supportTitle: string;
    supportText: string;
    email: string;
    legal: {
      privacy: string;
      terms: string;
      refunds: string;
    };
    seals: string[];
  };
}

export const copyLabels: Record<Locale, CopyLabels> = {
  fr: {
    hero: {
      title: "Révélez votre Lumière Intérieure",
      subTitle: "Consultation Oracle personnalisée avec guidance spirituelle authentique",
      ctaLabel: "Découvrir Mon Chemin Lumineux",
      perks: [
        "✨ Lecture intuitive personnalisée",
        "🔮 Guidance spirituelle authentique", 
        "💎 Transformation vibratoire profonde",
        "🌟 Accompagnement bienveillant"
      ]
    },
    levels: {
      niveau1: {
        title: "Éveil Spirituel",
        price: "47€",
        duration: "30 min",
        features: [
          "Lecture Oracle personnalisée",
          "3 cartes de guidance",
          "Message spirituel audio",
          "PDF récapitulatif"
        ],
        ctaLabel: "Commencer Mon Éveil"
      },
      niveau2: {
        title: "Illumination Profonde", 
        price: "97€",
        duration: "60 min",
        features: [
          "Lecture Oracle approfondie",
          "7 cartes de transformation",
          "Guidance audio 20 min",
          "Mandala énergétique personnalisé",
          "Rituel de purification"
        ],
        ctaLabel: "Choisir l'Illumination",
        popular: true
      },
      niveau3: {
        title: "Maîtrise Cosmique",
        price: "197€", 
        duration: "90 min",
        features: [
          "Lecture Oracle complète",
          "12 cartes de maîtrise",
          "Session guidée 45 min",
          "Mandala + Cristal énergétique",
          "3 rituels de transformation",
          "Support 7 jours"
        ],
        ctaLabel: "Atteindre la Maîtrise"
      },
      niveau4: {
        title: "Ascension Divine",
        price: "397€",
        duration: "120 min", 
        features: [
          "Lecture Oracle transcendante",
          "Tirage complet 21 cartes",
          "Session privée 90 min",
          "Kit spirituel complet",
          "Rituels de maîtrise",
          "Accompagnement 30 jours",
          "Accès groupe privé"
        ],
        ctaLabel: "Transcender Maintenant"
      }
    },
    vibratory: {
      title: "Synchro Vibratoire Personnalisée",
      nameLabel: "Votre Prénom Sacré",
      namePlaceholder: "Entrez votre prénom...",
      syncLabel: "Fréquence Énergétique",
      submitLabel: "Synchroniser Mon Énergie",
      description: "Votre prénom révèle votre fréquence vibratoire unique. Laissez l'Oracle s'harmoniser à votre essence."
    },
    testimonials: {
      title: "Témoignages Lumineux",
      items: [
        {
          text: "Cette lecture m'a littéralement transformée. J'ai retrouvé ma mission de vie grâce à l'Oracle Lumira.",
          author: "Marie-Claire",
          level: "Niveau III"
        },
        {
          text: "Incroyable justesse ! Chaque carte résonnait parfaitement avec ma situation. Merci pour cette guidance précieuse.",
          author: "Alexandre", 
          level: "Niveau II"
        },
        {
          text: "L'accompagnement de 30 jours m'a aidé à intégrer les messages. Une expérience spirituelle authentique.",
          author: "Sophia",
          level: "Niveau IV"
        }
      ]
    },
    upsells: {
      title: "Compléments Dimensionnels", 
      items: [
        {
          title: "Cristal Programmé",
          description: "Quartz Rose énergétisé selon votre lecture",
          price: "+27€",
          ctaLabel: "Ajouter le Cristal"
        },
        {
          title: "Huile Sacrée",
          description: "Synergie d'huiles essentielles personnalisée",
          price: "+39€", 
          ctaLabel: "Ajouter l'Huile"
        },
        {
          title: "Bracelet Chakras",
          description: "7 pierres alignées sur votre profil énergétique",
          price: "+67€",
          ctaLabel: "Ajouter le Bracelet"
        }
      ]
    },
    footer: {
      supportTitle: "Support Bienveillant",
      supportText: "Notre équipe spirituelle vous accompagne avec amour",
      email: "lumiere@oracle-lumira.com",
      legal: {
        privacy: "Confidentialité Sacrée",
        terms: "Conditions Lumineuses", 
        refunds: "Garantie Satisfaction"
      },
      seals: ["🔒 Paiement Sécurisé", "✨ Guidance Authentique", "💎 Satisfaction Garantie"]
    }
  },
  en: {
    hero: {
      title: "Reveal Your Inner Light",
      subTitle: "Personalized Oracle consultation with authentic spiritual guidance",
      ctaLabel: "Discover My Luminous Path",
      perks: [
        "✨ Personalized intuitive reading",
        "🔮 Authentic spiritual guidance",
        "💎 Deep vibrational transformation", 
        "🌟 Loving accompaniment"
      ]
    },
    levels: {
      niveau1: {
        title: "Spiritual Awakening",
        price: "$52",
        duration: "30 min",
        features: [
          "Personalized Oracle reading",
          "3 guidance cards",
          "Spiritual audio message",
          "PDF summary"
        ],
        ctaLabel: "Begin My Awakening"
      },
      niveau2: {
        title: "Deep Illumination",
        price: "$107", 
        duration: "60 min",
        features: [
          "In-depth Oracle reading",
          "7 transformation cards",
          "20 min audio guidance",
          "Personalized energy mandala",
          "Purification ritual"
        ],
        ctaLabel: "Choose Illumination",
        popular: true
      },
      niveau3: {
        title: "Cosmic Mastery",
        price: "$217",
        duration: "90 min",
        features: [
          "Complete Oracle reading",
          "12 mastery cards", 
          "45 min guided session",
          "Mandala + Energy crystal",
          "3 transformation rituals",
          "7-day support"
        ],
        ctaLabel: "Achieve Mastery"
      },
      niveau4: {
        title: "Divine Ascension",
        price: "$437",
        duration: "120 min",
        features: [
          "Transcendent Oracle reading",
          "Complete 21-card spread",
          "90 min private session",
          "Complete spiritual kit",
          "Mastery rituals",
          "30-day accompaniment", 
          "Private group access"
        ],
        ctaLabel: "Transcend Now"
      }
    },
    vibratory: {
      title: "Personalized Vibratory Sync",
      nameLabel: "Your Sacred Name",
      namePlaceholder: "Enter your first name...",
      syncLabel: "Energetic Frequency", 
      submitLabel: "Synchronize My Energy",
      description: "Your name reveals your unique vibrational frequency. Let the Oracle harmonize with your essence."
    },
    testimonials: {
      title: "Luminous Testimonials",
      items: [
        {
          text: "This reading literally transformed me. I found my life mission thanks to Oracle Lumira.",
          author: "Marie-Claire",
          level: "Level III"
        },
        {
          text: "Incredible accuracy! Each card resonated perfectly with my situation. Thank you for this precious guidance.",
          author: "Alexandre",
          level: "Level II" 
        },
        {
          text: "The 30-day accompaniment helped me integrate the messages. An authentic spiritual experience.",
          author: "Sophia",
          level: "Level IV"
        }
      ]
    },
    upsells: {
      title: "Dimensional Complements",
      items: [
        {
          title: "Programmed Crystal",
          description: "Rose Quartz energized according to your reading",
          price: "+$30",
          ctaLabel: "Add Crystal"
        },
        {
          title: "Sacred Oil",
          description: "Personalized essential oil synergy",
          price: "+$43",
          ctaLabel: "Add Oil"
        },
        {
          title: "Chakra Bracelet", 
          description: "7 stones aligned with your energetic profile",
          price: "+$74",
          ctaLabel: "Add Bracelet"
        }
      ]
    },
    footer: {
      supportTitle: "Loving Support",
      supportText: "Our spiritual team accompanies you with love",
      email: "light@oracle-lumira.com",
      legal: {
        privacy: "Sacred Privacy",
        terms: "Luminous Terms",
        refunds: "Satisfaction Guarantee"
      },
      seals: ["🔒 Secure Payment", "✨ Authentic Guidance", "💎 Satisfaction Guaranteed"]
    }
  }
};

export default copyLabels;