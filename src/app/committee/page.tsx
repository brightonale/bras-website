"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import checklistData from '@/data/checklist.json';
import { Beer, Gamepad2, Newspaper, Compass, Ban, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CommitteePage() {
  const router = useRouter();
  const [isCommittee, setIsCommittee] = useState(false);
  const [memberName, setMemberName] = useState('');
  
  // Wordle Settings Form
  const [wordleWord, setWordleWord] = useState('');
  const [wordleHint, setWordleHint] = useState('');

  // Add Pub Form (Simplified)
  const [pubName, setPubName] = useState('');
  const [pintName, setPintName] = useState('');
  const [breweryName, setBreweryName] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Custom HTML Form
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [customPages, setCustomPages] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Checklist & DB details
  const unvisitedPubs = checklistData.filter(p => p.status === 'Not Visited');

  useEffect(() => {
    const name = localStorage.getItem('bras_user_name');
    const role = localStorage.getItem('bras_user_role');

    if (!name || role !== 'committee') {
      setIsCommittee(false);
    } else {
      setIsCommittee(true);
      setMemberName(name);

      // Pre-fill today's date for pub visit logging
      const today = new Date();
      setEventDate(today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));

      // Fetch Wordle config & custom pages list
      fetchWordleConfig();
      fetchCustomPages();
    }
  }, []);

  const fetchWordleConfig = async () => {
    try {
      const res = await fetch('/api/wordle');
      const data = await res.json();
      if (data.word) setWordleWord(data.word);
      if (data.hint) setWordleHint(data.hint);
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchCustomPages = async () => {
    try {
      const res = await fetch('/api/committee/custom-html');
      const data = await res.json();
      if (data.pages) {
        setCustomPages(data.pages);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateWordle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wordleWord.trim().length !== 5) {
      setErrorMsg("Wordle word must be exactly 5 letters.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/committee/wordle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: wordleWord.trim(),
          hint: wordleHint.trim(),
          role: "committee"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update Wordle");

      setSuccessMsg("Wordle target word and hint updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName.trim()) {
      setErrorMsg("Pub name is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/committee/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pubName: pubName.trim(),
          pintName: pintName.trim(),
          breweryName: breweryName.trim(),
          dateString: eventDate.trim(),
          role: "committee"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log pub");

      setSuccessMsg(`Successfully logged visit to ${pubName}!`);
      // reset form
      setPubName('');
      setPintName('');
      setBreweryName('');
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishHtml = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim() || !pageSlug.trim() || !htmlContent.trim()) {
      setErrorMsg("All HTML uploader fields are required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/committee/custom-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageTitle.trim(),
          slug: pageSlug.trim(),
          htmlContent: htmlContent.trim(),
          role: "committee"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish page");

      setSuccessMsg(`Published page: /custom/${data.page.slug}`);
      setPageTitle('');
      setPageSlug('');
      setHtmlContent('');
      fetchCustomPages();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCommittee) {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', marginTop: '40px' }}>
        <div className="section-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--error-text)' }}><Ban size={48} /></div>
          <h2 className="section-card__title" style={{ marginTop: '12px', marginBottom: '8px', borderBottom: 'none' }}>
            Committee Access Denied
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
            This panel is restricted to Brighton Real Ale Society Committee members only. Please log in with the committee password to access these features.
          </p>
          <Link href="/login">
            <button className="btn btn--primary">Go to Login</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      
      {/* Page Header */}
      <div className="page-header">
        <span className="page-header__eyebrow">BRAS Committee Panel</span>
        <h1 className="page-header__title">Society Operations Dashboard</h1>
        <p className="page-header__subtitle">
          Welcome back, <strong>{memberName}</strong>. Manage crawls, update Wordle, publish custom newsletters, and view our unvisited checklist.
        </p>
      </div>

      {/* Success/Error Toasts */}
      {successMsg && (
        <div className="notice notice--success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="notice notice--error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} /> {errorMsg}
        </div>
      )}

      {/* Grid of Ops Panels */}
      <div className="grid-2">
        
        {/* Panel 1: Log visited pub */}
        <div className="section-card">
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Beer size={20} /> Log Visited Pub</h2>
          <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Pub Name</label>
              <input type="text" value={pubName} onChange={e => setPubName(e.target.value)} placeholder="e.g. Fiddler's Elbow" required />
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Cask Pint / Drink Name</label>
                <input type="text" value={pintName} onChange={e => setPintName(e.target.value)} placeholder="e.g. Sussex Best" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Brewery</label>
                <input type="text" value={breweryName} onChange={e => setBreweryName(e.target.value)} placeholder="e.g. Harvey's" />
              </div>
            </div>

            <div>
              <label className="form-label">Date of Visit</label>
              <input type="text" value={eventDate} onChange={e => setEventDate(e.target.value)} placeholder="e.g. 18 Dec 2025" />
            </div>

            <button type="submit" className="btn btn--primary" disabled={isLoading} style={{ marginTop: '8px' }}>
              {isLoading ? "Logging..." : "Log Visited Pub"}
            </button>
          </form>
        </div>

        {/* Panel 2: Configure Wordle */}
        <div className="section-card">
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Gamepad2 size={20} /> Daily Wordle Target</h2>
          <form onSubmit={handleUpdateWordle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Target Word (Exactly 5 letters)</label>
              <input 
                type="text" 
                maxLength={5} 
                value={wordleWord} 
                onChange={e => setWordleWord(e.target.value.toUpperCase())}
                placeholder="MALTY" 
                required 
                style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 'bold' }}
              />
            </div>
            
            <div>
              <label className="form-label">Hint Text</label>
              <textarea 
                value={wordleHint} 
                onChange={e => setWordleHint(e.target.value)}
                placeholder="Describes an ale with a sweet, biscuit-like flavor..."
                rows={3}
              />
            </div>

            <button type="submit" className="btn btn--accent" disabled={isLoading} style={{ marginTop: '8px' }}>
              {isLoading ? "Updating..." : "Update Wordle Config"}
            </button>
          </form>
        </div>

        {/* Panel 3: HTML Page Publisher */}
        <div className="section-card">
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Newspaper size={20} /> Newsletter Publisher</h2>
          <form onSubmit={handlePublishHtml} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Page Title</label>
              <input type="text" value={pageTitle} onChange={e => setPageTitle(e.target.value)} placeholder="e.g. S3 Michaelmas Term Wrap-up" required />
            </div>

            <div>
              <label className="form-label">URL Slug (alphanumeric and dashes only)</label>
              <input type="text" value={pageSlug} onChange={e => setPageSlug(e.target.value)} placeholder="e.g. term-wrapup" required />
            </div>

            <div>
              <label className="form-label">Paste raw HTML content</label>
              <textarea 
                value={htmlContent} 
                onChange={e => setHtmlContent(e.target.value)}
                placeholder="<h1>Term Wrap up</h1><p>We drank a lot of Sussex Best...</p>"
                rows={6}
                required
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>

            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? "Publishing..." : "Publish Custom HTML Page"}
            </button>
          </form>

          {/* List of custom pages */}
          {customPages.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px 0' }}>Live Custom Pages:</h4>
              <ul style={{ paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', listStyle: 'none' }}>
                {customPages.map(page => (
                  <li key={page.slug} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span className="badge badge--muted">/custom/{page.slug}</span>
                    <Link href={`/custom/${page.slug}`} target="_blank" style={{ textDecoration: 'underline', color: 'var(--primary)', fontWeight: 'bold' }}>
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Panel 4: Unvisited Pub Research List */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '580px', padding: 0 }}>
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 32px 16px', margin: 0, position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 5, borderRadius: 'var(--card-radius) var(--card-radius) 0 0' }}>
            <Compass size={20} /> Unvisited Pubs ({unvisitedPubs.length})
          </h2>
          <div style={{ padding: '0 32px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
              Pubs from our target list we have not crawled yet. James' notes included.
            </p>

            {unvisitedPubs.map(pub => (
              <div key={pub.name} style={{ 
                padding: '12px 16px', 
                background: 'var(--surface-muted)', 
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{pub.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--warning-text)', fontStyle: 'italic', fontWeight: 500 }}>
                  {pub.comment ? `James' Notes: "${pub.comment}"` : "No notes logged."}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
