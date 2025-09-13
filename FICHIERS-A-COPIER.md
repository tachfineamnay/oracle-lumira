# 📋 Fichiers modifiés à copier-coller dans VS Code

## 🎯 Instructions
1. Ouvrez chaque fichier dans VS Code
2. Sélectionnez tout le contenu (Ctrl+A)
3. Collez le nouveau contenu ci-dessous
4. Sauvegardez (Ctrl+S)

---

## 📁 Fichier 1: `apps/main-app/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mystical: {
          // Base colors - Noir abyssal et Bleu nuit
          'black': '#000000',
          'abyss': '#0A0A0F',
          'midnight': '#0F172A',
          'deep-blue': '#1E293B',
          'navy': '#334155',
          
          // Lumières mystiques
          'gold': '#D4AF37',
          'gold-light': '#FFD700',
          'violet-astral': '#C084FC',
          'purple': '#A78BFA',
          
          // Accents lunaires
          'moonlight': '#E2E8F0',
          'starlight': '#F8FAFC',
          'silver': '#CBD5E1',
          
          // Forêt mystique
          'forest-dark': '#0A0F0A',
          'forest-deep': '#1A2F1A',
          'moss': '#2D5A2D',
          'sage': '#4A6741',
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'wave-gentle': 'wave-gentle 8s ease-in-out infinite',
        'gold-pulse': 'gold-pulse 3s ease-in-out infinite',
        'shooting-star': 'shooting-star 2s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'wave-gentle': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.02)' },
        },
        'gold-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'shooting-star': {
          '0%': { transform: 'translateX(-100px) translateY(-100px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(300px) translateY(300px)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'moonlight': '0 4px 20px rgba(226, 232, 240, 0.1)',
        'forest': '0 8px 32px rgba(10, 15, 10, 0.3)',
      },
    },
  },
  plugins: [],
};
```

---

## 📁 Fichier 2: `apps/main-app/src/App.tsx`

```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import LandingTemple from './pages/LandingTemple';
import CommandeTemple from './pages/CommandeTemple';
import CommandeTempleSPA from './pages/CommandeTempleSPA';
import ConfirmationTemple from './pages/ConfirmationTemple';
import ConfirmationTempleSPA from './pages/ConfirmationTempleSPA';
import DashboardSanctuaire from './pages/DashboardSanctuaire';
import MentionsLegales from './pages/MentionsLegales';
import ExpertDeskPage from './expert/ExpertDesk';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-mystical-abyss text-mystical-moonlight overflow-x-hidden relative">
      {/* Background Effects - Forêt mystique sous lumière lunaire */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Effet ondulaire paisible */}
        <div className="absolute inset-0 bg-gradient-to-br from-mystical-abyss via-mystical-midnight to-mystical-black animate-wave-gentle"></div>
        
        {/* Lumière lunaire */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-mystical-moonlight/20 rounded-full blur-3xl animate-gold-pulse"></div>
        <div className="absolute top-32 right-32 w-16 h-16 bg-mystical-moonlight/30 rounded-full blur-2xl animate-gold-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Étoiles */}
        <div className="absolute top-16 left-20 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse"></div>
        <div className="absolute top-24 left-40 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 left-60 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-20 right-60 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-60 right-40 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Relief de forêt mystique */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-mystical-forest-deep/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-mystical-forest-dark/60 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Router>
          <Routes>
            <Route path="/" element={<LandingTemple />} />
            {/* Product SPA Routes (new system) */}
            <Route path="/commande" element={<CommandeTempleSPA />} />
            <Route path="/confirmation" element={<ConfirmationTempleSPA />} />
            {/* Legacy routes (fallback) */}
            <Route path="/commande-legacy" element={<CommandeTemple />} />
            <Route path="/confirmation-legacy" element={<ConfirmationTemple />} />
            <Route path="/sanctuaire" element={<DashboardSanctuaire />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/expert" element={<ExpertDeskPage />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;
```

---

## 📁 Fichier 3: `apps/main-app/src/components/Hero.tsx`

```tsx
import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 bg-gradient-to-br from-mystical-abyss via-mystical-midnight to-mystical-deep-blue overflow-hidden">
      {/* Mandala central simplifié */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-96 h-96 relative">
          {/* Cercle extérieur */}
          <div className="absolute inset-0 border border-mystical-moonlight/30 rounded-full"></div>
          {/* Cercle moyen */}
          <div className="absolute inset-8 border border-mystical-moonlight/20 rounded-full"></div>
          {/* Cercle intérieur */}
          <div className="absolute inset-16 border border-mystical-moonlight/15 rounded-full"></div>
          {/* Centre lumineux - cœur antique qui pulse */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-mystical-gold/40 rounded-full blur-xl animate-gold-pulse"></div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="text-center z-10 relative max-w-4xl mx-auto">
        <div className="mb-8">
          <Sparkles className="w-12 h-12 text-mystical-gold mx-auto mb-6 opacity-80 animate-gold-pulse" />
          <h1 className="font-playfair italic text-6xl md:text-8xl font-bold mb-8 text-mystical-starlight">
            Oracle Lumira
          </h1>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-silver max-w-3xl mx-auto leading-relaxed">
            Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées
          </p>
        </div>

        <div className="space-y-6">
          <button
            className="px-12 py-5 rounded-full bg-mystical-midnight border border-mystical-gold/50 text-mystical-starlight font-inter font-light text-lg shadow-gold-glow hover:bg-mystical-deep-blue transition-all duration-500 animate-gold-pulse"
            onClick={() => {
              const levelsSection = document.getElementById('levels');
              levelsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Commencer mon tirage
          </button>

          <p className="font-inter font-light text-sm text-mystical-silver">
            🔮 Livraison en 24h • PDF + Audio + Mandala personnalisé
          </p>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center text-mystical-gold opacity-60 animate-float">
          <span className="font-inter font-light text-sm mb-3">Découvrir</span>
          <ArrowDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
```

---

## 📁 Fichier 4: `apps/main-app/src/components/LevelsSection.tsx`

```tsx
import React, { useEffect, useState } from "react";
import { Loader, AlertCircle } from 'lucide-react';
import LevelCard from "./LevelCard";
import type { Product } from "../types/products";
import ProductOrderService from "../services/productOrder";

// Type local utilisé par la carte
interface LevelCardData {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  description: string;
  includes: string[];
  gradient: string;
  recommended: boolean;
  productId?: string;
}

const levelOrder = ["initie", "mystique", "profond", "integrale"] as const;

function mapProductsToLevels(products: Product[]): LevelCardData[] {
  const sorted = [...products].sort(
    (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
  );

  const gradients = [
    "from-mystical-midnight/80 to-mystical-deep-blue/60",
    "from-mystical-deep-blue/80 to-mystical-navy/60", 
    "from-mystical-navy/80 to-mystical-midnight/60",
    "from-mystical-forest-deep/80 to-mystical-midnight/60",
  ];

  return sorted.map((p, idx) => ({
    id: idx + 1,
    title: p.name,
    subtitle: p.level,
    price: ProductOrderService.formatPrice(p.amountCents, p.currency),
    duration: p.metadata?.duration || "",
    description: p.description,
    includes: p.features || [],
    gradient: gradients[idx % gradients.length],
    recommended: p.level === "mystique" || idx === 1,
    productId: p.id,
  }));
}

const LevelsSection: React.FC = () => {
  const [levels, setLevels] = useState<LevelCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const catalog = await ProductOrderService.getCatalog();
        if (!mounted) return;
        setLevels(mapProductsToLevels(catalog));
      } catch (e) {
        console.error("Failed to load product catalog:", e);
        if (!mounted) return;
        setError("Impossible de charger le catalogue produits");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="levels" className="py-32 relative bg-gradient-to-b from-mystical-abyss via-mystical-midnight to-mystical-deep-blue overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24 relative z-10">
          <h2 className="font-playfair italic text-5xl md:text-6xl font-bold mb-8 text-mystical-starlight">
            Choisis ton niveau d'éveil
          </h2>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-silver max-w-4xl mx-auto leading-relaxed">
            Chaque niveau révèle une couche plus profonde de ton essence spirituelle
          </p>
        </div>

        {/* Loading */}
        {!levels && !error && (
          <div className="text-center text-mystical-silver py-16">
            <Loader className="w-8 h-8 mx-auto mb-4 text-mystical-gold animate-gold-pulse" />
            <p className="font-inter font-light">Chargement du catalogue spirituel...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-400 bg-red-900/20 p-6 rounded-2xl border border-red-500/30 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
            <p className="font-inter font-light">{error}</p>
          </div>
        )}

        {/* Grid */}
        {levels && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
            {levels.map((level, index) => (
              <div key={level.productId || level.id}>
                <LevelCard level={level} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LevelsSection;
```

---

## 📁 Fichier 5: `apps/main-app/src/components/LevelCard.tsx`

```tsx
import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Level {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  description: string;
  includes: string[];
  gradient: string;
  recommended: boolean;
  productId?: string;
}

interface LevelCardProps {
  level: Level;
}

const LevelCard: React.FC<LevelCardProps> = ({ level }) => {
  const navigate = useNavigate();

  const handleChooseLevel = () => {
    const productIdMap: Record<number, string> = {
      1: 'initie',
      2: 'mystique',
      3: 'profond',
      4: 'integrale'
    };
    
    const productId = productIdMap[level.id] || level.productId;
    
    if (productId) {
      navigate(`/commande?product=${productId}`);
    } else {
      navigate(`/commande?level=${level.id}`);
    }
  };

  // Numéros romains
  const romanNumerals = ['I', 'II', 'III', 'IV'];

  return (
    <div
      className={`relative p-8 rounded-2xl bg-gradient-to-br ${level.gradient} backdrop-blur-sm border border-mystical-gold/30 shadow-forest hover:shadow-gold-glow transition-all duration-500 cursor-pointer group h-full flex flex-col overflow-hidden`}
      onClick={handleChooseLevel}
    >
      {/* Badge recommandé */}
      {level.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-mystical-gold text-mystical-abyss px-4 py-1 rounded-full text-sm font-semibold animate-gold-pulse">
          ⭐ Populaire
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-mystical-gold/20 border border-mystical-gold/50 flex items-center justify-center mx-auto mb-4 animate-gold-pulse">
            <span className="text-2xl font-playfair italic text-mystical-gold font-bold">
              {romanNumerals[level.id - 1]}
            </span>
          </div>
          
          <h3 className="font-playfair italic text-2xl font-bold text-mystical-starlight mb-2">
            {level.title}
          </h3>
          <p className="font-inter font-light text-sm text-mystical-silver mb-4">{level.subtitle}</p>
          
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-3xl font-bold text-mystical-gold">{level.price}</span>
            <span className="text-sm text-mystical-silver">• {level.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-inter font-light text-sm text-mystical-silver leading-relaxed mb-6 flex-grow">
          {level.description}
        </p>

        {/* Includes */}
        <div className="space-y-2 mb-8">
          {level.includes.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-mystical-gold flex-shrink-0" />
              <span className="font-inter font-light text-sm text-mystical-silver">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleChooseLevel}
          className="w-full py-4 rounded-xl bg-mystical-gold/20 border border-mystical-gold/50 text-mystical-starlight font-inter font-light hover:bg-mystical-gold/30 hover:border-mystical-gold/70 transition-all duration-500 shadow-gold-glow"
        >
          Entrer dans cette étape
        </button>
      </div>
    </div>
  );
};

export default LevelCard;
```

---

## 📁 Fichier 6: `apps/main-app/src/components/Footer.tsx`

```tsx
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
```

---

## 📁 Fichier 7: `apps/main-app/src/components/Testimonials.tsx`

```tsx
import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  archetype: string;
  content: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah M.",
    archetype: "L'Exploratrice",
    content: "Cette lecture a complètement transformé ma vision de moi-même. L'audio était si juste que j'ai eu des frissons.",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    rating: 5
  },
  {
    id: 2,
    name: "Marc L.",
    archetype: "Le Sage",
    content: "Incroyable précision dans l'analyse. Le mandala personnalisé trône maintenant dans mon bureau.",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    rating: 5
  },
  {
    id: 3,
    name: "Emma K.",
    archetype: "La Créatrice",
    content: "Le rituel proposé m'a aidée à débloquer une créativité que je pensais perdue. Magique !",
    avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-32 relative bg-gradient-to-b from-mystical-deep-blue via-mystical-midnight to-mystical-abyss overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 relative z-10">
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-8 text-mystical-starlight">
            Ils ont révélé leur essence
          </h2>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-silver">
            Des transformations authentiques, des âmes touchées
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="group">
              <div className="relative p-8 rounded-2xl bg-mystical-midnight/60 backdrop-blur-sm border border-mystical-gold/30 shadow-forest hover:shadow-gold-glow transition-all duration-500 overflow-hidden">
                <div className="relative z-10">
                  <Quote className="w-8 h-8 text-mystical-gold/80 mb-4 animate-gold-pulse" />

                  <p className="font-inter font-light text-mystical-silver mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-mystical-gold/30"
                    />
                    <div>
                      <div className="font-inter font-light text-mystical-starlight">
                        {testimonial.name}
                      </div>
                      <div className="font-inter font-light text-sm text-mystical-silver/80">
                        {testimonial.archetype}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-mystical-gold fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
```

---

## 📁 Fichier 8: `apps/main-app/src/components/UpsellSection.tsx`

```tsx
import React from 'react';
import { Crown, Music, Zap, Package } from 'lucide-react';

interface Upsell {
  id: string;
  title: string;
  price: string;
  description: string;
  icon: React.ComponentType<any>;
}

const upsells: Upsell[] = [
  {
    id: 'mandala',
    title: 'Mandala HD',
    price: '19 €',
    description: 'Votre mandala personnel en haute définition, prêt à imprimer',
    icon: Crown,
  },
  {
    id: 'audio',
    title: 'Audio Mystique',
    price: '14 €',
    description: 'Lecture audio complète avec musique sacrée',
    icon: Music,
  },
  {
    id: 'ritual',
    title: 'Rituel Personnalisé',
    price: '22 €',
    description: 'Cérémonie sur-mesure pour activer votre archétype',
    icon: Zap,
  },
  {
    id: 'complete',
    title: 'Pack Complet',
    price: '49 €',
    description: 'Tous les extras inclus + suivi personnalisé',
    icon: Package,
  }
];

const UpsellSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-gradient-to-b from-mystical-midnight via-mystical-deep-blue to-mystical-abyss overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h3 className="font-playfair italic text-3xl md:text-4xl font-medium text-mystical-starlight mb-6">
            Enrichissez votre expérience
          </h3>
          <p className="font-inter font-light text-lg text-mystical-silver">
            Des compléments pour approfondir votre voyage intérieur
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {upsells.map((upsell, index) => (
            <div
              key={upsell.id}
              className="p-6 rounded-2xl bg-mystical-midnight/60 backdrop-blur-sm border border-mystical-gold/30 shadow-forest hover:shadow-gold-glow transition-all duration-500 cursor-pointer group overflow-hidden"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-mystical-gold/20 border border-mystical-gold/50 flex items-center justify-center mx-auto mb-4 animate-gold-pulse">
                  <upsell.icon className="w-6 h-6 text-mystical-gold" />
                </div>
                
                <h4 className="font-inter font-light text-mystical-starlight mb-2">{upsell.title}</h4>
                <div className="text-2xl font-semibold text-mystical-gold mb-3">{upsell.price}</div>
                <p className="font-inter font-light text-sm text-mystical-silver leading-relaxed">
                  {upsell.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpsellSection;
```

---

## 📁 Fichier 9: `apps/main-app/src/components/DynamicForm.tsx`

```tsx
import React, { useState } from 'react';
import { ChevronRight, Calendar, User, Heart, Zap } from 'lucide-react';
import CircularProgress from './CircularProgress';

interface FormData {
  level: number;
  firstName: string;
  birthDate: string;
  intention: string;
  blockages: string;
  familyHistory: string;
}

const DynamicForm: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    level: 1,
    firstName: '',
    birthDate: '',
    intention: '',
    blockages: '',
    familyHistory: '',
  });

  const getStepsForLevel = (level: number) => {
    const baseSteps = [
      { id: 'name', title: 'Prénom', icon: User, required: true },
      { id: 'birth', title: 'Date de naissance', icon: Calendar, required: true },
    ];

    if (level >= 2) {
      baseSteps.push({ id: 'intention', title: 'Intention', icon: Heart, required: true });
    }
    if (level >= 3) {
      baseSteps.push({ id: 'blockages', title: 'Blocages', icon: Zap, required: true });
    }
    if (level >= 4) {
      baseSteps.push({ id: 'family', title: 'Histoire familiale', icon: Heart, required: false });
    }

    return baseSteps;
  };

  const steps = getStepsForLevel(selectedLevel);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <section className="py-32 relative bg-gradient-to-b from-mystical-abyss via-mystical-midnight to-mystical-deep-blue overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-20 relative z-10">
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-8 text-mystical-starlight">
            Commence ton voyage
          </h2>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-silver">
            Quelques informations pour personnaliser ta lecture
          </p>
        </div>

        {/* Level Selection */}
        <div className="mb-16 relative z-10">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setCurrentStep(0);
                }}
                className={`px-8 py-4 rounded-full font-inter font-light transition-all duration-500 ${
                  selectedLevel === level
                    ? 'bg-mystical-gold text-mystical-abyss shadow-gold-glow'
                    : 'bg-mystical-midnight/60 text-mystical-silver border border-mystical-gold/30 hover:bg-mystical-deep-blue/60'
                }`}
              >
                Niveau {level}
              </button>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="relative z-10">
          <div className="bg-mystical-midnight/60 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-8 md:p-12 shadow-forest relative overflow-hidden">
            {/* Progress */}
            <div className="flex items-center justify-center mb-16 relative z-10">
              <CircularProgress progress={progress} />
            </div>

            {/* Form Steps */}
            <div className="min-h-[300px] flex flex-col justify-center relative z-10">
              {renderStep(steps[currentStep], formData, setFormData)}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-16 relative z-10">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-8 py-4 rounded-full font-inter font-light transition-all duration-500 ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed text-mystical-silver/50'
                    : 'text-mystical-silver border border-mystical-gold/30 hover:bg-mystical-deep-blue/30'
                }`}
              >
                Précédent
              </button>

              <button
                onClick={currentStep === steps.length - 1 ? () => {} : handleNext}
                className="px-10 py-4 rounded-full bg-mystical-gold text-mystical-abyss font-inter font-light transition-all duration-500 hover:bg-mystical-gold/80 flex items-center gap-2 shadow-gold-glow"
              >
                <span>
                {currentStep === steps.length - 1 ? 'Recevoir ma lecture' : 'Suivant'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderStep = (step: any, formData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>) => {
  const Icon = step.icon;

  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-full bg-mystical-gold/20 border border-mystical-gold/50 flex items-center justify-center mx-auto mb-4 animate-gold-pulse">
          <Icon className="w-8 h-8 text-mystical-gold" />
        </div>
        <h3 className="font-playfair italic text-3xl font-medium text-mystical-starlight mb-4">
          {step.title}
        </h3>
      </div>

      <div className="max-w-md mx-auto">
        {step.id === 'name' && (
          <input
            type="text"
            placeholder="Votre prénom..."
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight placeholder-mystical-silver/50 font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300"
          />
        )}

        {step.id === 'birth' && (
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300"
          />
        )}

        {step.id === 'intention' && (
          <textarea
            placeholder="Quelle est votre intention pour cette lecture..."
            value={formData.intention}
            onChange={(e) => setFormData(prev => ({ ...prev, intention: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight placeholder-mystical-silver/50 font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}

        {step.id === 'blockages' && (
          <textarea
            placeholder="Décrivez les blocages que vous ressentez..."
            value={formData.blockages}
            onChange={(e) => setFormData(prev => ({ ...prev, blockages: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight placeholder-mystical-silver/50 font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}

        {step.id === 'family' && (
          <textarea
            placeholder="Partagez l'histoire énergétique de votre lignée (optionnel)..."
            value={formData.familyHistory}
            onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight placeholder-mystical-silver/50 font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}
      </div>
    </div>
  );
};

export default DynamicForm;
```

---

## 📁 Fichier 10: `apps/main-app/src/components/CircularProgress.tsx`

```tsx
import React from 'react';

interface CircularProgressProps {
  progress: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      {/* Background Circle */}
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(212, 175, 55, 0.2)"
          strokeWidth="8"
        />
        
        {/* Progress Circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(212, 175, 55, 0.8)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
          className="animate-gold-pulse"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-inter font-light text-xl text-mystical-gold animate-gold-pulse">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;
```

---

## 🚀 **Instructions pour VS Code :**

### **1. Ouvrir votre projet Oracle Lumira dans VS Code**

### **2. Pour chaque fichier :**
- Ouvrir le fichier dans VS Code
- Sélectionner tout (Ctrl+A)
- Coller le nouveau contenu
- Sauvegarder (Ctrl+S)

### **3. Créer les fichiers d'environnement :**
```bash
# Dans le terminal VS Code
cp apps/api-backend/.env.example apps/api-backend/.env
cp apps/main-app/.env.example apps/main-app/.env
```

### **4. Tester en local :**
```bash
cd apps/main-app
npm run dev
```

### **5. Commiter vers GitHub :**
```bash
git add .
git commit -m "feat: design forêt mystique avec lumière lunaire"
git push origin main
```

**Temps estimé : 10-15 minutes** ⏱️