import React, { useMemo } from 'react';

const StarrySky: React.FC = () => {
  // Subtle twinkling points
  const twinkles = useMemo(
    () => Array.from({ length: 26 }).map((_, i) => ({
      key: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() < 0.5 ? 1 : 2,
      delay: `${Math.random() * 3}s`,
    })),
    []
  );

  // A few shooting stars
  const meteors = useMemo(
    () => Array.from({ length: 4 }).map((_, i) => ({
      key: i,
      top: `${10 + Math.random() * 70}%`,
      left: `${-10 + Math.random() * 25}%`,
      rotate: `${-25 + Math.random() * 20}deg`,
      delay: `${Math.random() * 6}s`,
      duration: `${1.8 + Math.random() * 0.9}s`,
    })),
    []
  );

  // Generate a simple conifer row as an SVG group
  const ForestRow: React.FC<{ fill: string; opacity: number; scale: number; y: number; speedClass: string }>
    = ({ fill, opacity, scale, y, speedClass }) => {
    const trees = Array.from({ length: 70 }).map((_, i) => {
      const base = i * 30 + (i % 2 === 0 ? 6 : 0);
      const height = 28 + ((i * 7) % 14);
      const width = 16;
      const x1 = base;
      const y1 = 160 - y; // baseline
      // Simple triangle for silhouette
      const points = `${x1},${y1} ${x1 + width / 2},${y1 - height} ${x1 + width},${y1}`;
      return <polygon key={i} points={points} />;
    });
    return (
      <div className={`absolute inset-x-0 bottom-0 overflow-hidden ${speedClass}`} style={{ transformOrigin: 'bottom left' }}>
        <svg width="200%" height="180" viewBox="0 0 800 180" style={{ transform: `scale(${scale}) translateY(${y}px)` }}>
          <g fill={fill} opacity={opacity}>{trees}</g>
          {/* Ground strip to seal edges */}
          <rect x="0" y="160" width="800" height="40" fill={fill} opacity={opacity} />
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Layer 1: smooth night gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-mystical-abyss via-mystical-midnight to-mystical-deep-blue" />

      {/* Layer 2: thin starfield texture */}
      <div className="absolute inset-0 starfield" />

      {/* Layer 3: twinkles */}
      <div className="absolute inset-0">
        {twinkles.map(t => (
          <span
            key={t.key}
            className="absolute rounded-full bg-white/80 animate-startwinkle"
            style={{ left: t.left, top: t.top, width: t.size, height: t.size, animationDelay: t.delay }}
          />
        ))}
      </div>

      {/* Layer 4: shooting stars */}
      <div className="absolute inset-0 overflow-hidden">
        {meteors.map(m => (
          <span
            key={m.key}
            className="absolute shooting-star-line animate-shooting-star"
            style={{ top: m.top, left: m.left, transform: `rotate(${m.rotate})`, animationDelay: m.delay, animationDuration: m.duration }}
          />
        ))}
      </div>

      {/* Layer 5: subtle forest panorama (no image), parallax pan */}
      <ForestRow fill="#0A0F0A" opacity={0.55} scale={1} y={0} speedClass="forest-pan-slow" />
      <ForestRow fill="#1A2F1A" opacity={0.85} scale={1.05} y={-6} speedClass="forest-pan-fast" />

      {/* Soft vignette at the very bottom to blend with content */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
};

export default StarrySky;

