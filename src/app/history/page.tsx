import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import CommitteeGrid from '@/components/CommitteeGrid';
import { 
  History as HistoryIcon, 
  Users, 
  Building2, 
  ExternalLink, 
  Trophy, 
  HeartHandshake, 
  Clock 
} from 'lucide-react';

interface CaptionPost {
  date: string;
  url: string;
  content: string;
}

async function parseCaptions(): Promise<CaptionPost[]> {
  const filePath = path.join(process.cwd(), 'src/data/captions.md');
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
  
  const sections = fileContent.split('\n---\n');
  const posts: CaptionPost[] = [];

  for (const sec of sections) {
    const lines = sec.trim().split('\n');
    if (lines.length < 2) continue;

    const headerLine = lines[0].trim();
    const match = headerLine.match(/###\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (!match) continue;

    const dateStr = match[1];
    const url = match[2];
    const content = lines.slice(1).join('\n').trim();

    posts.push({ date: dateStr, url, content });
  }

  // Sort posts chronologically (oldest first)
  return posts.sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    return [];
  }
}

export default async function HistoryPage() {
  const posts = await parseCaptions();

  // Helper to format date in formal British format
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.split(' ')[0]);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Helper to get month-year for grouping
  const getMonthYear = (dateStr: string) => {
    try {
      const d = new Date(dateStr.split(' ')[0]);
      return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Helper to get a short label for the timeline dot
  const getTimelineLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr.split(' ')[0]);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  // Group posts by month-year for the flowing timeline
  const grouped = new Map<string, CaptionPost[]>();
  for (const post of posts) {
    const key = getMonthYear(post.date);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(post);
  }

  return (
    <div className="page-container animate-fade-in" style={{ gap: '48px' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '24px' }}>
        <span className="page-header__eyebrow">Archives &amp; Directory</span>
        <h1 className="page-header__title">Society History &amp; Directory</h1>
        <p className="page-header__subtitle">
          The people behind the pints. A chronological record of the society&apos;s activities, key figures, and industry partners since our foundation.
        </p>
      </div>

      {/* Overview Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-heading)' }}>
          <HistoryIcon size={24} className="accent-text" /> Society Overview
        </h2>
        <div className="section-card" style={{ borderTop: '4px solid var(--accent)', borderRadius: '2px' }}>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '32px', color: 'var(--text-color)' }}>
            The Brighton Real Ale Society (BRAS) is a university-rooted student and alumni collective dedicated to discovering, rating, and celebrating exceptional cask conditioned beers throughout Sussex. Founded in November 2023, our mission spans beyond casual socialising; we actively support independent local breweries, run certified charity pub quizzes, and participate in direct collaborative brewing operations.
          </p>
          <div className="grid-auto" style={{ gap: '24px' }}>
            <div className="stat-box" style={{ borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '12px' }}>
                <Clock size={28} />
              </div>
              <div className="stat-value">30+ Mos</div>
              <div className="stat-label">Active History</div>
            </div>
            <div className="stat-box" style={{ borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '12px' }}>
                <Trophy size={28} />
              </div>
              <div className="stat-value">8.6 / 10</div>
              <div className="stat-label">Highest Rated Ale</div>
            </div>
            <div className="stat-box" style={{ borderRadius: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '12px' }}>
                <HeartHandshake size={28} />
              </div>
              <div className="stat-value">£435</div>
              <div className="stat-label">Raised for Charity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Committee Directory Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-heading)' }}>
            <Users size={24} className="accent-text" /> Key Figures &amp; Committee
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
            Leadership succession from our current officers down to the society&apos;s 2023 founders.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CommitteeGrid />
        </div>
      </section>

      {/* Key Collaborators Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-heading)' }}>
          <Building2 size={24} className="accent-text" /> Key Industry Partners
        </h2>
        <div className="grid-2">
          
          <div className="section-card" style={{ borderRadius: '2px' }}>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Richard</h3>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Master Brewer, Pepperpot Brewery</div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Operating from Bevendean Farm, Richard opened his doors to the BRAS for intensive brewing masterclasses and comprehensive tasting panels. He explicitly co-developed and commercialised the society&apos;s celebratory one-year milestone beer, &quot;BRAS Best Bitter&quot;.
            </p>
          </div>

          <div className="section-card" style={{ borderRadius: '2px' }}>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>360° Brewing Co</h3>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Brewing Collaborator, Sheffield Park</div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Based in East Sussex, the 360° team hosted BRAS for a hands-on brewery experience, collaborating on recipe formulation and dry-hopping. This partnership produced the festival cask ale, &quot;Full Circle Pale Ale&quot;.
            </p>
          </div>

          <div className="section-card" style={{ borderRadius: '2px' }}>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Jason</h3>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Brighton &amp; South Downs CAMRA Liaison</div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Jason provided consistent guidance from the Campaign for Real Ale (CAMRA), integrating student advocacy with the broader regional cask community. He frequently joined official socials to co-present awards and champion local pub preservation efforts.
            </p>
          </div>

        </div>
      </section>

      {/* Chronological Timeline Section — Flowing Infographic */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-heading)' }}>
            <HistoryIcon size={24} className="accent-text" /> Historical Timeline
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '16px' }}>
            A chronological account of the society&apos;s milestones, from inception to the present day.
          </p>
        </div>

        {/* Flowing timeline */}
        <div style={{ position: 'relative' }}>
          {/* Central timeline rail */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'linear-gradient(to bottom, var(--accent), var(--primary), var(--border))',
            borderRadius: '1px',
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {Array.from(grouped.entries()).map(([monthYear, monthPosts], groupIdx) => (
              <div key={monthYear} style={{ position: 'relative' }}>
                {/* Month-year marker */}
                <div style={{
                  position: 'relative',
                  paddingLeft: '52px',
                  paddingTop: groupIdx === 0 ? '0' : '32px',
                  paddingBottom: '16px',
                }}>
                  {/* Month marker dot */}
                  <div style={{
                    position: 'absolute',
                    left: '11px',
                    top: groupIdx === 0 ? '2px' : '34px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    border: '3px solid var(--surface)',
                    boxShadow: '0 0 0 2px var(--accent)',
                    zIndex: 3,
                  }} />
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {monthYear}
                  </span>
                </div>

                {/* Posts in this month */}
                {monthPosts.map((post, idx) => (
                  <div
                    key={post.date + idx}
                    style={{
                      position: 'relative',
                      paddingLeft: '52px',
                      paddingBottom: '24px',
                    }}
                  >
                    {/* Small timeline dot */}
                    <div style={{
                      position: 'absolute',
                      left: '15px',
                      top: '8px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--surface)',
                      border: '2px solid var(--primary)',
                      zIndex: 2,
                    }} />

                    {/* Connector arm */}
                    <div style={{
                      position: 'absolute',
                      left: '27px',
                      top: '13px',
                      width: '16px',
                      height: '1px',
                      backgroundColor: 'var(--border)',
                    }} />

                    {/* Content card */}
                    <div style={{
                      marginLeft: '4px',
                      padding: '16px 20px',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      transition: 'border-color 0.2s ease',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '10px',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'var(--text-color)',
                          fontFamily: 'var(--font-heading)',
                        }}>
                          {getTimelineLabel(post.date)}
                        </span>
                        <Link
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            fontWeight: 500,
                            textDecoration: 'none',
                            opacity: 0.7,
                          }}
                        >
                          <ExternalLink size={11} /> Source
                        </Link>
                      </div>

                      <p style={{
                        fontSize: '0.92rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.65',
                        margin: 0,
                        whiteSpace: 'pre-line',
                      }}>
                        {post.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {posts.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '52px' }}>Historical records are currently being compiled.</p>
            )}

            {/* Terminal dot */}
            {posts.length > 0 && (
              <div style={{ position: 'relative', paddingLeft: '52px', paddingTop: '8px' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '10px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--border)',
                  zIndex: 2,
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Present day
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
