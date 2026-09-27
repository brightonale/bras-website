"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Search, 
  Download, 
  ExternalLink, 
  HelpCircle, 
  SlidersHorizontal, 
  Trophy, 
  Award, 
  Beer, 
  ChevronDown, 
  Info,
  Check,
  Building2,
  Lock,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { CompleteMatrixData, MatrixMemberRow } from '@/lib/matrixData';

interface MatrixClientProps {
  initialData: CompleteMatrixData;
  isLoggedIn: boolean;
}

export default function MatrixClient({ initialData, isLoggedIn }: MatrixClientProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'roster' | 'pubs' | 'camra'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreTierFilter, setScoreTierFilter] = useState<'all' | 'excellent' | 'good' | 'average' | 'poor'>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'veteran' | 'active' | 'regular'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'name-asc' | 'name-desc' | 'score-desc' | 'score-asc'>('rank');
  const [selectedCell, setSelectedCell] = useState<{ member: string; pub: string; score: number } | null>(null);

  const { pubs, rows, pubSummaries, stats } = initialData;

  // If not logged in, limit preview to top 10 members for privacy
  const availableRows = useMemo(() => {
    return isLoggedIn ? rows : rows.slice(0, 10);
  }, [rows, isLoggedIn]);

  // Filter and sort rows
  const filteredRows = useMemo(() => {
    return availableRows.filter(r => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = r.member.toLowerCase().includes(query);
        const matchesFavPub = r.favoritePub?.toLowerCase().includes(query);
        if (!matchesName && !matchesFavPub) return false;
      }

      // Attendance filter
      if (attendanceFilter === 'veteran' && r.pubsVisited < 15) return false;
      if (attendanceFilter === 'active' && r.pubsVisited < 10) return false;
      if (attendanceFilter === 'regular' && r.pubsVisited < 5) return false;

      // Score tier filter
      if (scoreTierFilter !== 'all') {
        const hasScoreInTier = Object.values(r.ratings).some(val => {
          if (val === null) return false;
          if (scoreTierFilter === 'excellent') return val >= 8.0;
          if (scoreTierFilter === 'good') return val >= 6.0 && val < 8.0;
          if (scoreTierFilter === 'average') return val >= 4.0 && val < 6.0;
          if (scoreTierFilter === 'poor') return val < 4.0;
          return true;
        });
        if (!hasScoreInTier) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank;
      if (sortBy === 'name-asc') return a.member.localeCompare(b.member);
      if (sortBy === 'name-desc') return b.member.localeCompare(a.member);
      if (sortBy === 'score-desc') return (b.avgScore || 0) - (a.avgScore || 0);
      if (sortBy === 'score-asc') return (a.avgScore || 10) - (b.avgScore || 10);
      return 0;
    });
  }, [availableRows, searchQuery, attendanceFilter, scoreTierFilter, sortBy]);

  // Cell color helper
  const getCellStyles = (val: number | null) => {
    if (val === null) {
      return {
        bg: 'transparent',
        color: 'var(--text-light)',
        border: '1px solid var(--border)'
      };
    }
    if (val >= 8.0) {
      return {
        bg: 'rgba(34, 197, 94, 0.22)',
        color: '#4ade80',
        border: '1px solid rgba(34, 197, 94, 0.4)'
      };
    }
    if (val >= 6.0) {
      return {
        bg: 'rgba(234, 179, 8, 0.22)',
        color: '#facc15',
        border: '1px solid rgba(234, 179, 8, 0.4)'
      };
    }
    if (val >= 4.0) {
      return {
        bg: 'rgba(249, 115, 22, 0.2)',
        color: '#fb923c',
        border: '1px solid rgba(249, 115, 22, 0.35)'
      };
    }
    return {
      bg: 'rgba(239, 68, 68, 0.22)',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.4)'
    };
  };

  // Export to CSV
  const handleExportCSV = () => {
    const header = ['Member', 'Pubs Visited', 'Average Score', ...pubs];
    const csvRows = [header.join(',')];

    for (const r of rows) {
      const line = [
        `"${r.member}"`,
        r.pubsVisited,
        r.avgScore !== null ? r.avgScore.toFixed(2) : '""',
        ...pubs.map(p => (r.ratings[p] !== null ? r.ratings[p] : ''))
      ];
      csvRows.push(line.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bras-member-ratings-matrix-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container animate-fade-in" style={{ gap: '32px' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="page-header__eyebrow">Society Intelligence &amp; Ratings Archive</span>
            <h1 className="page-header__title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={32} className="accent-text" /> Member × Pub Matrix
            </h1>
            <p className="page-header__subtitle">
              Comprehensive cross-tabulation of every pint rating submitted by BRAS inspectors across all visited pubs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCSV}
              className="btn btn--outline btn--sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Download entire matrix as CSV"
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={() => setActiveTab('camra')}
              className="btn btn--primary btn--sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <HelpCircle size={15} /> CAMRA Scoring Guide
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Banner */}
      <div className="grid-auto" style={{ gap: '16px' }}>
        <div className="stat-box" style={{ borderRadius: '6px', padding: '16px' }}>
          <div className="stat-value">{stats.totalMembers}</div>
          <div className="stat-label">Active Inspectors</div>
        </div>
        <div className="stat-box" style={{ borderRadius: '6px', padding: '16px' }}>
          <div className="stat-value">{stats.totalPubs}</div>
          <div className="stat-label">Evaluated Pubs</div>
        </div>
        <div className="stat-box" style={{ borderRadius: '6px', padding: '16px' }}>
          <div className="stat-value">{stats.totalRatingsLogged}</div>
          <div className="stat-label">Total Pint Logs</div>
        </div>
        <div className="stat-box" style={{ borderRadius: '6px', padding: '16px' }}>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.societyAverage.toFixed(2)}★</div>
          <div className="stat-label">Society Consensus Avg</div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px',
        fontSize: '0.85rem'
      }}>
        {stats.mostAttendedPub && (
          <div style={{
            background: 'var(--surface-warm)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Trophy size={18} className="accent-text" />
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Highest Turnout</span>
              <strong>{stats.mostAttendedPub.pub}</strong> ({stats.mostAttendedPub.count} inspectors)
            </div>
          </div>
        )}

        {stats.highestRatedPub && (
          <div style={{
            background: 'var(--surface-warm)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Award size={18} style={{ color: '#4ade80' }} />
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Top Ranked Pub</span>
              <strong>{stats.highestRatedPub.pub}</strong> ({stats.highestRatedPub.score.toFixed(2)}★ avg)
            </div>
          </div>
        )}

        {stats.mostGenerousMember && (
          <div style={{
            background: 'var(--surface-warm)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Beer size={18} className="accent-text" />
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Most Generous Taster</span>
              <strong>{stats.mostGenerousMember.member}</strong> ({stats.mostGenerousMember.score.toFixed(2)}★ avg)
            </div>
          </div>
        )}

        {stats.harshestCritic && (
          <div style={{
            background: 'var(--surface-warm)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Sparkles size={18} style={{ color: '#f87171' }} />
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Toughest Critic</span>
              <strong>{stats.harshestCritic.member}</strong> ({stats.harshestCritic.score.toFixed(2)}★ avg)
            </div>
          </div>
        )}
      </div>

      {/* Guest Preview Notice */}
      {!isLoggedIn && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(230,149,0,0.15), rgba(185,28,28,0.1))',
          border: '1px solid var(--accent)',
          borderRadius: '8px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Lock size={20} className="accent-text" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem', display: 'block' }}>Member Matrix Preview Mode</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing top 10 society inspectors. Log in with your BRAS account to unlock all 44 members and personal rating logs.
              </span>
            </div>
          </div>
          <Link href="/login">
            <button className="btn btn--primary btn--sm" style={{ whiteSpace: 'nowrap' }}>
              Sign In to Unlock All
            </button>
          </Link>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'matrix' ? '3px solid var(--accent)' : '3px solid transparent',
            color: activeTab === 'matrix' ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: activeTab === 'matrix' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📊 Full Heatmap Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'roster' ? '3px solid var(--accent)' : '3px solid transparent',
            color: activeTab === 'roster' ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: activeTab === 'roster' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>👤 Inspector Roster ({filteredRows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pubs')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pubs' ? '3px solid var(--accent)' : '3px solid transparent',
            color: activeTab === 'pubs' ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: activeTab === 'pubs' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🍻 Pub Intelligence ({pubs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('camra')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'camra' ? '3px solid var(--accent)' : '3px solid transparent',
            color: activeTab === 'camra' ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: activeTab === 'camra' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🍺 CAMRA Scoring Standard</span>
        </button>
      </div>

      {/* FILTER & CONTROLS TOOLBAR (for matrix & roster views) */}
      {(activeTab === 'matrix' || activeTab === 'roster') && (
        <div className="section-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                placeholder="Search member name or favorite pub..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Attendance Filter */}
            <div style={{ flex: '0 1 180px' }}>
              <select
                value={attendanceFilter}
                onChange={e => setAttendanceFilter(e.target.value as any)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <option value="all">All Attendance Tiers</option>
                <option value="veteran">Veterans (15+ Pubs)</option>
                <option value="active">Active (10+ Pubs)</option>
                <option value="regular">Regulars (5+ Pubs)</option>
              </select>
            </div>

            {/* Score Tier Filter */}
            <div style={{ flex: '0 1 180px' }}>
              <select
                value={scoreTierFilter}
                onChange={e => setScoreTierFilter(e.target.value as any)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <option value="all">All Score Tiers</option>
                <option value="excellent">Only Excellent (8.0+)</option>
                <option value="good">Only Good (6.0 - 7.9)</option>
                <option value="average">Only Average (4.0 - 5.9)</option>
                <option value="poor">Only Poor (&lt; 4.0)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ flex: '0 1 180px' }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <option value="rank">Sort by Activity Rank</option>
                <option value="name-asc">Sort Name (A to Z)</option>
                <option value="name-desc">Sort Name (Z to A)</option>
                <option value="score-desc">Sort Avg Score (Highest)</option>
                <option value="score-asc">Sort Avg Score (Lowest)</option>
              </select>
            </div>
          </div>

          {/* Color Heatmap Legend */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>Scale Legend:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: 'rgba(34, 197, 94, 0.3)', border: '1px solid #4ade80', borderRadius: '3px' }}></span>
              <span>8.0+ Excellent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: 'rgba(234, 179, 8, 0.3)', border: '1px solid #facc15', borderRadius: '3px' }}></span>
              <span>6.0–7.9 Good</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: 'rgba(249, 115, 22, 0.3)', border: '1px solid #fb923c', borderRadius: '3px' }}></span>
              <span>4.0–5.9 Average</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: 'rgba(239, 68, 68, 0.3)', border: '1px solid #f87171', borderRadius: '3px' }}></span>
              <span>&lt;4.0 Poor</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '3px', textAlign: 'center', lineHeight: '12px' }}>—</span>
              <span>Not Visited</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 1: HEATMAP MATRIX ==================== */}
      {activeTab === 'matrix' && (
        <div className="section-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '8px' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxHeight: '720px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: 'max-content', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  {/* Sticky Member Column Header */}
                  <th style={{
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    backgroundColor: '#1c1111',
                    padding: '14px 18px',
                    textAlign: 'left',
                    zIndex: 25,
                    borderRight: '2px solid var(--border-strong)',
                    borderBottom: '2px solid var(--border-strong)',
                    minWidth: '200px',
                    boxShadow: '3px 3px 6px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}>Inspector</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pubs / Avg</span>
                    </div>
                  </th>

                  {/* Pub Headers */}
                  {pubs.map(pub => {
                    const summary = pubSummaries[pub];
                    return (
                      <th
                        key={pub}
                        style={{
                          position: 'sticky',
                          top: 0,
                          backgroundColor: '#180e0e',
                          padding: '12px 10px',
                          textAlign: 'center',
                          zIndex: 20,
                          borderRight: '1px solid var(--border)',
                          borderBottom: '2px solid var(--border-strong)',
                          minWidth: '78px',
                          maxWidth: '92px',
                          boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
                        }}
                      >
                        <div style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                          whiteSpace: 'nowrap',
                          height: '140px',
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--text-color)',
                          margin: '0 auto',
                          paddingLeft: '4px'
                        }}>
                          {pub}
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: summary?.averageScore && summary.averageScore >= 7.0 ? 'var(--accent)' : 'var(--text-muted)',
                          fontWeight: 700,
                          marginTop: '6px',
                          borderTop: '1px solid var(--border)',
                          paddingTop: '4px'
                        }}>
                          {summary?.averageScore !== null ? `${summary.averageScore.toFixed(1)}★` : '—'}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row, rIdx) => {
                  const isEven = rIdx % 2 === 0;
                  const rowBg = isEven ? 'var(--surface)' : 'var(--surface-warm)';
                  const stickyColBg = isEven ? '#181010' : '#201414';

                  return (
                    <tr key={row.member} style={{ backgroundColor: rowBg }}>
                      {/* Sticky Member Column Cell */}
                      <td style={{
                        position: 'sticky',
                        left: 0,
                        backgroundColor: stickyColBg,
                        padding: '10px 16px',
                        zIndex: 10,
                        borderRight: '2px solid var(--border-strong)',
                        borderBottom: '1px solid var(--border)',
                        boxShadow: '3px 0 6px rgba(0,0,0,0.15)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <Link
                            href={`/profile/${encodeURIComponent(row.member)}`}
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-color)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--accent)',
                              color: '#fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.68rem',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}>
                              {row.member.slice(0, 2).toUpperCase()}
                            </span>
                            <span>{row.member}</span>
                          </Link>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge badge--muted" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                              {row.pubsVisited}p
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--accent)', minWidth: '38px', textAlign: 'right' }}>
                              {row.avgScore !== null ? `${row.avgScore.toFixed(1)}★` : '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Pub Score Cells */}
                      {pubs.map(pub => {
                        const score = row.ratings[pub];
                        const cellStyle = getCellStyles(score);

                        return (
                          <td
                            key={pub}
                            onClick={() => {
                              if (score !== null) {
                                setSelectedCell({ member: row.member, pub, score });
                              }
                            }}
                            title={score !== null ? `${row.member} rated ${pub}: ${score.toFixed(1)}★` : `${row.member} did not visit ${pub}`}
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              fontWeight: score !== null ? 700 : 'normal',
                              backgroundColor: cellStyle.bg,
                              borderRight: '1px solid var(--border)',
                              borderBottom: '1px solid var(--border)',
                              color: cellStyle.color,
                              cursor: score !== null ? 'pointer' : 'default',
                              transition: 'transform 0.15s ease, background-color 0.15s ease',
                              userSelect: 'none'
                            }}
                          >
                            {score !== null ? score.toFixed(1) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

              {/* Bottom Sticky Pub Average Row */}
              <tfoot>
                <tr>
                  <td style={{
                    position: 'sticky',
                    left: 0,
                    bottom: 0,
                    backgroundColor: '#140b0b',
                    padding: '12px 16px',
                    fontWeight: 'bold',
                    zIndex: 22,
                    borderRight: '2px solid var(--border-strong)',
                    borderTop: '2px solid var(--border-strong)',
                    boxShadow: '3px -3px 6px rgba(0,0,0,0.2)'
                  }}>
                    <span style={{ color: 'var(--accent)', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                      Pub Consensus Avg
                    </span>
                  </td>

                  {pubs.map(pub => {
                    const summary = pubSummaries[pub];
                    return (
                      <td
                        key={pub}
                        style={{
                          position: 'sticky',
                          bottom: 0,
                          backgroundColor: '#140b0b',
                          padding: '10px 4px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          zIndex: 20,
                          borderRight: '1px solid var(--border)',
                          borderTop: '2px solid var(--border-strong)',
                          boxShadow: '0 -3px 6px rgba(0,0,0,0.2)'
                        }}
                      >
                        <div style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
                          {summary?.averageScore !== null ? `${summary.averageScore.toFixed(1)}★` : '—'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '2px' }}>
                          {summary?.ratingsCount || 0} votes
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: INSPECTOR ROSTER CARDS ==================== */}
      {activeTab === 'roster' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {filteredRows.map(row => (
            <div
              key={row.member}
              className="section-card section-card--hoverable"
              style={{
                padding: '20px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderLeft: '4px solid var(--accent)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #B91C1C 0%, #5A1010 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    {row.member.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/profile/${encodeURIComponent(row.member)}`}
                      style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-color)', textDecoration: 'none' }}
                    >
                      {row.member}
                    </Link>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Rank #{row.rank} in Society Activity
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    {row.avgScore !== null ? `${row.avgScore.toFixed(2)}★` : '—'}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Average Given</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', background: 'var(--surface-muted)', padding: '10px', borderRadius: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Pubs Visited</span>
                  <strong>{row.pubsVisited} / {pubs.length}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Attendance Rate</span>
                  <strong>{Math.round((row.pubsVisited / pubs.length) * 100)}%</strong>
                </div>
              </div>

              {row.favoritePub && (
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Top Rated Pub:</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600 }}>{row.favoritePub}</span>
                    <span className="badge badge--success" style={{ fontSize: '0.72rem' }}>
                      {row.highestScore !== null ? `${row.highestScore.toFixed(1)}★` : ''}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                <Link
                  href={`/profile/${encodeURIComponent(row.member)}`}
                  className="btn btn--outline btn--sm"
                  style={{ width: '100%', textAlign: 'center', display: 'block', fontSize: '0.8rem' }}
                >
                  View Full Profile &amp; History →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== TAB 3: PUB BREAKDOWN ==================== */}
      {activeTab === 'pubs' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {pubs.map(pub => {
            const summary = pubSummaries[pub];
            if (!summary) return null;

            return (
              <div
                key={pub}
                className="section-card"
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderTop: '3px solid var(--accent)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Sussex Pub
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', margin: '2px 0 0 0' }}>
                      {pub}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                      {summary.averageScore !== null ? `${summary.averageScore.toFixed(2)}★` : '—'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {summary.ratingsCount} Inspector Votes
                    </span>
                  </div>
                </div>

                {/* Score Spread Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: 'var(--surface-muted)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>Highest</span>
                    <strong style={{ color: '#4ade80', fontSize: '0.85rem' }}>
                      {summary.highestScore !== null ? `${summary.highestScore.toFixed(1)}★` : '—'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>Consensus</span>
                    <strong style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
                      {summary.averageScore !== null ? `${summary.averageScore.toFixed(1)}★` : '—'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block' }}>Lowest</span>
                    <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>
                      {summary.lowestScore !== null ? `${summary.lowestScore.toFixed(1)}★` : '—'}
                    </strong>
                  </div>
                </div>

                {/* Rating Distribution Bar */}
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Vote Quality Breakdown:
                  </span>
                  <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', backgroundColor: 'var(--surface-muted)' }}>
                    {summary.ratingsCount > 0 && (
                      <>
                        <div style={{ width: `${(summary.ratingsDistribution.excellent / summary.ratingsCount) * 100}%`, backgroundColor: '#4ade80' }} title={`Excellent: ${summary.ratingsDistribution.excellent}`} />
                        <div style={{ width: `${(summary.ratingsDistribution.good / summary.ratingsCount) * 100}%`, backgroundColor: '#facc15' }} title={`Good: ${summary.ratingsDistribution.good}`} />
                        <div style={{ width: `${(summary.ratingsDistribution.average / summary.ratingsCount) * 100}%`, backgroundColor: '#fb923c' }} title={`Average: ${summary.ratingsDistribution.average}`} />
                        <div style={{ width: `${(summary.ratingsDistribution.poor / summary.ratingsCount) * 100}%`, backgroundColor: '#f87171' }} title={`Poor: ${summary.ratingsDistribution.poor}`} />
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>{summary.ratingsDistribution.excellent} Exc</span>
                    <span>{summary.ratingsDistribution.good} Good</span>
                    <span>{summary.ratingsDistribution.average} Avg</span>
                    <span>{summary.ratingsDistribution.poor} Poor</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== TAB 4: CAMRA SCORING GUIDE ==================== */}
      {activeTab === 'camra' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Main Scoring Explainer Card */}
          <div className="section-card" style={{ borderTop: '4px solid var(--accent)', padding: '28px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <span className="page-header__eyebrow">National Beer Scoring System (NBSS)</span>
                <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', margin: '4px 0 8px 0' }}>
                  How&apos;s Your Beer? CAMRA Scoring Reference
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '720px', margin: 0 }}>
                  The Campaign for Real Ale (CAMRA) developed the National Beer Scoring System (NBSS) to enable volunteer inspectors to evaluate real ale quality across UK pubs consistently. The Brighton Real Ale Society calibrates its 1.00–10.00 scoring scale directly against this national gold standard.
                </p>
              </div>

              <a
                href="https://camra.org.uk/beer-and-pubs/beer/beer-scoring/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={14} /> Official CAMRA Guide
              </a>
            </div>

            {/* Infographic Container */}
            <div style={{
              background: '#0d0707',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '28px'
            }}>
              {/* CAMRA Dark Infographic Image */}
              <div style={{ maxWidth: '720px', width: '100%', position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/camra-beer-scoring-guide.png"
                  alt="CAMRA National Beer Scoring System - How's Your Beer? scoring guide"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '6px',
                    display: 'block',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '600px' }}>
                Official National Beer Scoring System graphic reproduced with attribution to the Campaign for Real Ale (CAMRA) &bull;{' '}
                <a href="https://camra.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                  camra.org.uk
                </a>
              </div>
            </div>

            {/* Score Calibration Grid: CAMRA vs BRAS */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
                Score Calibration: CAMRA NBSS (0–5) to BRAS Scale (1–10)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#4ade80', fontSize: '1.05rem' }}>5. Perfect / Excellent</strong>
                    <span className="badge badge--success">BRAS 8.5 – 10.0★</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Sublime condition. Peak clarity, optimal cellar temperature, complex aroma, and immaculate carbonation. Zero flaws.
                  </p>
                </div>

                <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#facc15', fontSize: '1.05rem' }}>4. Very Good</strong>
                    <span className="badge badge--accent">BRAS 7.0 – 8.4★</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Clearly above average. Clean, fresh, full of character, and well kept by cellar staff. A pint you actively recommend.
                  </p>
                </div>

                <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#fb923c', fontSize: '1.05rem' }}>3. Good</strong>
                    <span className="badge badge--warning">BRAS 6.0 – 6.9★</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Solid cask condition. Typical pub standard without notable faults. Drinkable and enjoyable, with room for cellar polish.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-color)', fontSize: '1.05rem' }}>2. Average</strong>
                    <span className="badge badge--muted">BRAS 4.5 – 5.9★</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Acceptable but uninspiring. May be slightly flat, marginally off temperature, or tired at the end of the barrel.
                  </p>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#f87171', fontSize: '1.05rem' }}>1. Poor</strong>
                    <span className="badge badge--warning">BRAS 3.0 – 4.4★</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Clearly substandard. Noticeable oxidation, off-flavours, vinegar twinges, or severe line-cleaning issues.
                  </p>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#ef4444', fontSize: '1.05rem' }}>0. No Cask / Undrinkable</strong>
                    <span className="badge badge--warning">BRAS 1.0 – 2.9★</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Returned to bar. Clouded, sour, contaminated, or cask taps out of service. Should not be served.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* CELL DETAIL MODAL / POPOVER */}
      {selectedCell && (
        <div
          onClick={() => setSelectedCell(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="section-card animate-fade-in"
            style={{
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              borderRadius: '10px',
              borderTop: '4px solid var(--accent)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span className="page-header__eyebrow">Rating Record</span>
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', margin: '4px 0 0 0' }}>
                  {selectedCell.pub}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--surface-muted)', padding: '16px', borderRadius: '8px', textAlign: 'center', margin: '16px 0' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 'bold', color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                {selectedCell.score.toFixed(1)} ★
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Awarded by <strong>{selectedCell.member}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link href={`/profile/${encodeURIComponent(selectedCell.member)}`} className="btn btn--primary btn--sm">
                View {selectedCell.member}&apos;s Profile
              </Link>
              <button onClick={() => setSelectedCell(null)} className="btn btn--outline btn--sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
