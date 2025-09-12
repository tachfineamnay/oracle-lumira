import React from 'react';
import { motion } from 'framer-motion';
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
    <section className="py-24 relative bg-gradient-to-b from-lumira-mist to-lumira-pearl">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-6 bg-gradient-to-r from-lumira-copper via-lumira-gold-soft to-lumira-bronze bg-clip-text text-transparent">
            Ils ont révélé leur essence
          </h2>
          <p className="font-inter font-light text-xl text-lumira-night/70">
            Des transformations authentiques, des âmes touchées
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-lumira-gold-soft/30 shadow-soft transition-all duration-500 hover:shadow-aurora hover:scale-105">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lumira-aurora/20 to-lumira-water/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                <div className="relative z-10">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-lumira-copper mb-4 opacity-70" />

                  {/* Content */}
                  <p className="font-inter font-light text-lumira-night/80 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-lumira-gold-soft/40 shadow-soft"
                    />
                    <div>
                      <div className="font-inter font-medium text-lumira-night">
                        {testimonial.name}
                      </div>
                      <div className="font-inter text-sm text-lumira-constellation">
                        {testimonial.archetype}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mt-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-lumira-copper fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Persona Cards Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <h3 className="font-playfair italic text-3xl font-medium mb-8 text-mystical-gold">
            Votre Carte Persona sera générée
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['L\'Exploratrice', 'Le Sage', 'La Créatrice'].map((archetype, index) => (
              <motion.div
                key={archetype}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="aspect-[3/4] rounded-xl bg-gradient-to-br from-mystical-gold/20 to-mystical-purple/20 border border-mystical-gold/40 p-6 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-mystical-gold/30 mb-4 flex items-center justify-center">
                  <Star className="w-8 h-8 text-mystical-gold" fill="currentColor" />
                </div>
                <h4 className="font-playfair italic text-xl text-white mb-2">{archetype}</h4>
                <p className="font-inter text-sm text-gray-400">Carte personnalisée</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;