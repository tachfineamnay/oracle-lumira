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

