import React from 'react';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { 
  History as HistoryIcon, 
  Users, 
  Building2, 
  Image as ImageIcon, 
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

function parseCaptions(): CaptionPost[] {
  const filePath = path.join(process.cwd(), 'src/data/captions.md');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
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
}

export default async function HistoryPage() {
  const posts = parseCaptions();

  // Helper to format date in formal British format
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.split(' ')[0]);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ gap: '48px' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '24px' }}>
        <span className="page-header__eyebrow">Archives &amp; Directory</span>
        <h1 className="page-header__title">Society History &amp; Directory</h1>
        <p className="page-header__subtitle">
          The people behind the pints. A chronological record of the society's activities, key figures, and industry partners since our foundation.
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
        <h2 style={{ fontSize: '1.75rem', paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-heading)' }}>
          <Users size={24} className="accent-text" /> Key Figures &amp; Committee
        </h2>
        
        {/* We use a formal list-based layout rather than heavy image cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="section-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderRadius: '2px' }}>
            <div style={{ flexShrink: 0, width: '120px', height: '120px', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <ImageIcon size={32} color="var(--text-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>James Graham</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Founding President (2023–2025)</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                James was the driving force behind the initial 20 months of the BRAS. He established the standard operating protocol of weekly pub reviews, systematically assigning ratings to local cask ales. Under his leadership, the club transitioned from a small circle of friends into an accredited society featured in local media and regional CAMRA press. He formally signed off as executive head in June 2025.
              </p>
            </div>
          </div>

          <div className="section-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderRadius: '2px' }}>
            <div style={{ flexShrink: 0, width: '120px', height: '120px', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <ImageIcon size={32} color="var(--text-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Max</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Socials &amp; Media Officer (2024–2026)</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Max served as the creative lead, transforming the society's visual outreach. He was responsible for designing promotional materials, managing weekly social announcements, and coordinating venue outreach across Brighton. His artistic and logistical efforts kept the local community informed and actively growing.
              </p>
            </div>
          </div>

          <div className="section-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderRadius: '2px' }}>
            <div style={{ flexShrink: 0, width: '120px', height: '120px', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <ImageIcon size={32} color="var(--text-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Harry</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Vice President &amp; IT Officer (2025–2026)</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Harry was a core figure in establishing the society's digital presence and scaling operations. He handled the society's tech infrastructure alongside taking charge of the BRAS wordle and custom web solutions.
              </p>
            </div>
          </div>

          <div className="section-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderRadius: '2px' }}>
            <div style={{ flexShrink: 0, width: '120px', height: '120px', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <ImageIcon size={32} color="var(--text-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Albie Gullis</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Society President (2025–2026)</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Albie assumed executive management of the BRAS in June 2025 following the transition of the founding committee. Tasked with scaling the society's presence, Albie has driven a massive expansion into multi-society collaborative events and targeted regional pub crawls.
              </p>
            </div>
          </div>

          <div className="section-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderRadius: '2px' }}>
            <div style={{ flexShrink: 0, width: '120px', height: '120px', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <ImageIcon size={32} color="var(--text-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Takara</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Society President (2026–Present)</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Takara stepped up as President in 2026, leading the next generation of real ale enthusiasts and continuing the BRAS legacy of celebrating quality cask conditioned beer across Brighton and Sussex.
              </p>
            </div>
          </div>

          <div className="section-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderRadius: '2px' }}>
            <div style={{ flexShrink: 0, width: '120px', height: '120px', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <ImageIcon size={32} color="var(--text-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Harrison</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Finance Director (2026–Present)</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Harrison took over the financial architecture in 2026, regulating ticket sales, balancing the books, and ensuring the society's commercial operations run smoothly.
              </p>
            </div>
          </div>

          <div className="section-card" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderRadius: '2px' }}>
            <div style={{ flexShrink: 0, width: '120px', height: '120px', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '2px' }}>
              <ImageIcon size={32} color="var(--text-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>Luke</h3>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Socials Design (2023–2024)</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Luke was an integral part of the foundational 2023/24 executive committee. He handled initial graphic layouts and coordinated weekly meetups. Luke secured a permanent place in society legend in June 2024 when he was officially presented with a custom, personalised pint glass to mark his dedicated service.
              </p>
            </div>
          </div>

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
              Operating from Bevendean Farm, Richard opened his doors to the BRAS for intensive brewing masterclasses and comprehensive tasting panels. He explicitly co-developed and commercialised the society's celebratory one-year milestone beer, "BRAS Best Bitter".
            </p>
          </div>

          <div className="section-card" style={{ borderRadius: '2px' }}>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginBottom: '4px' }}>360° Brewing Co</h3>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Brewing Collaborator, Sheffield Park</div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Based in East Sussex, the 360° team hosted BRAS for a hands-on brewery experience, collaborating on recipe formulation and dry-hopping. This partnership produced the festival cask ale, "Full Circle Pale Ale".
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

      {/* Chronological Timeline Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-heading)' }}>
            <HistoryIcon size={24} className="accent-text" /> Historical Timeline
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '16px' }}>
            A chronological account of the society's milestones, from inception to the present day.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingLeft: '16px', borderLeft: '2px solid var(--border)' }}>
          {posts.map((post, idx) => (
            <div key={post.date + idx} style={{ position: 'relative', paddingLeft: '24px' }}>
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '-31px', /* 24px padding + 2px border / 2 */
                top: '6px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-warm)',
                border: '2px solid var(--primary)',
                zIndex: 2
              }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', fontFamily: 'var(--font-heading)' }}>
                    {formatDate(post.date)}
                  </span>
                  <Link 
                    href={post.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    <ExternalLink size={14} /> Source Entry
                  </Link>
                </div>
                
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {/* Instagram Image Embed */}
                  <div style={{ 
                    width: '280px', 
                    height: '280px', 
                    backgroundColor: 'var(--surface-muted)', 
                    border: '1px solid var(--border)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {post.url.includes('instagram.com') ? (
                      <img 
                        src={`/api/proxy-image?url=${encodeURIComponent(post.url + 'media/?size=l')}`} 
                        alt="Instagram Image Placeholder" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : null}
                    <div style={{ 
                      display: post.url.includes('instagram.com') ? 'none' : 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: 'var(--text-light)',
                      gap: '8px'
                    }}>
                      <ImageIcon size={32} />
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image Placeholder</span>
                    </div>
                  </div>

                  {/* Caption Content */}
                  <div style={{ 
                    flex: 1,
                    minWidth: '280px',
                    fontSize: '1rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: '1.7', 
                    whiteSpace: 'pre-line'
                  }}>
                    {post.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '24px' }}>Historical records are currently being compiled.</p>
          )}
        </div>
      </section>

    </div>
  );
}
