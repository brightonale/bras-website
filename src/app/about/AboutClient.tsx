"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Beer, Info, BookOpen, ExternalLink, Leaf, Droplets, Wind } from 'lucide-react';

export default function AboutClient() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="page-container" style={{ paddingBottom: '60px' }}>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="page-header"
        style={{ marginBottom: '60px', textAlign: 'center' }}
      >
        <span className="page-header__eyebrow" style={{ color: 'var(--accent)', fontSize: '1rem' }}>Our Philosophy</span>
        <h1 className="page-header__title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '16px' }}>
          Championing Real Ale
        </h1>
        <p className="page-header__subtitle" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem' }}>
          The Brighton Real Ale Society is dedicated to the preservation, exploration, and celebration of traditional, living beer, closely aligning with the principles of the Campaign for Real Ale (CAMRA).
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        style={{ display: 'grid', gap: '40px', maxWidth: '900px', margin: '0 auto' }}
      >
        {/* Definition Section */}
        <motion.div variants={itemVariants} className="section-card section-card--hoverable" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', background: 'rgba(230, 149, 0, 0.1)', borderRadius: '12px' }}>
              <Beer size={32} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', margin: 0 }}>What is Real Ale?</h2>
          </div>
          
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-color)' }}>
            <p style={{ marginBottom: '20px' }}>
              As officially defined by CAMRA, real ale is a natural product brewed using traditional ingredients and left to mature in the cask from which it is served in the pub through a process called secondary fermentation.
            </p>
            <blockquote style={{
              borderLeft: '4px solid var(--accent)',
              paddingLeft: '24px',
              margin: '32px 0',
              fontStyle: 'italic',
              color: 'var(--text-muted)',
              fontSize: '1.2rem'
            }}>
              "Beer brewed from traditional ingredients, matured by secondary fermentation in the container from which it is dispensed, and served without the use of extraneous carbon dioxide."
            </blockquote>
            <p>
              Unlike mass-produced, kegged lagers that are filtered, pasteurized, and artificially carbonated, real ale is a living, breathing product. It continues to develop flavor and character inside the cellar, requiring genuine skill from the pub's cellar manager to serve it in peak condition.
            </p>
          </div>
        </motion.div>

        {/* Education Grid */}
        <motion.div variants={itemVariants}>
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginBottom: '24px', textAlign: 'center' }}>
            The Three Pillars of Cask Ale
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}
            >
              <Leaf size={40} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Living Yeast</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Real ale contains live yeast in the cask. This enables secondary fermentation, giving the beer deeper, more complex flavors that evolve over time.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}
            >
              <Droplets size={40} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Unpasteurized</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                The beer is never heat-treated to kill off microorganisms. This preserves the delicate hop oils and malt profiles that are destroyed in commercial keg beers.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}
            >
              <Wind size={40} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Natural Carbonation</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Served without extraneous CO2. The soft, gentle carbonation comes entirely from the yeast's natural activity, resulting in a smoother mouthfeel.
              </p>
            </motion.div>

          </div>
        </motion.div>

        {/* Learn More / Links */}
        <motion.div variants={itemVariants} className="section-card" style={{ background: 'linear-gradient(135deg, rgba(230, 149, 0, 0.05) 0%, rgba(230, 149, 0, 0) 100%)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
            <BookOpen size={24} color="var(--accent)" /> Further Reading &amp; Resources
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
            To truly appreciate the craft behind every pint, we highly encourage exploring CAMRA's official resources. They have been fighting to save traditional British beer since 1971.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <a 
              href="https://camra.org.uk/about/about-us/what-is-real-ale/" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn--outline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderRadius: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
                <Info size={20} /> CAMRA: What is Real Ale?
              </div>
              <ExternalLink size={18} color="var(--text-muted)" />
            </a>

            <a 
              href="https://camra.org.uk/beer-and-cider/beer/tasting-beer/" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn--outline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderRadius: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
                <Beer size={20} /> How to Taste &amp; Score Beer
              </div>
              <ExternalLink size={18} color="var(--text-muted)" />
            </a>

            <a 
              href="https://camra.org.uk/join/" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn--primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 24px', borderRadius: '12px', marginTop: '8px' }}
            >
              Join CAMRA Today <ExternalLink size={18} />
            </a>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
