"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import timelineData from '@/data/timeline.json';
import checklistData from '@/data/checklist.json';
import { Beer, CheckCircle, AlertTriangle } from 'lucide-react';

export default function RatePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberName, setMemberName] = useState('');

  // Rating states
  const [pubName, setPubName] = useState('');
  const [beerName, setBeerName] = useState('');
  const [score, setScore] = useState(6.0);
  const [dateString, setDateString] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Get latest pub from timeline for pre-filling
  const latestEvent = timelineData.length > 0 ? timelineData[timelineData.length - 1] : null;
  const defaultPub = latestEvent ? latestEvent.pub : "The Evening Star";

  useEffect(() => {
    const user = localStorage.getItem('bras_user_name');
    if (!user) {
      router.push('/login');
    } else {
      setIsLoggedIn(true);
      setMemberName(user);
      setPubName(defaultPub);

      // Get today's date formatted like "29 Oct 2025"
      const today = new Date();
      const formatted = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      setDateString(formatted);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName.trim()) {
      setErrorMsg("Please select or enter a pub name.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName,
          pubName: pubName.trim(),
          beerName: beerName.trim(),
          score,
          dateString
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit score");
      }

      setSuccessMsg(`Cheers! Your rating of ${score}★ for ${pubName} has been logged.`);
      setBeerName('');
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to login...</p>
      </div>
    );
  }

  // List of unique visited and unvisited pubs for dropdown
  const checklistPubs = checklistData.map(p => p.name).sort();

  return (
    <div className="page-container animate-fade-in" style={{ alignItems: 'center' }}>

      {/* Page Header */}
      <div className="page-header" style={{ textAlign: 'center' }}>
        <span className="page-header__eyebrow">Pint Inspector</span>
        <h1 className="page-header__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Beer size={32} className="accent-text" /> Pint Inspector Log
        </h1>
        <p className="page-header__subtitle">
          Logging score as: <strong style={{ color: 'var(--text-color)' }}>{memberName}</strong>
        </p>
      </div>

      <div className="section-card" style={{ width: '100%', maxWidth: '500px' }}>

        {successMsg ? (
          <div style={{ textAlign: 'center' }}>
            <div className="notice notice--success" style={{ marginBottom: '20px' }}>
              <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <CheckCircle size={32} color="var(--success-text)" />
              </span>
              <p style={{ fontWeight: 'bold' }}>{successMsg}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn--primary btn--sm" onClick={() => setSuccessMsg(null)}>
                Log Another Pub
              </button>
              <button className="btn btn--outline btn--sm" onClick={() => router.push('/leaderboard')}>
                View Leaderboards
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Pub Name */}
            <div>
              <label className="form-label">Pub Name</label>
              <input
                type="text"
                list="pubs-list"
                value={pubName}
                onChange={e => setPubName(e.target.value)}
                placeholder="e.g. The Evening Star"
              />
              <datalist id="pubs-list">
                {checklistPubs.map(p => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            {/* Beer Tasted */}
            <div>
              <label className="form-label">Cask Beer Name (Optional)</label>
              <input
                type="text"
                value={beerName}
                onChange={e => setBeerName(e.target.value)}
                placeholder="e.g. Sussex Best"
              />
            </div>

            {/* Date */}
            <div>
              <label className="form-label">Date of Visit</label>
              <input
                type="text"
                value={dateString}
                onChange={e => setDateString(e.target.value)}
                placeholder="e.g. 18 Dec 2025"
              />
            </div>

            {/* Rating Score Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Score (/10)</label>
                <span style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
                  {score.toFixed(2)}★
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.05"
                value={score}
                onChange={e => setScore(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>1.0 (Undrinkable)</span>
                <span>5.0 (Average)</span>
                <span>10.0 (Nectar)</span>
              </div>
            </div>

            {/* Error Notice */}
            {errorMsg && (
              <div className="notice notice--error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn--primary btn--lg btn--full"
              disabled={isLoading}
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? "Submitting Log..." : "Submit Rating"}
            </button>

          </form>
        )}
      </div>

    </div>
  );
}
