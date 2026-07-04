"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export default function ScrollProgressPint() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion) {
    return (
      <motion.div
        className="progress-bar"
        style={{ scaleY, originY: 0 }}
      />
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '40px',
        height: '100px',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '4px 4px 10px 10px',
        borderTop: 'none',
        overflow: 'hidden',
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 0 10px rgba(255,255,255,0.2)'
      }}
    >
      {/* Glass reflections */}
      <div style={{
        position: 'absolute',
        top: 0, left: '4px', bottom: 0, width: '4px',
        backgroundColor: 'rgba(255,255,255,0.3)',
        zIndex: 10
      }} />
      <div style={{
        position: 'absolute',
        top: 0, right: '4px', bottom: 0, width: '2px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        zIndex: 10
      }} />

      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundColor: 'var(--accent)',
          transformOrigin: 'bottom',
          scaleY: scaleY,
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)'
        }}
      >
        {/* Foam & Wave */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '12px',
          backgroundColor: '#fff',
          transform: 'translateY(-50%)',
          borderRadius: '50%',
          filter: 'blur(1px)',
        }}>
          <motion.div 
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{
              position: 'absolute',
              top: '-5px',
              left: 0,
              width: '200%',
              height: '10px',
              backgroundImage: 'radial-gradient(circle at 10px 10px, white 10px, transparent 11px)',
              backgroundSize: '20px 20px'
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
