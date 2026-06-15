import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Beer, Trophy, Gamepad2, Medal, Star } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch stats from database
  let totalPubs = 0, totalMembers = 0, totalRatings = 0;
  let settings = null;
  let latestSocial = null;
  let latestTimelineEvent = null;
  let hallOfFamePint: { pub: string; beer: string | null; brewery: string | null; score: number; date: string; ratingCount: number } | null = null;

  try {
    totalPubs = await prisma.pub.count();
    totalMembers = await prisma.user.count();
    totalRatings = await prisma.rating.count();

    settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    
    // Find the latest active social, or the most recent one
    latestSocial = await prisma.social.findFirst({
      where: { active: true }
    });
    if (!latestSocial) {
      const allSocials = await prisma.social.findMany();
      if (allSocials.length > 0) {
        allSocials.sort((a, b) => {
          const timeA = new Date(a.date).getTime() || 0;
          const timeB = new Date(b.date).getTime() || 0;
          return timeB - timeA;
        });
        latestSocial = allSocials[0];
      }
    }

    if (latestSocial) {
      // Calculate average score for the latest social
      const ratings = await prisma.rating.findMany({
        where: { pubName: latestSocial.pubName }
      });
      const avgScore = ratings.length > 0 
        ? ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length 
        : 0;

      latestTimelineEvent = {
        pub: latestSocial.pubName,
        beerName: latestSocial.beerName,
        date: latestSocial.date,
        avgScore
      };
    }

    // ── Hall of Fame: find the highest-rated social of all time ──
    // Group ratings by socialId to find the social with the best average score
    const socialRatings = await prisma.rating.groupBy({
      by: ['socialId'],
      _avg: { score: true },
      _count: { score: true },
      where: { socialId: { not: null } },
      having: { score: { _count: { gte: 2 } } }, // Require at least 2 ratings for legitimacy
      orderBy: { _avg: { score: 'desc' } },
      take: 1,
    });

    if (socialRatings.length > 0 && socialRatings[0].socialId) {
      const topSocial = await prisma.social.findUnique({
        where: { id: socialRatings[0].socialId }
      });
      if (topSocial && socialRatings[0]._avg.score !== null) {
        hallOfFamePint = {
          pub: topSocial.pubName,
          beer: topSocial.beerName,
          brewery: topSocial.breweryName,
          score: socialRatings[0]._avg.score,
          date: topSocial.date,
          ratingCount: socialRatings[0]._count.score,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load database content on home page', e);
  }

  return (
    <div className="page-container animate-fade-in" style={{ gap: '24px' }}>
      
      {/* Hero */}
      <div style={{ 
        textAlign: 'center', 
        padding: '48px 20px 40px',
      }}>
        <Image 
          src="/assets/bras-logo.png" 
          alt="BRAS Logo" 
          width={320}
          height={320}
          style={{ objectFit: 'contain', marginBottom: '24px' }}
          quality={100}
          unoptimized={true}
          priority
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
          University of Brighton&apos;s student society for the Campaign for Real Ale. We rate independent pubs across Brighton &amp; Hove as members.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/rate" className="btn btn--primary btn--lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Beer size={18} /> Score a Pint
          </Link>
          <Link href="/leaderboard" className="btn btn--outline btn--lg" style={{ display: 'flex', alignItems: 'center' }}>
            View Rankings
          </Link>
        </div>
      </div>

      {/* ── Pint Hall of Fame ── */}
      {hallOfFamePint && (
        <div className="hall-of-fame animate-fade-in animate-delay-1">
          <span className="hall-of-fame__eyebrow">Hall of Fame</span>
          <div className="hall-of-fame__trophy">
            <Trophy size={44} strokeWidth={1.5} />
          </div>
          <div className="hall-of-fame__title">{hallOfFamePint.pub}</div>
          <div className="hall-of-fame__beer">
            {hallOfFamePint.beer || 'Cask Ale'}
            {hallOfFamePint.brewery && ` · ${hallOfFamePint.brewery}`}
          </div>
          <div className="hall-of-fame__score">{hallOfFamePint.score.toFixed(2)}★</div>
          <div className="hall-of-fame__stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className="hall-of-fame__star"
                fill={i < Math.round(hallOfFamePint.score / 2) ? '#D4AF37' : 'none'}
                stroke="#D4AF37"
              />
            ))}
          </div>
          <div className="hall-of-fame__meta">
            Highest rated pint of all time · <strong>{hallOfFamePint.date}</strong> · {hallOfFamePint.ratingCount} ratings
          </div>
        </div>
      )}

      {/* Active Social callout */}
      {latestTimelineEvent && latestTimelineEvent.avgScore > 0 && (
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
              {latestTimelineEvent.pub} - {latestTimelineEvent.beerName || "Cask Ale"}
            </h3>
            <p style={{ fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Visited on {latestTimelineEvent.date} · Social Score: <strong>{latestTimelineEvent.avgScore.toFixed(2)}★</strong>
            </p>
          </div>
          <Link href="/rate" className="btn btn--accent btn--sm" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Submit Rating
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid-auto">
        {settings?.leaderboard !== false && (
          <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}><Trophy size={32} strokeWidth={1.5} /></div>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>Pint Leaderboard</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Which Brighton pubs serve the finest cask.
            </p>
            <Link href="/leaderboard" className="btn btn--outline btn--sm">View List</Link>
          </div>
        )}

        {settings?.wordle !== false && (
          <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}><Gamepad2 size={32} strokeWidth={1.5} /></div>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>Pub Wordle</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Test your real ale vocabulary daily.
            </p>
            <Link href="/wordle" className="btn btn--outline btn--sm">Play Now</Link>
          </div>
        )}

        {settings?.awards !== false && (
          <div className="section-card section-card--hoverable" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}><Medal size={32} strokeWidth={1.5} /></div>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>Annual Awards</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Nominate for end-of-year superlatives.
            </p>
            <Link href="/awards" className="btn btn--outline btn--sm">Vote</Link>
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
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{totalRatings}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Member Ratings Cast</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{totalMembers}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Members</div>
        </div>
      </div>

    </div>
  );
}
