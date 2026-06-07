import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function MatrixPage() {
  const session = await getSession();
  const isLoggedIn = session.isLoggedIn;

  if (!isLoggedIn) {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="section-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}><Lock size={48} /></div>
          <h2 className="section-card__title" style={{ marginTop: '12px', marginBottom: '8px', borderBottom: 'none' }}>
            Member Matrix Locked
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
            To comply with GDPR and society privacy guidelines, the detailed member ratings grid is restricted to active BRAS members. Please log in to view the matrix.
          </p>
          <Link href="/login">
            <button className="btn btn--primary">Sign In to View</button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch all ratings
  let ratings: any[] = [];
  try {
    ratings = await prisma.rating.findMany({
      include: { user: true }
    });
  } catch (err) {
    console.error("Failed to fetch ratings", err);
  }

  // Extract unique pubs that have been rated
  const ratedPubsSet = new Set<string>();
  ratings.forEach(r => ratedPubsSet.add(r.pubName));
  const pubs = Array.from(ratedPubsSet).sort();

  // Extract members and their ratings
  const memberMap = new Map<string, Record<string, number | null>>();
  ratings.forEach(r => {
    if (!memberMap.has(r.user.votingName || r.user.name)) {
      const initialRatings: Record<string, number | null> = {};
      pubs.forEach(p => initialRatings[p] = null);
      memberMap.set(r.user.votingName || r.user.name, initialRatings);
    }
    memberMap.get(r.user.votingName || r.user.name)![r.pubName] = r.score;
  });

  const rows = Array.from(memberMap.entries()).map(([member, ratings]) => ({
    member,
    ratings
  })).sort((a, b) => a.member.localeCompare(b.member));

  const getCellBg = (val: number | null) => {
    if (val === null) return '#ffffff';
    if (val >= 8.0) return 'var(--success-bg)';
    if (val >= 6.0) return 'var(--warning-bg)';
    if (val >= 4.0) return '#FFF7ED'; // orange tint
    return 'var(--error-bg)';
  };

  return (
    <div className="page-container animate-fade-in">
      
      {/* Page Header */}
      <div className="page-header">
        <span className="page-header__eyebrow">Analysis</span>
        <h1 className="page-header__title">Member × Pub Rating Matrix</h1>
        <p className="page-header__subtitle">
          Detailed grid showing every rating given by each BRAS member across all visited pubs.
        </p>
      </div>

      {/* Grid Guide */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '-16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '3px' }}></span>
          <span>Excellent (8.0+)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: '3px' }}></span>
          <span>Good (6.0 - 7.9)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '3px' }}></span>
          <span>Average (4.0 - 5.9)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: '3px' }}></span>
          <span>Poor (&lt; 4.0)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>—</span>
          <span>Not Visited</span>
        </div>
      </div>

      {/* Scrollable Matrix Table */}
      <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '20px' }}>
          <table style={{ borderCollapse: 'collapse', width: 'max-content', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                <th style={{ 
                  position: 'sticky', 
                  left: 0, 
                  backgroundColor: 'var(--surface-muted)', 
                  padding: '12px 16px',
                  textAlign: 'left',
                  zIndex: 10,
                  borderRight: '2px solid var(--border-strong)',
                  boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
                }}>
                  Member
                </th>
                {pubs.map(pub => (
                  <th key={pub} style={{ 
                    padding: '12px', 
                    writingMode: 'vertical-lr',
                    transform: 'rotate(180deg)',
                    whiteSpace: 'nowrap',
                    textAlign: 'left',
                    height: '140px',
                    backgroundColor: 'var(--surface-muted)',
                    borderRight: '1px solid var(--border)'
                  }}>
                    {pub}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={row.member} style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: rIdx % 2 === 0 ? 'var(--surface)' : 'var(--surface-warm)'
                }}>
                  <td style={{ 
                    position: 'sticky', 
                    left: 0, 
                    backgroundColor: rIdx % 2 === 0 ? 'var(--surface)' : 'var(--surface-warm)', 
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    zIndex: 5,
                    borderRight: '2px solid var(--border-strong)',
                    boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
                  }}>
                    <Link href={`/profile/${encodeURIComponent(row.member)}`} style={{ textDecoration: 'underline', color: 'var(--primary)' }}>
                      {row.member}
                    </Link>
                  </td>
                  {pubs.map(pub => {
                    const score = row.ratings[pub];
                    return (
                      <td 
                        key={pub} 
                        style={{ 
                          padding: '10px', 
                          textAlign: 'center', 
                          fontWeight: score !== null ? 'bold' : 'normal',
                          backgroundColor: getCellBg(score),
                          borderRight: '1px solid var(--border)',
                          color: score !== null ? 'var(--text-color)' : 'var(--text-light)'
                        }}
                      >
                        {score !== null ? score.toFixed(1) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
