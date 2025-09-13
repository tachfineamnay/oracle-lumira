import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SpiritualWaves from './SpiritualWaves';

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
    <section className="py-32 relative bg-gradient-to-b from-mystical-flow via-mystical-harmony to-mystical-serenity overflow-hidden">
      {/* Ondulations spirituelles */}
      <SpiritualWaves intensity="subtle" />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20 relative z-10"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-8 bg-gradient-to-r from-mystical-copper via-mystical-gold to-mystical-radiance bg-clip-text text-transparent drop-shadow-sm">
            Ils ont révélé leur essence
          </h2>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-night/80 tracking-wide">
            Des transformations authentiques, des âmes touchées
          </p>
          
          {/* Ligne décorative */}
          <motion.div
            className="w-24 h-0.5 bg-gradient-to-r from-transparent via-mystical-gold/60 to-transparent mx-auto mt-6"
            animate={{
              scaleX: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative p-8 rounded-3xl bg-white/75 backdrop-blur-md border border-mystical-gold/40 shadow-spiritual transition-all duration-700 hover:shadow-energy hover:scale-105 overflow-hidden">
                {/* Glow Effect */}
                <motion.div 
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-mystical-aurora/15 to-mystical-harmony/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Ondulation de témoignage */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-mystical-gold/3 to-mystical-water/3 rounded-3xl"
                  animate={{
                    opacity: [0, 0.5, 0],
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 2,
                  }}
                />

                <div className="relative z-10">
                  {/* Quote Icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Quote className="w-8 h-8 text-mystical-copper/80 mb-4" />
                  </motion.div>

                  {/* Content */}
                  <p className="font-inter font-light text-mystical-night/85 mb-6 leading-relaxed tracking-wide">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <motion.img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-mystical-gold/50 shadow-harmony"
                      whileHover={{
                        scale: 1.1,
                        boxShadow: '0 8px 25px rgba(232, 213, 183, 0.3)',
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <div>
                      <div className="font-inter font-medium text-mystical-night/90">
                        {testimonial.name}
                      </div>
                      <div className="font-inter text-sm text-mystical-constellation/80">
                        {testimonial.archetype}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mt-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.2,
                        }}
                      >
                        <Star className="w-4 h-4 text-mystical-copper/90 fill-current" />
                      </motion.div>
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
          className="mt-28 text-center relative z-10"
        >
          <h3 className="font-playfair italic text-3xl font-medium mb-10 text-mystical-copper/90 tracking-wide">
            Votre Carte Persona sera générée
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['L\'Exploratrice', 'Le Sage', 'La Créatrice'].map((archetype, index) => (
              <motion.div
                key={archetype}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="aspect-[3/4] rounded-xl bg-gradient-to-br from-mystical-gold/15 to-mystical-sage/15 border border-mystical-gold/50 p-6 flex flex-col items-center justify-center text-center shadow-harmony hover:shadow-energy transition-all duration-500 group overflow-hidden"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Ondulation de carte persona */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-mystical-gold/5 to-mystical-water/5 rounded-xl"
                  animate={{
                    opacity: [0, 0.4, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 1.5,
                  }}
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-mystical-gold/25 mb-4 flex items-center justify-center shadow-serenity"
                    animate={{
                      boxShadow: [
                        '0 2px 16px rgba(184, 230, 230, 0.1)',
                        '0 4px 20px rgba(184, 230, 230, 0.15)',
                        '0 2px 16px rgba(184, 230, 230, 0.1)',
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Star className="w-8 h-8 text-mystical-copper/90" fill="currentColor" />
                  </motion.div>
                  <h4 className="font-playfair italic text-xl text-mystical-night/90 mb-2 tracking-wide">{archetype}</h4>
                  <p className="font-inter text-sm text-mystical-night/70 tracking-wide">Carte personnalisée</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;