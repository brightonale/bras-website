import React from 'react';
import Link from 'next/link';
import { ClipboardList, Award, Beer, Star } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';
import { getHistoricalMemberByName } from '@/lib/matrixData';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const session = await getSession();
  
  if (!session.isLoggedIn) {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '40px' }}>
        <div className="section-card" style={{ textAlign: 'center', maxWidth: '480px', padding: '36px 24px' }}>
          <Beer size={40} className="accent-text" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Member Sign In Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Member profiles and personal rating archives are reserved for BRAS society members. Sign in with your member credentials to view full inspector records.
          </p>
          <Link href="/login">
            <button className="btn btn--primary">Sign In to View</button>
          </Link>
        </div>
      </div>
    );
  }

  const resolvedParams = await params;
  const memberName = decodeURIComponent(resolvedParams.name);
  
  // 1. Find member in database
  let user = null;
  try {
    user = await prisma.user.findFirst({
      where: { 
        OR: [
          { name: memberName.toLowerCase().replace(/\s+/g, '') },
          { name: memberName },
          { votingName: memberName }
        ]
      },
      include: {
        ratings: true
      }
    });
  } catch (err) {
    console.error("Failed to fetch user", err);
  }

  // 2. Fetch historical member data
  const historicalRecord = getHistoricalMemberByName(memberName);

  if (!user && !historicalRecord) {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '40px' }}>
        <div className="section-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Member Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Could not find a member named &ldquo;{memberName}&rdquo; in the BRAS database.
          </p>
          <Link href="/matrix">
            <button className="btn btn--primary">Back to Member Matrix</button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Merge visited pubs from historical records and live DB ratings
  const pubMap = new Map<string, number>();

  if (historicalRecord && historicalRecord.visitedPubs) {
    for (const v of historicalRecord.visitedPubs) {
      if (typeof v.score === 'number' && !isNaN(v.score)) {
        pubMap.set(v.pub, v.score);
      }
    }
  }

  if (user && user.ratings) {
    for (const r of user.ratings) {
      if (typeof r.score === 'number' && !isNaN(r.score)) {
        pubMap.set(r.pubName, r.score);
      }
    }
  }

  const visitedPubs = Array.from(pubMap.entries()).map(([pub, score]) => ({
    pub,
    score
  })).sort((a, b) => b.score - a.score);

  const pubsVisited = visitedPubs.length;
  const totalRatings = visitedPubs.length;
  
  let avgScoreGiven = 0;
  let highestGiven = 0;
  let lowestGiven = 10;
  
  if (visitedPubs.length > 0) {
    let sum = 0;
    visitedPubs.forEach(r => {
      sum += r.score;
      if (r.score > highestGiven) highestGiven = r.score;
      if (r.score < lowestGiven) lowestGiven = r.score;
    });
    avgScoreGiven = sum / visitedPubs.length;
  } else {
    lowestGiven = 0;
  }

  const displayName = user?.votingName || historicalRecord?.name || user?.name || memberName;
  const initials = displayName.substring(0, 2).toUpperCase();

  // Tier determination
  let inspectorTier = "Society Inspector";
  if (pubsVisited >= 15) inspectorTier = "Legendary Inspector";
  else if (pubsVisited >= 10) inspectorTier = "Veteran Inspector";
  else if (pubsVisited >= 5) inspectorTier = "Established Member";

  return (
    <div className="page-container animate-fade-in" style={{ gap: '28px' }}>

      {/* Back Button */}
      <div>
        <Link href="/matrix" className="btn btn--outline btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          ← Back to Member Matrix
        </Link>
      </div>

      {/* Profile Card Header */}
      <div className="section-card profile-header-card">
        {/* Avatar */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #B91C1C 0%, #5A1010 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(185, 28, 28, 0.3)',
          fontFamily: 'var(--font-heading)',
          flexShrink: 0,
          border: '2px solid rgba(230, 149, 0, 0.4)',
        }}>
          {initials}
        </div>

        {/* Name & Badges */}
        <div style={{ flex: '1 1 auto' }}>
          <span className="page-header__eyebrow">Official BRAS Member</span>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', 
            fontFamily: 'var(--font-heading)', 
            margin: '4px 0 10px 0',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}>
            {displayName}
          </h2>
          <div className="profile-badges-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge--accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Award size={13} /> {inspectorTier}
            </span>
            <span className="badge badge--primary">
              Avg Score: {avgScoreGiven.toFixed(2)}★
            </span>
            {historicalRecord?.rank && (
              <span className="badge badge--muted">
                Activity Rank #{historicalRecord.rank}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="profile-stats-grid">
        <div className="stat-box">
          <div className="stat-value">{pubsVisited}</div>
          <div className="stat-label">Pubs Visited</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalRatings}</div>
          <div className="stat-label">Total Logs</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--success-text)' }}>
            {highestGiven > 0 ? `${highestGiven.toFixed(1)}★` : '—'}
          </div>
          <div className="stat-label">Highest Score Given</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: lowestGiven < 10 ? 'var(--error-text)' : 'inherit' }}>
            {lowestGiven < 10 ? `${lowestGiven.toFixed(1)}★` : '—'}
          </div>
          <div className="stat-label">Lowest Score Given</div>
        </div>
      </div>

      {/* Visited Pubs List */}
      <div className="section-card">
        <h3 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ClipboardList size={20} className="accent-text" /> Rating History ({visitedPubs.length} entries)
        </h3>

        {visitedPubs.length === 0 ? (
          <div className="empty-state" style={{ border: 'none', background: 'transparent', padding: '24px 12px', margin: '0' }}>
            <ClipboardList className="empty-state__icon" size={40} style={{ marginBottom: '12px' }} />
            <h4 className="empty-state__title" style={{ fontSize: '1.15rem' }}>No Ratings Yet</h4>
            <p className="empty-state__description" style={{ fontSize: '0.85rem', marginBottom: '0', maxWidth: '300px' }}>
              This member hasn&apos;t logged any pub visits or rated any pints yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visitedPubs.map((entry) => {
              const score = entry.score;
              let badgeClass = 'badge--muted';
              if (score >= 8.0) badgeClass = 'badge--success';
              else if (score >= 6.0) badgeClass = 'badge--accent';
              else if (score < 4.0) badgeClass = 'badge--warning';

              return (
                <div
                  key={entry.pub}
                  className="section-card section-card--hoverable"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    background: 'var(--surface-warm)',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', fontSize: '1.02rem', color: 'var(--text-color)' }}>
                    {entry.pub}
                  </span>
                  <span className={`badge ${badgeClass}`} style={{ fontSize: '0.9rem', padding: '5px 12px', fontWeight: 700 }}>
                    {score.toFixed(1)}★
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
