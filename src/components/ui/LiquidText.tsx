"use client";

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

export default function LiquidText({ 
  text, 
  className = "",
  delay = 0
}: { 
  text: string;
  className?: string;
  delay?: number;
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      }
    }
  };

  const childVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      rotate: -10,
      scale: 0.9,
      filter: 'blur(5px)'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotate: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        type: 'spring', 
        damping: 12, 
        stiffness: 100 
      }
    }
  };

  return (
    <motion.span
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: 'inline-block' }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={childVariants}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
