import React from 'react';
import Image from 'next/image';

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  era: string;
  yearRange: string;
  isCurrent: boolean;
  image?: string;
}

const committeeMembers: CommitteeMember[] = [
  {
    id: "takara",
    name: "Takara Webster",
    role: "Society President",
    era: "Current Committee",
    yearRange: "2026–Present",
    isCurrent: true,
    image: "/images/committee/takara.png"
  },
  {
    id: "harrison",
    name: "Harrison Emrys-Jones",
    role: "Finance Director",
    era: "Current Committee",
    yearRange: "2026–Present",
    isCurrent: true,
    image: "/images/committee/harrison.png"
  },
  {
    id: "rico",
    name: "Rico Chadwick Gugolz",
    role: "VP Social",
    era: "Current Committee",
    yearRange: "2026–Present",
    isCurrent: true,
    image: "/images/committee/rico.png"
  },
  {
    id: "albie-gullis",
    name: "Albie Gullis",
    role: "Society President",
    era: "Committee 2025–2026",
    yearRange: "2025–2026",
    isCurrent: false,
    image: "/images/committee/albie-gullis.png"
  },
  {
    id: "harry",
    name: "Harry Rogers",
    role: "Vice President & IT Officer",
    era: "Committee 2025–2026",
    yearRange: "2025–2026",
    isCurrent: false,
    image: "/images/committee/harry.png"
  },
  {
    id: "max",
    name: "Max Emery",
    role: "Socials & Media Officer",
    era: "Committee 2024–2026",
    yearRange: "2024–2026",
    isCurrent: false,
    image: "/images/committee/max.png"
  },
  {
    id: "sidney",
    name: "Sidney",
    role: "Finance Officer",
    era: "Committee 2024–2025",
    yearRange: "2024–2025",
    isCurrent: false,
    image: "/images/committee/sidney.png"
  },
  {
    id: "james-graham",
    name: "James Graham",
    role: "Founding President",
    era: "Founding Committee",
    yearRange: "2023–2025",
    isCurrent: false,
    image: "/images/committee/james-graham.png"
  },
  {
    id: "luke",
    name: "Luke",
    role: "Socials Design",
    era: "Founding Committee",
    yearRange: "2023–2024",
    isCurrent: false
  }
];

export default function CommitteeGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '16px'
    }}>
      {committeeMembers.map((member) => (
        <div
          key={member.id}
          className="section-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 'var(--card-radius, 8px)',
            border: member.isCurrent ? '2px solid var(--accent, #e69500)' : '1px solid var(--border)',
            position: 'relative',
            background: 'var(--card-bg, #1a120c)',
            boxShadow: member.isCurrent ? '0 4px 20px rgba(230, 149, 0, 0.15)' : 'none',
          }}
        >
          {member.image ? (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
              <img
                src={member.image}
                alt={`${member.name} - ${member.role}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              {member.isCurrent && (
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'var(--accent, #e69500)',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                }}>
                  Current
                </span>
              )}
            </div>
          ) : (
            <div style={{
              aspectRatio: '1 / 1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              textAlign: 'center',
              background: 'radial-gradient(circle at center, #2e1d12 0%, #120b08 100%)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--border, #332218)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--accent, #e69500)',
                marginBottom: '12px'
              }}>
                {member.name.charAt(0)}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                {member.name}
              </h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent, #e69500)' }}>
                {member.role}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {member.yearRange}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', opacity: 0.7 }}>
                {member.era}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
