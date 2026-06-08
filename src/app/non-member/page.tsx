import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export const metadata = {
  title: 'Members Only - Brighton Real Ale Society',
  description: 'This area is restricted to BRAS members.',
};

export default function NonMemberPage() {
  return (
    <div className="page-container animate-fade-in" style={{ padding: '80px 20px', alignItems: 'center' }}>
      <div className="section-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
          <Lock size={64} />
        </div>
        
        <h1 className="section-card__title" style={{ borderBottom: 'none', fontSize: '2rem', marginBottom: '16px', paddingBottom: 0 }}>
          Members Only
        </h1>
        
        <div style={{ 
          background: 'var(--surface-muted)', 
          padding: '24px', 
          borderRadius: '8px', 
          border: '1px solid var(--border)',
          marginBottom: '32px'
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
            You are seeing this page because you are a <strong>user</strong> of the website, but not a <strong>member</strong>.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '16px 0 0 0', fontWeight: 500 }}>
            Please ask a committee member to make you a member at the next social!
          </p>
        </div>

        <Link href="/">
          <button className="btn btn--primary">
            Return to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
}
