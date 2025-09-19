import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

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
    archetype: "Exploratrice du Soi",
    content: "J'ai senti mes centres énergétiques s'ouvrir à l'écoute de l'audio. Une clarté que je n'avais jamais connue.",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    rating: 5
  },
  {
    id: 2,
    name: "Marc L.",
    archetype: "Sage Stellaire",
    content: "Le mandala agit comme une clé visuelle méditative. Je l'utilise chaque matin.",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    rating: 5
  },
  {
    id: 3,
    name: "Emma K.",
    archetype: "Créatrice Galactique",
    content: "Je me suis révélée à une créativité ancienne. Comme si j'avais accès à une mémoire oubliée.",
    avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Nébuleuse de fond subtile */}
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-violet/8 via-transparent to-cosmic-aurora/8"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="font-playfair italic text-5xl md:text-6xl font-bold mb-8 text-cosmic-divine"
            style={{
              textShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
            }}
          >
            Témoignages Vibratoires
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.id} 
              className="group"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-cosmic-deep/80 via-cosmic-nebula/60 to-cosmic-galaxy/40 backdrop-blur-xl border border-cosmic-gold/30 shadow-cosmic hover:shadow-aurora transition-all duration-500 overflow-hidden">
                {/* Effet de particules subtiles au survol */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-cosmic-star rounded-full"
                      style={{
                        left: `${25 + i * 15}%`,
                        top: `${25 + (i % 2) * 30}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Quote className="w-10 h-10 text-cosmic-gold/90 mb-6" />
                  </motion.div>

                  <p className="font-inter font-light text-cosmic-ethereal mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <motion.img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full border-2 border-cosmic-gold/40"
                      whileHover={{ scale: 1.1 }}
                    />
                    <div>
                      <div className="font-inter font-medium text-cosmic-divine">
                        {testimonial.name}
                      </div>
                      <div className="font-inter font-light text-sm text-cosmic-celestial">
                        {testimonial.archetype}
                      </div>
                    </div>
                  </div>

                  <motion.div 
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        <Star className="w-4 h-4 text-cosmic-gold fill-current" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;