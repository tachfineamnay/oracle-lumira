import React, { useEffect, useRef } from 'react';
import { useMotionValue, animate, useReducedMotion } from 'framer-motion';

type Star = { x: number; y: number; r: number; baseA: number };

const NUM = 50;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

const draw = (ctx: CanvasRenderingContext2D, stars: Star[], progress: number, dpr: number) => {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const threshold = (i / NUM) * 100;
    const step = 100 / NUM;
    const t = clamp((progress - threshold) / step, 0, 1);
    
    // ux: cosmic glow effect - softer stars with gradient
    const a = s.baseA * t;
    const glowRadius = s.r * dpr * 3;
    const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowRadius);
    gradient.addColorStop(0, `rgba(255, 215, 0, ${(a * 0.8).toFixed(3)})`); // amber core
    gradient.addColorStop(0.3, `rgba(255, 255, 255, ${(a * 0.4).toFixed(3)})`); // white middle
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`); // fade to transparent
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // ux: bright star center
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 215, 0, ${a.toFixed(3)})`;
    ctx.arc(s.x, s.y, s.r * dpr, 0, Math.PI * 2);
    ctx.fill();
  }
};

const StarField: React.FC<{ progress?: number; count?: number; className?: string }> = ({ progress = 0, count = NUM, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[] | null>(null);
  const mv = useMotionValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${Math.round(rect.width)}px`;
      canvas.style.height = `${Math.round(rect.height)}px`;
      // regenerate stars positions relative to size
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.6 + 0.6;
        const baseA = Math.random() * 0.7 + 0.3;
        stars.push({ x, y, r, baseA });
      }
      starsRef.current = stars;
      draw(ctx, starsRef.current, mv.get(), dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    let controls: { stop?: () => void } | null = null;
    if (reduced) {
      mv.set(progress);
      draw(ctx, starsRef.current || [], mv.get(), dpr);
    } else {
      const animation = animate(mv, progress, {
        duration: 1.2,
        onUpdate: (v) => {
          draw(ctx, starsRef.current || [], v, dpr);
        },
      });
      controls = animation as any;
    }

    return () => {
      if (controls && 'stop' in controls && typeof controls.stop === 'function') controls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, reduced]);

  return <canvas ref={canvasRef} className={className ?? 'w-full h-full block'} aria-hidden />;
};

export default StarField;
