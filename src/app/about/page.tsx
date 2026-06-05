export const metadata = {
  title: 'About BRAS | Brighton Real Ale Society',
  description: 'Learn about the Brighton Real Ale Society.',
};

import { Beer } from 'lucide-react';

export default function About() {
  return (
    <div className="page-container animate-fade-in">

      {/* Page Header */}
      <div className="page-header">
        <span className="page-header__eyebrow">Our Society</span>
        <h1 className="page-header__title">About the Society</h1>
        <p className="page-header__subtitle">
          Everything you need to know about Brighton&apos;s most discerning group of members.
        </p>
      </div>

      {/* Main Content */}
      <div className="section-card" style={{ maxWidth: '800px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p>
            The Brighton Real Ale Society (BRAS) is the official University of Brighton student society deeply aligned with the Campaign for Real Ale (CAMRA) philosophy. We are dedicated to exploring, preserving, and championing the vibrant, traditional pub culture of Brighton and Hove.
          </p>
          <p>
            At our core, we believe in the superiority of traditional, living, cask-conditioned ale over mass-produced, artificially carbonated keg beers. Rather than just going out for drinks, the society adds a layer of structure and camaraderie to our outings. We rate the quality of the pubs, the atmosphere, and the cellar-craft of the beer itself. By supporting independent breweries and historic public houses, we aim to ensure that real ale continues to thrive for generations of students to come.
          </p>
        </div>
      </div>

      {/* Activities Card */}
      <div className="section-card" style={{ maxWidth: '800px' }}>
        <h3 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Beer size={24} /> Our Core Activities
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span className="badge badge--accent" style={{ marginTop: '3px', flexShrink: 0 }}>01</span>
            <div>
              <strong style={{ color: 'var(--text-color)', fontFamily: 'var(--font-heading)' }}>Pub Socials &amp; Tastings</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Visiting independent pubs (like The Evening Star) to sample real, cask-conditioned ales.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span className="badge badge--accent" style={{ marginTop: '3px', flexShrink: 0 }}>02</span>
            <div>
              <strong style={{ color: 'var(--text-color)', fontFamily: 'var(--font-heading)' }}>Rating &amp; Reviewing</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Scoring pubs out of 5 stars across Ale Quality, Atmosphere, Pricing, and Selection.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <span className="badge badge--accent" style={{ marginTop: '3px', flexShrink: 0 }}>03</span>
            <div>
              <strong style={{ color: 'var(--text-color)', fontFamily: 'var(--font-heading)' }}>Banter &amp; Accountability</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Observing the behavior of society members and awarding funny superlatives at the end of the year to hold each other accountable (e.g., catching someone drinking a lager and labeling them &ldquo;The Ale Traitor&rdquo;).
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
