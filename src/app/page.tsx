import React from 'react';
import Link from 'next/link';
import pubsData from '@/data/pubs.json';
import membersData from '@/data/members.json';
import timelineData from '@/data/timeline.json';
import { Beer, Trophy, Gamepad2, Medal } from 'lucide-react';

export default function HomePage() {
  // Stats calculation
  const totalPubs = new Set(pubsData.map(p => p.pub.toLowerCase())).size;
  const totalMembers = membersData.length;
  const totalPintsInspected = membersData.reduce((acc, m) => acc + m.totalRatings, 0);

  // Find the latest pub from timeline to show as "Active Pub of the Week"
  const latestTimelineEvent = timelineData.length > 0 ? timelineData[timelineData.length - 1] : null;

  return (
    <div className="page-container animate-fade-in" style={{ gap: '24px' }}>
      
      {/* Clean Hero Section */}
      <div className="section-card" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '40px', 
        padding: '60px', 
        backgroundColor: 'var(--surface-warm)', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px' }}>
          <img 
            src="/assets/bras-logo-roundel.png" 
            alt="BRAS Logo Roundel" 
            style={{ width: '180px', height: '180px', objectFit: 'contain', marginBottom: '32px' }}
          />
          <span style={{ 
            color: 'var(--accent)', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em', 
            fontSize: '0.85rem',
            display: 'block',
            marginBottom: '12px'
          }}>
            Brighton Real Ale Society
          </span>
          <h1 style={{ 
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', 
            lineHeight: 1.1, 
            letterSpacing: '-0.02em', 
            marginBottom: '24px',
            fontFamily: 'var(--font-heading)'
          }}>
            Preserving Cask Heritage, One Pint at a Time.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '40px', maxWidth: '650px' }}>
            We act as amateur Pint Inspectors to rate pub atmospheres, cask beer selection, and quality across Brighton & Hove. 
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/rate">
              <button className="btn btn--primary btn--lg">
                <Beer size={20} /> Score a Pint
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="btn btn--outline btn--lg">
                View Rankings
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* active crawl callout */}
      {latestTimelineEvent && (
        <div className="notice notice--warning" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          padding: '24px 32px'
        }}>
          <div>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              Latest crawl event
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--warning-text)' }}>
              {latestTimelineEvent.pub}
            </h3>
            <p style={{ fontSize: '0.95rem', margin: '4px 0 0 0' }}>
              Visited on {latestTimelineEvent.date} • Average Pint Score: <strong>{latestTimelineEvent.avgScore.toFixed(2)}★</strong>
            </p>
          </div>
          <Link href="/rate">
            <button className="btn btn--accent">
              Submit Your Rating
            </button>
          </Link>
        </div>
      )}

      {/* Quick Links Row */}
      <div className="grid-auto">
        <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary)' }}><Trophy size={40} strokeWidth={1.5} /></div>
          <h3 className="section-card__title" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '8px' }}>The Leaderboard</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
            See which Brighton venues serve the finest cask condition.
          </p>
          <Link href="/leaderboard"><button className="btn btn--outline btn--sm">View List</button></Link>
        </div>

        <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary)' }}><Gamepad2 size={40} strokeWidth={1.5} /></div>
          <h3 className="section-card__title" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '8px' }}>Pub Wordle</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
            Test your real ale vocabulary in our daily 5-letter anagram.
          </p>
          <Link href="/wordle"><button className="btn btn--outline btn--sm">Play Now</button></Link>
        </div>

        <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary)' }}><Medal size={40} strokeWidth={1.5} /></div>
          <h3 className="section-card__title" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '8px' }}>Annual Awards</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
            Cast your nominations for the society's end-of-year superlatives.
          </p>
          <Link href="/awards"><button className="btn btn--outline btn--sm">Vote</button></Link>
        </div>
      </div>

      {/* Society Quick Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        flexWrap: 'wrap', 
        gap: '20px', 
        padding: '40px 20px',
        borderTop: '1px solid var(--border)',
        marginTop: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalPubs}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pubs Conquered</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalPintsInspected}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Cask Pints Scored</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalMembers}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Inspectors</div>
        </div>
      </div>

    </div>
  );
}
