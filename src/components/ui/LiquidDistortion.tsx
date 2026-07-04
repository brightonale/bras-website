"use client";

import React, { useState, useEffect, useId } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function LiquidDistortion({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const rawId = useId();
  const id = rawId.replace(/:/g, '-');
  const controls = useAnimation();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseEnter = () => {
    controls.start({
      scale: [0, 30, 0],
      transition: { duration: 1, ease: "easeInOut" }
    });
  };

  return (
    <div 
      className={className} 
      onMouseEnter={handleMouseEnter}
      style={{ position: 'relative', filter: `url(#liquid-distortion-${id})` }}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter id={`liquid-distortion-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <motion.feDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale={0}
            animate={controls}
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>
      {children}
    </div>
  );
}
