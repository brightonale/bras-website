"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, X } from 'lucide-react';

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  bio: string;
}

const committeeMembers: CommitteeMember[] = [
  {
    id: "james-graham",
    name: "James Graham",
    role: "Founding President (2023–2025)",
    bio: "James was the driving force behind the initial 20 months of the BRAS. He established the standard operating protocol of weekly pub reviews, systematically assigning ratings to local cask ales. Under his leadership, the club transitioned from a small circle of friends into an accredited society featured in local media and regional CAMRA press. He formally signed off as executive head in June 2025."
  },
  {
    id: "max",
    name: "Max",
    role: "Socials & Media Officer (2024–2026)",
    bio: "Max served as the creative lead, transforming the society's visual outreach. He was responsible for designing promotional materials, managing weekly social announcements, and coordinating venue outreach across Brighton. His artistic and logistical efforts kept the local community informed and actively growing."
  },
  {
    id: "harry",
    name: "Harry",
    role: "Vice President & IT Officer (2025–2026)",
    bio: "Harry was a core figure in establishing the society's digital presence and scaling operations. He handled the society's tech infrastructure alongside taking charge of the BRAS wordle and custom web solutions."
  },
  {
    id: "sidney",
    name: "Sidney",
    role: "Finance Officer (2024–2025)",
    bio: "Sidney handled the society's finances for the 2024/25 academic year, overlooking all payments made by the society. An architecture student with an affinity for pale ales and skating, Sidney ensured the books stayed balanced as BRAS expanded its socials and events."
  },
  {
    id: "albie-gullis",
    name: "Albie Gullis",
    role: "Society President (2025–2026)",
    bio: "Albie assumed executive management of the BRAS in June 2025 following the transition of the founding committee. Tasked with scaling the society's presence, Albie has driven a massive expansion into multi-society collaborative events and targeted regional pub crawls."
  },
  {
    id: "takara",
    name: "Takara",
    role: "Society President (2026–Present)",
    bio: "Takara stepped up as President in 2026, leading the next generation of real ale enthusiasts and continuing the BRAS legacy of celebrating quality cask conditioned beer across Brighton and Sussex."
  },
  {
    id: "harrison",
    name: "Harrison",
    role: "Finance Director (2026–Present)",
    bio: "Harrison took over the financial architecture in 2026, regulating ticket sales, balancing the books, and ensuring the society's commercial operations run smoothly."
  },
  {
    id: "luke",
    name: "Luke",
    role: "Socials Design (2023–2024)",
    bio: "Luke was an integral part of the foundational 2023/24 executive committee. He handled initial graphic layouts and coordinated weekly meetups. Luke secured a permanent place in society legend in June 2024 when he was officially presented with a custom, personalised pint glass to mark his dedicated service."
  }
];

export default function CommitteeGrid() {
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null);

  // Close modal on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMember(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {committeeMembers.map((member) => (
          <motion.div
            key={member.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMember(member)}
            className="section-card section-card--hoverable"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              borderRadius: 'var(--card-radius)'
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--surface-muted)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--border)',
              marginBottom: '16px'
            }}>
              <ImageIcon size={24} color="var(--text-light)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>
              {member.name}
            </h3>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {member.role}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedMember && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)'
              }}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="section-card"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                padding: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
              }}
            >
              <button 
                onClick={() => setSelectedMember(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px'
                }}
                className="btn btn--icon"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: 'var(--surface-muted)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--border)',
                  flexShrink: 0
                }}>
                  <ImageIcon size={32} color="var(--text-light)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '8px' }}>
                    {selectedMember.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {selectedMember.role}
                  </div>
                </div>
              </div>
              
              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '24px 0' }} />
              
              <p style={{ fontSize: '1.05rem', color: 'var(--text-color)', lineHeight: '1.7' }}>
                {selectedMember.bio}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
