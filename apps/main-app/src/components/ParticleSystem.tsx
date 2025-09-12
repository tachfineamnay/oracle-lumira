import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const ParticleSystem: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          delay: Math.random() * 5,
          duration: Math.random() * 10 + 15,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    window.addEventListener('resize', generateParticles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', generateParticles);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-lumira-constellation opacity-30"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            y: [particle.y, particle.y - 100, particle.y],
            x: [
              particle.x,
              particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 50,
              particle.x,
            ],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Mouse Follower Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`mouse-${i}`} 
          className="absolute w-1.5 h-1.5 rounded-full bg-lumira-gold-soft"
          animate={{
            x: mousePosition.x - 4 + Math.sin(Date.now() * 0.005 + i) * 20,
            y: mousePosition.y - 4 + Math.cos(Date.now() * 0.005 + i) * 20,
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            delay: i * 0.1,
          }}
          style={{ opacity: 0.2 - i * 0.03 }}
        />
      ))}
    </div>
  );
};

export default ParticleSystem;