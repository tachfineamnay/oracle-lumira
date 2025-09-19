// Oracle Lumira Copywriting Components
// Comprehensive React+TS atomic components for marketing pages

export { default as HeroLumira } from './HeroLumira';
export type { HeroLumiraProps } from './HeroLumira';

export { default as LevelCard } from './LevelCard';
export type { LevelCardProps } from './LevelCard';

export { default as LevelSection } from './LevelSection';
export type { LevelSectionProps } from './LevelSection';

export { default as VibratoryForm } from './VibratoryForm';
export type { VibratoryFormProps, VibratoryData } from './VibratoryForm';

export { default as TestimonialCarousel } from './TestimonialCarousel';
export type { TestimonialCarouselProps, Testimonial } from './TestimonialCarousel';

export { default as DimensionalUpsells } from './DimensionalUpsells';
export type { 
  DimensionalUpsellsProps, 
  DimensionalUpsell, 
  UpsellFeature 
} from './DimensionalUpsells';

export { default as CosmicFooter } from './CosmicFooter';
export type { 
  CosmicFooterProps, 
  FooterLink, 
  FooterSection, 
  ContactInfo 
} from './CosmicFooter';

// Re-export copy labels for convenience
export { copyLabels } from '../../lib/copyLabels';