import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

/**
 * TestimonialsRefonte - Témoignages avec contraste amélioré
 * 
 * CHANGEMENTS vs version originale :
 * ✅ Contraste drastiquement amélioré (text-white/90 au lieu de text-cosmic-ethereal)
 * ✅ Noms en text-white pour meilleure lisibilité
 * ✅ Glassmorphism au survol
 * ✅ Grid 3 colonnes desktop, stack mobile
 */
const TestimonialsRefonte: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah M.',
      title: 'Exploratrice du Soi',
      rating: 5,
      text: "J'ai senti mes centres énergétiques s'ouvrir à l'écoute de l'audio. Une clarté que je n'avais jamais connue.",
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      name: 'Marc L.',
      title: 'Sage Stellaire',
      rating: 5,
      text: "Le mandala agit comme une clé visuelle méditative. Je l'utilise chaque matin.",
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      name: 'Emma K.',
      title: 'Créatrice Galactique',
      rating: 5,
      text: "Je me suis révélée à une créativité ancienne. Comme si j'avais accès à une mémoire oubliée.",
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cosmic-violet rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cosmic-violet via-cosmic-aurora to-cosmic-gold bg-clip-text text-transparent">
              Témoignages vibratoires
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Ils ont activé leur code originel et exploré leur archétype cosmique
          </p>
        </motion.div>

        {/* Grid de témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cosmic-gold/30 transition-all duration-300 group"
            >
              {/* Étoiles */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-cosmic-gold text-cosmic-gold" />
                ))}
              </div>

              {/* Texte du témoignage - REFONTE : Contraste amélioré */}
              <p className="text-white/90 text-base leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Auteur */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cosmic-gold/30"
                />
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-white/70 text-sm">{testimonial.title}</p>
                </div>
              </div>

              {/* Overlay glassmorphique au survol */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
            </motion.div>
          ))}
        </div>

        {/* Note en bas */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-white/60 text-sm">
            ⭐ Note moyenne : 4.9/5 basée sur 247 avis vérifiés ⭐
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsRefonte;
