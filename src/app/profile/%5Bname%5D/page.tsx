"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import membersData from '@/data/members.json';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [member, setMember] = useState<any | null>(null);

  // Decode the member name from URL params
  const memberName = params.name ? decodeURIComponent(params.name as string) : "";

  useEffect(() => {
    // Session validation
    const user = localStorage.getItem('bras_user_name');
    if (!user) {
      router.push('/login');
      return;
    }
    setIsLoggedIn(true);

    // Find member in static database
    const foundMember = membersData.find(m => m.name.toLowerCase() === memberName.toLowerCase());
    if (foundMember) {
      setMember(foundMember);
    }
  }, [memberName]);

  if (!isLoggedIn) {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to login...</p>
      </div>
    );
  }

  if (!member) {
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

  // Generate initials for avatar
  const initials = member.name.substring(0, 2).toUpperCase();

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
          <span className="page-header__eyebrow">Official Pint Inspector</span>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', margin: '4px 0 10px 0' }}>
            {member.name}
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge--muted">
              Rank #{member.rank} in visits
            </span>
            <span className="badge badge--accent">
              Avg Rating Given: {member.avgScoreGiven.toFixed(2)}★
            </span>
          </div>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid-auto">
        <div className="stat-box">
          <div className="stat-value">{member.pubsVisited}</div>
          <div className="stat-label">Pubs Visited</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{member.totalRatings}</div>
          <div className="stat-label">Total Logs</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--success-text)' }}>{member.highestGiven.toFixed(1)}★</div>
          <div className="stat-label">Highest Score Given</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--error-text)' }}>{member.lowestGiven.toFixed(1)}★</div>
          <div className="stat-label">Lowest Score Given</div>
        </div>
      </div>

      {/* Visited Pubs List */}
      <div className="section-card">
        <h3 className="section-card__title">
          📋 Inspector Log History ({member.visitedPubs.length} entries)
        </h3>

        {member.visitedPubs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic' }}>
            No visit logs recorded for this member.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...member.visitedPubs]
              .sort((a: any, b: any) => b.score - a.score)
              .map((entry: any) => (
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
