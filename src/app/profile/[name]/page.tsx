import React from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const session = await getSession();
  
  if (!session.isLoggedIn) {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>You must be logged in to view member profiles.</p>
        <Link href="/login">
          <button className="btn btn--primary" style={{ marginTop: '16px' }}>Go to Login</button>
        </Link>
      </div>
    );
  }

  const resolvedParams = await params;
  const memberName = decodeURIComponent(resolvedParams.name);
  
  // Find member in database
  let user = null;
  try {
    user = await prisma.user.findFirst({
      where: { 
        OR: [
          { name: memberName.toLowerCase().replace(/\s+/g, '') },
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

  if (!user) {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '40px' }}>
        <div className="section-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Member Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Could not find a member named &ldquo;{memberName}&rdquo; in the BRAS database.
          </p>
          <Link href="/matrix">
            <button className="btn btn--primary">Back to Matrix</button>
          </Link>
        </div>
      </div>
    );
  }

  const ratings = user.ratings;
  const pubsVisited = ratings.length;
  const totalRatings = ratings.length;
  let avgScoreGiven = 0;
  let highestGiven = 0;
  let lowestGiven = 10;
  
  if (ratings.length > 0) {
    let sum = 0;
    ratings.forEach(r => {
      sum += r.score;
      if (r.score > highestGiven) highestGiven = r.score;
      if (r.score < lowestGiven) lowestGiven = r.score;
    });
    avgScoreGiven = sum / ratings.length;
  } else {
    lowestGiven = 0;
  }

  // Calculate rank (this is a simplified rank based on total ratings)
  let allUsersCount = 0;
  try {
    allUsersCount = await prisma.user.count({
      where: {
        ratings: {
          some: {}
        }
      }
    });
  } catch (err) {
    console.error("Failed to count users", err);
  }
  
  const rank = "?"; // We'll just leave rank as ? or calculate it if needed, but it's simpler to just omit or put a placeholder.

  const displayName = user.votingName || user.name;
  const initials = displayName.substring(0, 2).toUpperCase();

  const visitedPubs = ratings.map(r => ({
    pub: r.pubName,
    score: r.score
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="page-container animate-fade-in">

      {/* Back Button */}
      <div>
        <Link href="/matrix" className="btn btn--outline btn--sm">
          ← Back to Member Matrix
        </Link>
      </div>

      {/* Profile Card Header */}
      <div className="section-card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        flexWrap: 'wrap'
      }}>
        {/* Avatar */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 10px rgba(153, 27, 27, 0.2)',
          fontFamily: 'var(--font-heading)',
          flexShrink: 0,
        }}>
          {initials}
        </div>

        {/* Name & Badges */}
        <div style={{ flex: 1 }}>
          <span className="page-header__eyebrow">Official Member</span>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', margin: '4px 0 10px 0' }}>
            {displayName}
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge--muted">
              Active Inspector
            </span>
            <span className="badge badge--accent">
              Avg Rating Given: {avgScoreGiven.toFixed(2)}★
            </span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid-auto">
        <div className="stat-box">
          <div className="stat-value">{pubsVisited}</div>
          <div className="stat-label">Pubs Visited</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalRatings}</div>
          <div className="stat-label">Total Logs</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--success-text)' }}>{highestGiven.toFixed(1)}★</div>
          <div className="stat-label">Highest Score Given</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--error-text)' }}>{lowestGiven.toFixed(1)}★</div>
          <div className="stat-label">Lowest Score Given</div>
        </div>
      </div>

      {/* Visited Pubs List */}
      <div className="section-card">
        <h3 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={20} /> Rating History ({visitedPubs.length} entries)
        </h3>

        {visitedPubs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic' }}>
            No visit logs recorded for this member.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visitedPubs.map((entry) => (
              <div
                key={entry.pub}
                className="section-card section-card--hoverable"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  background: 'var(--surface-warm)',
                }}
              >
                <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: 'var(--text-color)' }}>
                  {entry.pub}
                </span>
                <span className="badge badge--primary" style={{ fontSize: '0.9rem', padding: '5px 14px' }}>
                  {entry.score.toFixed(1)}★
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
