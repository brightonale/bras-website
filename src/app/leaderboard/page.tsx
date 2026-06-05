"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import pubsData from '@/data/pubs.json';
import { Lock, Trophy } from 'lucide-react';

type SortKey = 'score' | 'date' | 'ratingsCount';
type SortOrder = 'asc' | 'desc';

export default function LeaderboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pubs, setPubs] = useState<any[]>(pubsData);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const user = localStorage.getItem('bras_user_name');
    setIsLoggedIn(!!user);

    // Fetch dynamic events from db.json to merge
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.events && data.events.length > 0) {
          // Merge and avoid duplicates by pub name + date
          const merged = [...pubsData];
          data.events.forEach((evt: any) => {
            const exists = merged.some(p => p.pub.toLowerCase() === evt.pub.toLowerCase() && p.date === evt.date);
            if (!exists) {
              merged.push(evt);
            }
          });
          setPubs(merged);
        }
      })
      .catch(err => console.warn("Could not merge dynamic events", err));
  }, []);

  // Filter pubs by academic year
  const filteredPubs = pubs.filter(pub => {
    if (selectedYear === 'All') return true;
    return pub.academicYear === selectedYear;
  });

  // Sort pubs
  const sortedPubs = [...filteredPubs].sort((a, b) => {
    let valA: any = a[sortKey];
    let valB: any = b[sortKey];

    // Handle ratingsCount conversions ("Consensus" vs integers)
    if (sortKey === 'ratingsCount') {
      const getNum = (val: string) => {
        if (val === 'Consensus') return 999;
        const parsed = parseInt(val);
        return isNaN(parsed) ? 0 : parsed;
      };
      valA = getNum(a.ratingsCount);
      valB = getNum(b.ratingsCount);
    } else if (sortKey === 'score') {
      valA = a.score !== null && a.score !== undefined ? a.score : 0;
      valB = b.score !== null && b.score !== undefined ? b.score : 0;
    } else if (sortKey === 'date') {
      valA = a.date;
      valB = b.date;
    }

    if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
    if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  // Limit output if logged out
  const displayedPubs = isLoggedIn ? sortedPubs : sortedPubs.slice(0, 10);
  const isCapped = !isLoggedIn && sortedPubs.length > 10;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const getSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortOrder === 'desc' ? ' ↓' : ' ↑';
  };

  return (
    <div className="page-container animate-fade-in">
      
      {/* Header and filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <span className="page-header__eyebrow">Rankings</span>
          <h1 className="page-header__title">Official Pub Leaderboard</h1>
          <p className="page-header__subtitle">
            Ranked by average score given by Brighton Real Ale Society inspectors.
          </p>
        </div>

        {/* Academic Year Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filter Year:</span>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--border)', padding: '4px', borderRadius: '8px' }}>
            {['All', '23/24', '24/25', '25/26'].map(year => (
              <button 
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedYear === year ? 'var(--primary)' : 'transparent',
                  color: selectedYear === year ? '#fff' : 'var(--text-color)',
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

      {/* Capped View Alert for logged-out users */}
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

      {/* Leaderboard Table */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                <th>Pub</th>
                <th>Pint Evaluated</th>
                <th>Brewed By</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                  Date {getSortIndicator('date')}
                </th>
                <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => toggleSort('score')}>
                  Score {getSortIndicator('score')}
                </th>
                <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => toggleSort('ratingsCount')}>
                  Ratings {getSortIndicator('ratingsCount')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPubs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                    No ratings logged for academic year {selectedYear}.
                  </td>
                </tr>
              ) : (
                displayedPubs.map((pub, idx) => {
                  const rankNum = idx + 1;
                  const isTopThree = rankNum <= 3;

                  return (
                    <tr key={pub.pub + pub.date} style={{
                      background: isTopThree ? 'var(--surface-warm)' : undefined
                    }}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {isTopThree ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {rankNum} <Trophy size={16} color={rankNum === 1 ? '#D4AF37' : rankNum === 2 ? '#C0C0C0' : '#CD7F32'} />
                          </div>
                        ) : rankNum}
                      </td>
                      <td style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
                        {pub.pub}
                      </td>
                      <td>{pub.pint}</td>
                      <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{pub.brewery}</td>
                      <td>{pub.date}</td>
                      <td style={{ 
                        textAlign: 'center', 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: 'var(--primary)'
                      }}>
                        {pub.score !== null && pub.score !== undefined ? `${pub.score.toFixed(2)}★` : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {pub.ratingsCount}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
