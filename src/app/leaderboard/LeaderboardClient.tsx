"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Trophy, ArrowUp, ArrowDown, ArrowUpDown, Info } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type SortKey = 'score' | 'date' | 'ratingsCount' | 'pub' | 'pint' | 'brewery';
type SortOrder = 'asc' | 'desc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LeaderboardClient({ initialPubs, isLoggedIn }: { initialPubs: any[], isLoggedIn: boolean }) {
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const router = useRouter();

  // Subscribe to Realtime changes
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('realtime:ratings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Rating' },
        (payload) => {
          console.log('Realtime change received!', payload);
          // Refresh the current route to fetch new server props
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Filter pubs by academic year
  const filteredPubs = initialPubs.filter(pub => {
    if (selectedYear === 'All') return true;
    return pub.academicYear === selectedYear;
  });

  // Find the top pint overall / for this academic year
  const topPint = filteredPubs.length > 0 
    ? [...filteredPubs].sort((a, b) => {
        const scoreA = a.score !== null && a.score !== undefined ? a.score : 0;
        const scoreB = b.score !== null && b.score !== undefined ? b.score : 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        
        // Tie-breaker: most ratings
        const getNum = (val: string | number | undefined | null) => {
          if (val === 'Consensus' || val === undefined || val === null) return 1;
          const parsed = typeof val === 'string' ? parseInt(val) : val;
          return isNaN(parsed) ? 0 : parsed;
        };
        const countA = getNum(a.ratingsCount);
        const countB = getNum(b.ratingsCount);
        return countB - countA;
      })[0]
    : null;

  // Sort pubs
  const sortedPubs = [...filteredPubs].sort((a, b) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let valA: any = a[sortKey];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let valB: any = b[sortKey];

    if (sortKey === 'ratingsCount') {
      const getNum = (val: string | number) => {
        if (val === 'Consensus') return 1;
        const parsed = typeof val === 'string' ? parseInt(val) : val;
        return isNaN(parsed) ? 0 : parsed;
      };
      valA = getNum(a.ratingsCount);
      valB = getNum(b.ratingsCount);
    } else if (sortKey === 'score') {
      valA = a.score !== null && a.score !== undefined ? a.score : 0;
      valB = b.score !== null && b.score !== undefined ? b.score : 0;
    } else if (sortKey === 'date') {
      valA = a.date ? new Date(a.date).getTime() : 0;
      valB = b.date ? new Date(b.date).getTime() : 0;
    } else if (sortKey === 'pub' || sortKey === 'pint' || sortKey === 'brewery') {
      valA = (a[sortKey] || '').toString().toLowerCase();
      valB = (b[sortKey] || '').toString().toLowerCase();
    }

    if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
    if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  const displayedPubs = isLoggedIn ? sortedPubs : sortedPubs.slice(0, 10);
  const isCapped = !isLoggedIn && sortedPubs.length > 10;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortOrder(key === 'pub' || key === 'pint' || key === 'brewery' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    const isActive = sortKey === key;
    const style = {
      display: 'inline-flex',
      alignItems: 'center',
      marginLeft: '6px',
      verticalAlign: 'middle',
      color: isActive ? 'var(--accent)' : 'var(--text-light)',
      opacity: isActive ? 1 : 0.4,
      transition: 'all 0.2s ease'
    };

    if (!isActive) {
      return <ArrowUpDown size={13} style={style} />;
    }
    return sortOrder === 'desc' 
      ? <ArrowDown size={13} style={style} /> 
      : <ArrowUp size={13} style={style} />;
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      
      <div className="leaderboard-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <span className="page-header__eyebrow">Rankings</span>
          <h1 className="page-header__title">Pint Leaderboard</h1>
          <p className="page-header__subtitle">
            Ranked by average score given by Brighton Real Ale Society members.
          </p>
        </div>

        <div className="leaderboard-filter-group">
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filter Year:</span>
          <div className="leaderboard-filter-pills">
            {['All', '23/24', '24/25', '25/26', '26/27'].map(year => (
              <button 
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedYear === year ? 'var(--accent)' : 'transparent',
                  color: selectedYear === year ? '#1a1010' : 'var(--text-color)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isCapped && (
        <div className="notice notice--warning" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} /> Top 10 View Only
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', lineHeight: 1.4 }}>
              To protect member scores and avoid slagging off lower-ranked pubs, we only show the Top 10 venues publicly. Log in as a member to view the complete rankings ({sortedPubs.length} pubs).
            </p>
          </div>
          <Link href="/login">
            <button className="btn btn--accent btn--sm">
              Sign In to View All
            </button>
          </Link>
        </div>
      )}

      {/* Hall of Fame Card displaying #1 ranked pint */}
      {topPint && (
        <div className="hall-of-fame" style={{ marginBottom: '32px' }}>
          <span className="hall-of-fame__eyebrow">Top Rated Pint</span>
          <div className="hall-of-fame__trophy">
            <Trophy size={48} />
          </div>
          <h2 className="hall-of-fame__title">{topPint.pint}</h2>
          <div className="hall-of-fame__beer">
            Brewed by {topPint.brewery} • Served at {topPint.pub}
          </div>
          <div className="hall-of-fame__score">
            {topPint.score !== null && topPint.score !== undefined ? topPint.score.toFixed(2) : '0.00'}★
          </div>
          <div className="hall-of-fame__stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="hall-of-fame__star">★</span>
            ))}
          </div>
          <div className="hall-of-fame__meta">
            Based on <strong>{topPint.ratingsCount <= 3 ? 'Consensus' : `${topPint.ratingsCount} ratings`}</strong> • Rated on <strong>{topPint.date}</strong>
          </div>
        </div>
      )}

      {sortedPubs.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '32px' }}>
          <Trophy className="empty-state__icon" size={48} />
          <h3 className="empty-state__title">Leaderboard is Empty</h3>
          <p className="empty-state__description">
            No pints have been rated yet for the {selectedYear !== 'All' ? `${selectedYear} academic year` : 'selected period'}.
          </p>
          {isLoggedIn && (
            <Link href="/rate">
              <button className="btn btn--accent">Rate the First Pint</button>
            </Link>
          )}
        </div>
      ) : (
        <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Desktop View (Table) */}
          <div className="leaderboard-table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('pint')}>
                    Pint Evaluated {getSortIcon('pint')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('brewery')}>
                    Brewed By {getSortIcon('brewery')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('pub')}>
                    Pub {getSortIcon('pub')}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                    Date {getSortIcon('date')}
                  </th>
                  <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => toggleSort('score')}>
                    Score {getSortIcon('score')}
                  </th>
                  <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => toggleSort('ratingsCount')}>
                    Ratings {getSortIcon('ratingsCount')}
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {displayedPubs.map((pub, idx) => {
                  const rankNum = idx + 1;
                  const isTopThree = rankNum <= 3;

                  return (
                    <motion.tr 
                      variants={itemVariants}
                      key={pub.pub + pub.date} 
                      style={{
                        background: isTopThree ? 'var(--surface-warm)' : undefined
                      }}
                    >
                      <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {isTopThree ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {rankNum} <Trophy size={16} color={rankNum === 1 ? '#D4AF37' : rankNum === 2 ? '#C0C0C0' : '#CD7F32'} />
                          </div>
                        ) : rankNum}
                      </td>
                      <td style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                        {pub.pint}
                      </td>
                      <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{pub.brewery}</td>
                      <td style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
                        {pub.pub}
                      </td>
                      <td>{pub.date}</td>
                      <td style={{ 
                        textAlign: 'center', 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: 'var(--accent)'
                      }}>
                        {pub.score !== null && pub.score !== undefined ? `${pub.score.toFixed(2)}★` : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {pub.ratingsCount <= 3 ? (
                          <span 
                            title="Exact rating count hidden (3 or fewer ratings) to protect member privacy."
                            style={{ textDecoration: 'underline dotted', cursor: 'help' }}
                          >
                            Consensus
                          </span>
                        ) : pub.ratingsCount}
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>

          {/* Mobile View (Cards) */}
          <div className="leaderboard-cards-container" style={{ padding: '16px' }}>
            {displayedPubs.map((pub, idx) => {
              const rankNum = idx + 1;
              const isTopThree = rankNum <= 3;
              return (
                <div 
                  key={pub.pub + pub.date} 
                  style={{
                    background: isTopThree ? 'var(--surface-warm)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.15rem', color: isTopThree ? 'var(--accent)' : 'inherit' }}>
                        #{rankNum}
                      </span>
                      {isTopThree && <Trophy size={16} color={rankNum === 1 ? '#D4AF37' : rankNum === 2 ? '#C0C0C0' : '#CD7F32'} />}
                      <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{pub.pint}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent)' }}>
                      {pub.score !== null && pub.score !== undefined ? `${pub.score.toFixed(2)}★` : 'N/A'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div>Brewery: <span style={{ fontStyle: 'italic', color: 'var(--text-color)' }}>{pub.brewery}</span></div>
                    <div>Pub: <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-color)' }}>{pub.pub}</span></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    <span>{pub.date}</span>
                    <span>
                      {pub.ratingsCount <= 3 ? (
                        <span 
                          title="Exact rating count hidden (3 or fewer ratings) to protect member privacy."
                          style={{ textDecoration: 'underline dotted', cursor: 'help' }}
                        >
                          Consensus
                        </span>
                      ) : `${pub.ratingsCount} ratings`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footnote explanation for Consensus */}
          <div style={{ 
            padding: '12px 16px', 
            borderTop: '1px solid var(--border)', 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'var(--surface-muted)'
          }}>
            <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span><strong>Consensus:</strong> To protect member anonymity, exact rating counts are hidden for pints with 3 or fewer ratings.</span>
          </div>
        </div>
      )}

    </motion.div>
  );
}
