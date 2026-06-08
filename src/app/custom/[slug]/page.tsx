"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

export default function CustomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/custom?slug=${slug}`)
      .then(r => r.json())
      .then(pageData => {
        if (pageData.page) {
          setPage(pageData.page);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading custom page...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Could not find custom newsletter or article at `/custom/{slug}`.
        </p>
        <Link href="/">
          <button className="btn btn--outline" style={{ marginTop: '20px' }}>Back to Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* breadcrumb */}
      <div>
        <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Back to Home
        </Link>
      </div>

      {/* Article Header Card */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
          {page.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Published by BRAS Committee on <strong>{page.dateString}</strong>
        </p>
      </div>

      {/* Custom HTML Injected */}
      {/* Sanitized to prevent stored XSS */}
      <div 
        className="section-card" 
        style={{ padding: '40px', minHeight: '300px' }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.htmlContent) }}
      />

    </div>
  );
}
