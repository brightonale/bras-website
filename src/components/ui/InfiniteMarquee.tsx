"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function InfiniteMarquee({ text }: { text: string }) {
  return (
    <div className="marquee-container" style={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      display: 'flex',
      backgroundColor: 'var(--accent)',
      color: '#000',
      padding: '16px 0',
      transform: 'rotate(-2deg) scale(1.05)',
      marginTop: '40px',
      marginBottom: '40px',
      boxShadow: '0 10px 30px rgba(230, 149, 0, 0.3)',
      borderTop: '2px solid #FFF',
      borderBottom: '2px solid #FFF',
    }}>
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 20
        }}
        style={{
          display: 'flex',
          gap: '50px',
          paddingRight: '50px',
          fontWeight: 900,
          fontSize: '2.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}
      >
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </motion.div>
    </div>
  );
}
