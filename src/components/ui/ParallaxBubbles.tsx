"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function ParallaxBubbles() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  
  const y1 = useTransform(smoothProgress, [0, 1], [0, -300]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, -500]);
  const y3 = useTransform(smoothProgress, [0, 1], [0, -700]);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none',
      zIndex: -1,
      overflow: 'hidden'
    }}>
      <motion.div style={{ position: 'absolute', top: '20%', left: '10%', y: y1, opacity: 0.3, filter: 'blur(3px)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--accent)', boxShadow: '0 0 20px var(--accent)' }} />
      </motion.div>
      <motion.div style={{ position: 'absolute', top: '50%', right: '15%', y: y2, opacity: 0.2, filter: 'blur(5px)' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'var(--accent)', boxShadow: '0 0 30px var(--accent)' }} />
      </motion.div>
      <motion.div style={{ position: 'absolute', top: '80%', left: '20%', y: y3, opacity: 0.1, filter: 'blur(8px)' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'var(--accent)', boxShadow: '0 0 50px var(--accent)' }} />
      </motion.div>
      <motion.div style={{ position: 'absolute', top: '120%', right: '30%', y: y1, opacity: 0.4, filter: 'blur(2px)' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: 'var(--accent)', boxShadow: '0 0 15px var(--accent)' }} />
      </motion.div>
    </div>
  );
}
