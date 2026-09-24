import React from 'react';
import { ImageIcon } from 'lucide-react';

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  era: string;
}

const committeeMembers: CommitteeMember[] = [
  {
    id: "takara",
    name: "Takara",
    role: "Society President (2026–Present)",
    era: "Current Executive (2026–Present)",
  },
  {
    id: "harrison",
    name: "Harrison",
    role: "Finance Director (2026–Present)",
    era: "Current Executive (2026–Present)",
  },
  {
    id: "albie-gullis",
    name: "Albie Gullis",
    role: "Society President (2025–2026)",
    era: "Executive Committee (2025–2026)",
  },
  {
    id: "harry",
    name: "Harry",
    role: "Vice President & IT Officer (2025–2026)",
    era: "Executive Committee (2025–2026)",
  },
  {
    id: "max",
    name: "Max",
    role: "Socials & Media Officer (2024–2026)",
    era: "Executive Committee (2024–2026)",
  },
  {
    id: "sidney",
    name: "Sidney",
    role: "Finance Officer (2024–2025)",
    era: "Committee (2024–2025)",
  },
  {
    id: "james-graham",
    name: "James Graham",
    role: "Founding President (2023–2025)",
    era: "Founding Executive (2023–2025)",
  },
  {
    id: "luke",
    name: "Luke",
    role: "Socials Design (2023–2024)",
    era: "Founding Committee (2023–2024)",
  }
];

export default function CommitteeGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px'
    }}>
      {committeeMembers.map((member) => (
        <div
          key={member.id}
          className="section-card"
          style={{
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
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
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            {member.role}
          </div>
          <span 
            className={`badge ${member.id === 'takara' || member.id === 'harrison' ? 'badge--accent' : 'badge--muted'}`} 
            style={{ fontSize: '0.68rem', padding: '2px 8px' }}
          >
            {member.era}
          </span>
        </div>
      ))}
    </div>
  );
}
