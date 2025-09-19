# Oracle Lumira Copywriting Components

A comprehensive React+TypeScript atomic component system for Oracle Lumira marketing pages, built with mystical glassmorphism aesthetics and cosmic premium styling.

## 🌟 Features

- **Atomic Design**: Modular, reusable components following atomic design principles
- **TypeScript Support**: Full type safety with comprehensive interfaces
- **i18n Ready**: French/English locale support with centralized copy management
- **Mystical Aesthetics**: Glassmorphism styling with cosmic backgrounds and amber accents
- **Smooth Animations**: Framer Motion animations with accessibility considerations
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Semantic HTML structure and proper accessibility

## 📦 Components

### 1. HeroLumira
Premium hero section with cosmic background and sacred symbolism.

**Features:**
- Staggered entrance animations
- Cosmic dot pattern background
- Sacred star symbol
- Perks highlighting
- Call-to-action button

**Props:**
```typescript
interface HeroLumiraProps {
  title: string;
  subTitle: string;
  ctaLabel: string;
  perks: string[];
  onCTAClick: () => void;
  className?: string;
}
```

### 2. LevelCard & LevelSection
Tiered pricing cards with cosmic styling and responsive grid layout.

**Features:**
- 4 tier-based color variants (amber, emerald, purple, gold)
- Popular badges and hover animations
- Feature lists with checkmarks
- Responsive grid with trust indicators

**LevelCard Props:**
```typescript
interface LevelCardProps {
  level: 1 | 2 | 3 | 4;
  title: string;
  price: string;
  duration: string;
  features: string[];
  ctaLabel: string;
  color?: 'amber' | 'emerald' | 'purple' | 'gold';
  popular?: boolean;
  onSelect: () => void;
  className?: string;
}
```

### 3. VibratoryForm
Interactive energy synchronization form with vibrational visualization.

**Features:**
- Name input with validation
- Energy level slider (1-10)
- Vibrational color visualization
- Optional intention textarea
- Animated submission state

**Props:**
```typescript
interface VibratoryFormProps {
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  syncLabel: string;
  submitLabel: string;
  description: string;
  onSubmit: (data: VibratoryData) => void;
  className?: string;
}
```

### 4. TestimonialCarousel
Auto-playing testimonial carousel with elegant transitions.

**Features:**
- Auto-play with pause on hover
- Manual navigation controls
- Star ratings display
- Progress bar indicator
- Preview grid for additional testimonials

**Props:**
```typescript
interface TestimonialCarouselProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
  autoPlayDelay?: number;
  showControls?: boolean;
  className?: string;
}
```

### 5. DimensionalUpsells
Dynamic upsell components with type-based styling.

**Features:**
- 4 upsell types: premium, extended, protection, priority
- Type-specific color schemes and icons
- Popular badges and urgency indicators
- Feature lists and pricing display

**Props:**
```typescript
interface DimensionalUpsellsProps {
  title: string;
  subtitle: string;
  upsells: DimensionalUpsell[];
  onSelectUpsell: (upsellId: string) => void;
  className?: string;
}
```

### 6. CosmicFooter
Comprehensive footer with contact info, legal links, and trust indicators.

**Features:**
- Multi-column layout with responsive design
- Contact information display
- Social media links
- Legal compliance links
- Certifications and trust seals

**Props:**
```typescript
interface CosmicFooterProps {
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
```

## 🎨 Design System

### Color Palette
- **Primary**: Mystical shades (mystical-50 → mystical-900)
- **Accent**: Amber tones (amber-400, amber-500)
- **Secondary**: Emerald, purple, gold variants
- **Glass Effects**: `backdrop-blur-xl`, `bg-white/5`, `border-white/10`

### Typography
- **Headings**: Cinzel font (mystical, elegant)
- **Body**: Inter font (clean, readable)
- **Hierarchy**: Proper font sizing and spacing

### Animations
- **Framer Motion**: Smooth, 60fps animations
- **Accessibility**: Respects `prefers-reduced-motion`
- **Performance**: Optimized animation patterns

## 🌍 Internationalization

### Copy Labels System
Centralized copy management in `copyLabels.ts`:

```typescript
import { copyLabels } from './lib/copyLabels';

const locale = 'fr'; // or 'en'
const copy = copyLabels[locale];
```

### Supported Locales
- **French (fr)**: Primary language with comprehensive copy
- **English (en)**: Full translation support

## 🚀 Usage

### Installation
```bash
# Components are part of the main-app
cd apps/main-app
npm install
```

### Basic Usage
```tsx
import {
  HeroLumira,
  LevelSection,
  VibratoryForm,
  TestimonialCarousel,
  DimensionalUpsells,
  CosmicFooter,
  copyLabels
} from './components/copywriting';

const MyPage: React.FC = () => {
  const copy = copyLabels['fr'];
  
  return (
    <div>
      <HeroLumira
        title={copy.hero.title}
        subTitle={copy.hero.subTitle}
        ctaLabel={copy.hero.ctaLabel}
        perks={copy.hero.perks}
        onCTAClick={() => console.log('CTA clicked')}
      />
      {/* Other components... */}
    </div>
  );
};
```

### Example Implementation
See `OracleLumiraExample.tsx` for a complete marketing page implementation demonstrating all components with proper data structure and event handlers.

## 🛠️ Development

### Component Structure
```
src/components/copywriting/
├── index.ts              # Barrel exports
├── HeroLumira.tsx        # Hero section
├── LevelCard.tsx         # Individual level card
├── LevelSection.tsx      # Level cards grid
├── VibratoryForm.tsx     # Energy sync form
├── TestimonialCarousel.tsx # Testimonials
├── DimensionalUpsells.tsx  # Upsell components
├── CosmicFooter.tsx      # Footer
├── OracleLumiraExample.tsx # Usage example
└── README.md             # This file
```

### Dependencies
- React 18+
- TypeScript 5+
- Tailwind CSS
- Framer Motion
- Lucide React (icons)

### Styling Guidelines
- Use Tailwind utility classes
- Follow mystical color palette
- Implement glassmorphism effects
- Maintain responsive design patterns

## 🎯 Best Practices

### Performance
- Lazy loading with React.Suspense
- Optimized animations (transform/opacity)
- Minimal re-renders with proper memoization

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

### Type Safety
- Comprehensive TypeScript interfaces
- Proper prop validation
- Type-safe copy system

## 📝 Contributing

1. Follow the established component patterns
2. Maintain TypeScript strict mode compliance
3. Add comprehensive prop documentation
4. Test responsive behavior across devices
5. Ensure accessibility compliance

## 🔮 Future Enhancements

- [ ] Animation variants system
- [ ] Theme customization API
- [ ] Additional language support
- [ ] Advanced analytics integration
- [ ] A/B testing framework
- [ ] Performance monitoring

---

*Built with ✨ cosmic energy and 💜 spiritual intention for Oracle Lumira*