"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobbleSpeed: number;
  wobbleDistance: number;
  wobbleOffset: number;
  alpha: number;
}

export default function BubbleEmitter({ 
  children, 
  active = false, 
  count = 10,
  style = {}
}: { 
  children: React.ReactNode; 
  active?: boolean;
  count?: number;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const initParticles = (width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: height + Math.random() * 20,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1.5 + 0.5,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
        wobbleDistance: Math.random() * 5 + 2,
        wobbleOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.3
      });
    }
    particlesRef.current = particles;
  };

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      if (particlesRef.current.length === 0) {
        initParticles(width, height);
      }
    };
    
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const isActive = isHovered || active;

      if (isActive && Math.random() < 0.2 && particlesRef.current.length < count * 2) {
         particlesRef.current.push({
          x: Math.random() * width,
          y: height + 10,
          size: Math.random() * 4 + 1,
          speed: Math.random() * 2 + 1,
          wobbleSpeed: Math.random() * 0.1 + 0.02,
          wobbleDistance: Math.random() * 10 + 2,
          wobbleOffset: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.5 + 0.3
        });
      }

      particlesRef.current.forEach((p, i) => {
        p.y -= p.speed;
        p.wobbleOffset += p.wobbleSpeed;
        const xOffset = Math.sin(p.wobbleOffset) * p.wobbleDistance;

        ctx.beginPath();
        ctx.arc(p.x + xOffset, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 1.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        if (p.y < -10) {
          if (isActive) {
            p.y = height + 10;
            p.x = Math.random() * width;
          } else {
            particlesRef.current[i] = particlesRef.current[particlesRef.current.length - 1];
            particlesRef.current.pop();
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isHovered, active, count, prefersReducedMotion]);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
