"use client";

import React, { useState, useEffect } from 'react';
import checklistData from '@/data/checklist.json';

export default function ChecklistPage() {
  const [visitedPubs, setVisitedPubs] = useState<any[]>([]);
  const [totalResearchPubs, setTotalResearchPubs] = useState(0);

  useEffect(() => {
    // Filter checklist items
    const visited = checklistData.filter(p => p.status.startsWith('Visited'));
    // Count original research pubs (visited + not visited, excluding 'Visited (Not on original list)' if it was not on list, or we just count all)
    const totalResearch = checklistData.length;

    setVisitedPubs(visited);
    setTotalResearchPubs(totalResearch);
  }, []);

  const progressPercent = totalResearchPubs > 0
    ? Math.round((visitedPubs.length / totalResearchPubs) * 100)
    : 0;

  return (
    <div className="page-container animate-fade-in">

      {/* Page Header */}
      <div className="page-header">
        <span className="page-header__eyebrow">Pub Tracker</span>
        <h1 className="page-header__title">🗺️ BRAS Pub Checklist</h1>
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
        <h3 className="section-card__title">
          ✅ Visited Venues ({visitedPubs.length})
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
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>✅</span>
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
