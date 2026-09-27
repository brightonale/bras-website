import React from 'react';

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  era: string;
  yearRange: string;
  isCurrent: boolean;
}

const committeeMembers: CommitteeMember[] = [
  {
    id: "takara",
    name: "Takara",
    role: "Society President",
    era: "Current Committee",
    yearRange: "2026–Present",
    isCurrent: true,
  },
  {
    id: "harrison",
    name: "Harrison",
    role: "Finance Director",
    era: "Current Committee",
    yearRange: "2026–Present",
    isCurrent: true,
  },
  {
    id: "albie-gullis",
    name: "Albie Gullis",
    role: "Society President",
    era: "Committee 2025–2026",
    yearRange: "2025–2026",
    isCurrent: false,
  },
  {
    id: "harry",
    name: "Harry",
    role: "Vice President & IT Officer",
    era: "Committee 2025–2026",
    yearRange: "2025–2026",
    isCurrent: false,
  },
  {
    id: "max",
    name: "Max",
    role: "Socials & Media Officer",
    era: "Committee 2024–2026",
    yearRange: "2024–2026",
    isCurrent: false,
  },
  {
    id: "sidney",
    name: "Sidney",
    role: "Finance Officer",
    era: "Committee 2024–2025",
    yearRange: "2024–2025",
    isCurrent: false,
  },
  {
    id: "james-graham",
    name: "James Graham",
    role: "Founding President",
    era: "Founding Committee",
    yearRange: "2023–2025",
    isCurrent: false,
  },
  {
    id: "luke",
    name: "Luke",
    role: "Socials Design",
    era: "Founding Committee",
    yearRange: "2023–2024",
    isCurrent: false,
  }
];

export default function CommitteeGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '12px'
    }}>
      {committeeMembers.map((member) => (
        <div
          key={member.id}
          className="section-card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderRadius: 'var(--card-radius)',
            borderLeft: member.isCurrent ? '3px solid var(--accent)' : '3px solid var(--border)',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', margin: 0 }}>
            {member.name}
          </h3>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.02em' }}>
            {member.role}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {member.yearRange}
          </div>
        </div>
      ))}
    </div>
  );
}
