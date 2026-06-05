"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import pubsData from '@/data/pubs.json';
import membersData from '@/data/members.json';
import timelineData from '@/data/timeline.json';
import { Beer, Trophy, Gamepad2, Medal } from 'lucide-react';

export default function HomePage() {
  const [isCommittee, setIsCommittee] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('bras_user_role');
    setIsCommittee(role === 'committee');
  }, []);
  // Stats calculation
  const totalPubs = new Set(pubsData.map(p => p.pub.toLowerCase())).size;
  const totalMembers = membersData.length;
  const totalPintsInspected = membersData.reduce((acc, m) => acc + m.totalRatings, 0);

  // Find the latest pub from timeline to show as "Active Pub of the Week"
  const latestTimelineEvent = timelineData.length > 0 ? timelineData[timelineData.length - 1] : null;

  return (
    <div className="page-container animate-fade-in" style={{ gap: '24px' }}>
      
      {/* Hero */}
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 20px 40px',
      }}>
        <img 
          src="/assets/bras-logo.png" 
          alt="BRAS Logo" 
          style={{ width: '160px', height: '160px', objectFit: 'contain', marginBottom: '24px' }}
        />
        <div style={{ 
          color: 'var(--accent)', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.12em', 
          fontSize: '0.8rem',
          marginBottom: '12px'
        }}>
          Brighton Real Ale Society
        </div>
        <h1 style={{ 
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', 
          lineHeight: 1.15, 
          letterSpacing: '-0.01em', 
          marginBottom: '16px',
          fontFamily: 'var(--font-heading)',
          maxWidth: '600px',
          margin: '0 auto 16px',
        }}>
          Championing Real Ale &amp; Cask Heritage
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          color: 'var(--text-muted)', 
          lineHeight: 1.6, 
          marginBottom: '28px', 
          maxWidth: '520px',
          margin: '0 auto 28px',
        }}>
          University of Brighton's student society for the Campaign for Real Ale. We rate independent pubs across Brighton &amp; Hove as amateur Pint Inspectors.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/rate">
            <button className="btn btn--primary btn--lg">
              <Beer size={18} /> Score a Pint
            </button>
          </Link>
          <Link href="/leaderboard">
            <button className="btn btn--outline btn--lg">
              View Rankings
            </button>
          </Link>
        </div>
      </div>

      {/* Active crawl callout */}
      {latestTimelineEvent && (
        <div className="notice notice--warning" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px'
        }}>
          <div>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              Last Social Score
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--warning-text)' }}>
              {latestTimelineEvent.pub}
            </h3>
            <p style={{ fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Visited on {latestTimelineEvent.date} · Social Score: <strong>{latestTimelineEvent.avgScore.toFixed(2)}★</strong>
            </p>
          </div>
          <Link href="/rate">
            <button className="btn btn--accent btn--sm">
              Submit Rating
            </button>
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid-auto">
        <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}><Trophy size={32} strokeWidth={1.5} /></div>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>Pint Leaderboard</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Which Brighton pubs serve the finest cask.
          </p>
          <Link href="/leaderboard"><button className="btn btn--outline btn--sm">View List</button></Link>
        </div>

        {isCommittee && (
          <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}><Gamepad2 size={32} strokeWidth={1.5} /></div>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>Pub Wordle</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Test your real ale vocabulary daily.
            </p>
            <Link href="/wordle"><button className="btn btn--outline btn--sm">Play Now</button></Link>
          </div>
        )}

        {isCommittee && (
          <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}><Medal size={32} strokeWidth={1.5} /></div>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>Annual Awards</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Nominate for end-of-year superlatives.
            </p>
            <Link href="/awards"><button className="btn btn--outline btn--sm">Vote</button></Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        flexWrap: 'wrap', 
        gap: '16px', 
        padding: '32px 20px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{totalPubs}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pubs Conquered</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{totalPintsInspected}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Cask Pints Scored</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{totalMembers}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Inspectors</div>
        </div>
      </div>

    </div>
  );
}
