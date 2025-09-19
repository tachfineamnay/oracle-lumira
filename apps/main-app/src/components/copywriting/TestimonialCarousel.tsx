import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
  date: string;
}

export interface TestimonialCarouselProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
  autoPlayDelay?: number;
  showControls?: boolean;
  className?: string;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  title,
  subtitle,
  testimonials,
  autoPlayDelay = 5000,
  showControls = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, autoPlayDelay);

      return () => clearInterval(interval);
    }
  }, [isPaused, testimonials.length, autoPlayDelay]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!testimonials.length) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-light text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Testimonial */}
          <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="p-8 sm:p-12"
              >
                {/* Quote Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex justify-center mb-8"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/20 to-mystical-600/20 flex items-center justify-center border border-amber-400/30">
                    <Quote className="w-8 h-8 text-amber-400" />
                  </div>
                </motion.div>

                {/* Testimonial Content */}
                <div className="max-w-4xl mx-auto text-center">
                  {/* Stars */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex justify-center gap-1 mb-6"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < currentTestimonial.rating
                            ? 'text-amber-400 fill-current'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </motion.div>

                  {/* Testimonial Text */}
                  <motion.blockquote
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-xl sm:text-2xl lg:text-3xl font-light text-white leading-relaxed mb-8 italic"
                  >
                    "{currentTestimonial.text}"
                  </motion.blockquote>

                  {/* Author Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="space-y-2"
                  >
                    <div className="text-lg font-medium text-amber-400">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-white/60">
                      {currentTestimonial.location} • {currentTestimonial.service}
                    </div>
                    <div className="text-sm text-white/40">
                      {currentTestimonial.date}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            {showControls && testimonials.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                  aria-label="Témoignage précédent"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                  aria-label="Témoignage suivant"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex justify-center gap-3 mt-8"
            >
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Aller au témoignage ${index + 1}`}
                />
              ))}
            </motion.div>
          )}

          {/* Progress Bar */}
          {!isPaused && testimonials.length > 1 && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
              <motion.div
                key={currentIndex}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: autoPlayDelay / 1000, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Testimonial Grid Preview */}
        {testimonials.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 cursor-pointer"
                onClick={() => goToSlide(index)}
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-amber-400 fill-current'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/80 text-sm mb-4 line-clamp-3">
                  "{testimonial.text}"
                </p>
                <div className="text-amber-400 font-medium text-sm">
                  {testimonial.name}
                </div>
                <div className="text-white/50 text-xs">
                  {testimonial.location}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TestimonialCarousel;