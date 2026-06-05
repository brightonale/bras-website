"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CustomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // Fetch the list of pages from the uploader list API
    // Wait, let's fetch the uploader list or fetch /api/events which has all dynamic data
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        // Wait, the events endpoint doesn't return the full HTML of customPages (it only returns metadata)
        // Let's create an endpoint /api/custom?slug=... or load it directly here since we can read db.json
        // Wait! We can create an API endpoint /api/custom/route.ts that receives a GET request with a slug and returns the custom page details including HTML!
        // Let's call /api/custom?slug=slug
        fetch(`/api/custom?slug=${slug}`)
          .then(r => r.json())
          .then(pageData => {
            if (pageData.page) {
              setPage(pageData.page);
            }
            setIsLoading(false);
          })
          .catch(() => setIsLoading(false));
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
        <h2 style={{ fontFamily: 'var(--font-serif)' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Could not find custom newsletter or article at `/custom/{slug}`.
        </p>
        <Link href="/">
          <button className="glass-button" style={{ marginTop: '20px' }}>Back to Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* breadcrumb */}
      <div>
        <Link href="/" style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Back to Home
        </Link>
      </div>

      {/* Article Header Card */}
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '16px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>
          {page.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Published by BRAS Committee on <strong>{page.dateString}</strong>
        </p>
      </div>

      {/* Custom HTML Injected */}
      <div 
        className="glass-panel" 
        style={{ padding: '40px', background: '#ffffff', minHeight: '300px' }}
        dangerouslySetInnerHTML={{ __html: page.htmlContent }}
      />

    </div>
  );
}
