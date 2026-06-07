import { prisma } from '@/lib/db';
import React from 'react';
import { Map, CheckSquare, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ChecklistPage() {
  let allPubs: { name: string, status: string, comment: string | null }[] = [];
  try {
    allPubs = await prisma.pub.findMany();
  } catch (err) {
    console.error("Failed to load pubs", err);
  }
  
  const visitedPubs = allPubs.filter(p => p.status.startsWith('Visited'));
  const totalResearchPubs = allPubs.length;

  const progressPercent = totalResearchPubs > 0
    ? Math.round((visitedPubs.length / totalResearchPubs) * 100)
    : 0;

  return (
    <div className="page-container animate-fade-in">

      {/* Page Header */}
      <div className="page-header">
        <span className="page-header__eyebrow">Pub Tracker</span>
        <h1 className="page-header__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Map size={28} className="accent-text" /> BRAS Pub Checklist
        </h1>
        <p className="page-header__subtitle">
          Tracking every venue we&apos;ve officially visited during our legendary Socials.
        </p>
      </div>

      {/* Progress Card */}
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="section-card__title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            Brighton Social Progress
          </h3>
          <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>
            {visitedPubs.length} / {totalResearchPubs} Pubs Conquered ({progressPercent}%)
          </span>
        </div>

        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>
          Based on the BRAS original research list of potential venues.
        </p>
      </div>

      {/* Visited Pubs List */}
      <div className="section-card">
        <h3 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={20} className="primary-text" /> Visited Venues ({visitedPubs.length})
        </h3>

        <div className="grid-auto">
          {visitedPubs.map((pub) => (
            <div
              key={pub.name}
              className="section-card section-card--hoverable"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                background: 'var(--surface-warm)',
              }}
            >
              <CheckCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-color)' }}>
                  {pub.name}
                </h4>
                {pub.status.includes('Not on original') && (
                  <span className="badge badge--warning" style={{ marginTop: '4px' }}>
                    Bonus Pub
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
