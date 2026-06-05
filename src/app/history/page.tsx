import React from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { 
  History as HistoryIcon, 
  Users, 
  Building2, 
  Camera, 
  ExternalLink, 
  Calendar, 
  Trophy, 
  HeartHandshake, 
  Clock 
} from 'lucide-react';

interface CaptionPost {
  date: string;
  url: string;
  content: string;
}

function parseCaptions(): CaptionPost[] {
  const filePath = path.join(process.cwd(), 'src/data/captions.md');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Split by "---" separator
  const sections = fileContent.split('\n---\n');
  const posts: CaptionPost[] = [];

  for (const sec of sections) {
    const lines = sec.trim().split('\n');
    if (lines.length < 2) continue;

    // Line 0 should be e.g. "### [2025-09-29 20:12:00+00:00](https://www.instagram.com/p/DPMvjNniNBA/)"
    const headerLine = lines[0].trim();
    const match = headerLine.match(/###\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (!match) continue;

    const dateStr = match[1];
    const url = match[2];
    
    // Join remaining lines as content
    const content = lines.slice(1).join('\n').trim();

    posts.push({ date: dateStr, url, content });
  }

  // Sort posts by date descending
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export default async function HistoryPage() {
  const posts = parseCaptions();

  // Helper to format date cleanly
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.split(' ')[0]);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ gap: '32px' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <span className="page-header__eyebrow">Archives</span>
        <h1 className="page-header__title">Society History &amp; Directory</h1>
        <p className="page-header__subtitle">
          The People Behind the Pints · Chronological records, key figures, and industry partners.
        </p>
      </div>

      {/* Overview Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HistoryIcon size={22} className="accent-text" /> Society Overview
        </h2>
        <div className="section-card" style={{ borderLeft: '5px solid var(--accent)' }}>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '24px', color: 'var(--text-color)' }}>
            The Brighton Real Ale Society (BRAS) is a university-rooted student and alumni collective dedicated to discovering, rating, and celebrating exceptional cask conditioned beers throughout Sussex. Founded in November 2023, our mission spans beyond casual socializing; we actively support independent local breweries, run certified charity pub quizzes, and participate in direct collaborative brewing operations.
          </p>
          <div className="grid-3" style={{ gap: '16px' }}>
            <div className="stat-box">
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '8px' }}>
                <Clock size={24} />
              </div>
              <div className="stat-value">20+ Mos</div>
              <div className="stat-label">Active History</div>
            </div>
            <div className="stat-box">
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '8px' }}>
                <Trophy size={24} />
              </div>
              <div className="stat-value">8.6 / 10</div>
              <div className="stat-label">Highest Rated Ale</div>
            </div>
            <div className="stat-box">
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '8px' }}>
                <HeartHandshake size={24} />
              </div>
              <div className="stat-value">£400+</div>
              <div className="stat-label">Raised for Charity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Committee Directory Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={22} className="accent-text" /> Key Figures &amp; Committee
        </h2>
        <div className="grid-3" style={{ gap: '24px' }}>
          
          {/* Member 1: James Graham */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--surface-muted)' }}>
              <img 
                src="/assets/photos/photo-1.jpg" 
                alt="James Graham" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>James Graham</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Founding President (2023–2025)
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                James was the driving force behind the initial 20 months of the BRAS. He established the standard operating protocol of weekly pub reviews, systematically assigning ratings to local cask ales. Under his leadership, the club transitioned from a small circle of friends into an accredited society featured in local media and regional CAMRA press. He formally signed off as executive head in June 2025.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="badge badge--primary">Founder</span>
                <span className="badge badge--muted">Alumni</span>
                <span className="badge badge--muted">Logistics</span>
              </div>
            </div>
          </div>

          {/* Member 2: Max */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--surface-muted)' }}>
              <img 
                src="/assets/photos/photo-2.jpg" 
                alt="Max" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Max</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Socials &amp; Media Officer (2024–2025)
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Max served as the creative lead for the 2024/25 academic year, transforming the society's visual outreach. He was responsible for designing promotional materials, managing weekly social announcements, and coordinating venue outreach across Brighton. His artistic and logistical efforts kept the local community informed and actively growing.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="badge badge--primary">Committee 24/25</span>
                <span className="badge badge--muted">Design</span>
                <span className="badge badge--muted">Social Media</span>
              </div>
            </div>
          </div>

          {/* Member 3: Albie */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--surface-muted)' }}>
              <img 
                src="/assets/photos/photo-3.jpg" 
                alt="Albie Gullis" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Albie Gullis</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Society President (2025–Present)
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Albie assumed executive management of the BRAS in June 2025 following the transition of the founding committee. Tasked with scaling the society's presence, Albie has driven a massive expansion into multi-society collaborative events and targeted regional pub crawls.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="badge badge--primary">Executive Head</span>
                <span className="badge badge--accent">Current Committee</span>
                <span className="badge badge--muted">Campaigns</span>
              </div>
            </div>
          </div>

          {/* Member 4: Sidney */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--surface-muted)' }}>
              <img 
                src="/assets/photos/photo-4.jpg" 
                alt="Sidney" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Sidney</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Finance Director (2024–2025)
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Sidney managed the society’s financial architecture during its breakout 2024/25 operational year. From regulating ticket sales for historic charity fundraisers to authorizing accounts for collaborative commercial brewing batches, Sidney kept the society's books perfectly balanced.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="badge badge--primary">Treasury</span>
                <span className="badge badge--muted">Committee 24/25</span>
                <span className="badge badge--muted">Accounts</span>
              </div>
            </div>
          </div>

          {/* Member 5: Luke */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--surface-muted)' }}>
              <img 
                src="/assets/photos/photo-5.jpg" 
                alt="Luke" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Luke</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Socials Design (2023–2024)
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                Luke was an integral part of the foundational 2023/24 executive committee. He handled initial graphic layouts and coordinated weekly meetups. Luke secured a permanent place in society legend in June 2024 when he was officially presented with a custom, personalized pint glass to mark his dedicated service.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="badge badge--primary">Founding Team</span>
                <span className="badge badge--muted">Media</span>
                <span className="badge badge--accent">Glass Recipient</span>
              </div>
            </div>
          </div>

          {/* Member 6: Jackson & Kelvin */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: '240px', width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-muted)', color: 'var(--text-light)', position: 'relative' }}>
              <Users size={48} strokeWidth={1.5} className="accent-text" />
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Jackson &amp; Kelvin</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Core Course Mates &amp; Support Network
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                As dedicated engineering course mates and close peers, Jackson and Kelvin form a crucial backbone of long-term community support within the wider group. Their steady presence at flagship socials and major milestones has provided continuous support since the society's foundational years.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="badge badge--primary">Core Circle</span>
                <span className="badge badge--muted">Engineering Peers</span>
                <span className="badge badge--muted">Event Support</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Key Collaborators Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={22} className="accent-text" /> Key Industry Partners
        </h2>
        <div className="grid-2" style={{ gap: '24px' }}>
          
          {/* Richard */}
          <div className="section-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ padding: '16px', borderRadius: '6px', backgroundColor: 'var(--surface-muted)', color: 'var(--primary)' }}>
              <Building2 size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Richard</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Master Brewer, Pepperpot Brewery
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Operating from Bevendean Farm, Richard opened his doors to the BRAS for intensive brewing masterclasses and comprehensive tasting panels. He explicitly co-developed and commercialized the society's celebratory one-year milestone beer, "BRAS Best Bitter".
              </p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <span className="badge badge--primary">Brewing Partner</span>
                <span className="badge badge--muted">Technical Advisor</span>
              </div>
            </div>
          </div>

          {/* Jason */}
          <div className="section-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ padding: '16px', borderRadius: '6px', backgroundColor: 'var(--surface-muted)', color: 'var(--primary)' }}>
              <Users size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Jason</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Brighton &amp; South Downs CAMRA Liaison
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Jason provided consistent guidance from the Campaign for Real Ale (CAMRA), integrating student advocacy with the broader regional cask community. He frequently joined official socials to co-present awards and champion local pub preservation efforts.
              </p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <span className="badge badge--primary">CAMRA Liaison</span>
                <span className="badge badge--muted">Industry Advisor</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Instagram Archives Timeline Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={22} className="accent-text" /> Instagram Archive Feed
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '-8px', marginBottom: '8px' }}>
          Historical announcements and social updates transcribed from the society&apos;s official Instagram handle.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--border)' }}>
          {posts.map((post, index) => (
            <div key={post.date + index} className="section-card" style={{ position: 'relative', padding: '20px' }}>
              
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '-27px',
                top: '24px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                border: '3px solid var(--bg-color)',
                zIndex: 2
              }} />

              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--surface-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <Calendar size={16} /> {formatDate(post.date)}
                </div>
                <Link 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: '4px', background: 'transparent' }}
                  className="btn--hover-primary"
                >
                  <ExternalLink size={12} /> Instagram Post
                </Link>
              </div>

              {/* Card content */}
              <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {post.content}
              </p>
            </div>
          ))}

          {posts.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No Instagram posts logged in the archive.</p>
          )}
        </div>
      </section>

    </div>
  );
}
