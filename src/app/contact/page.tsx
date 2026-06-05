import React from 'react';

export const metadata = {
  title: 'Contact | Brighton Real Ale Society',
  description: 'Get in touch with the Brighton Real Ale Society.',
};

export default function Contact() {
  return (
    <div className="page-container animate-fade-in">

      {/* Page Header */}
      <div className="page-header">
        <span className="page-header__eyebrow">Get in touch</span>
        <h1 className="page-header__title">Contact Us</h1>
        <p className="page-header__subtitle">
          Have a pub recommendation or want to join the society? Let us know.
        </p>
      </div>

      <div className="section-card" style={{ maxWidth: '600px' }}>
        <h2 className="section-card__title">Send a Pigeon</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          We don't actually use pigeons, but you can reach the committee via email.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="form-label">Email Address</label>
            <div style={{ 
              background: 'var(--surface-muted)', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              fontWeight: 600,
              color: 'var(--primary)'
            }}>
              brightonrealalesocietybras@gmail.com
            </div>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>What to include:</h4>
            <ul style={{ color: 'var(--text-muted)', paddingLeft: '20px', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Your name and (if applicable) your society rank.</li>
              <li>Which pub you think we should inspect next.</li>
              <li>Any feedback on our website or Wordle game.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
