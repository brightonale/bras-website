"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Beer, AlertTriangle } from 'lucide-react';

export default function RatePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberName, setMemberName] = useState('');

  // Rating states (loaded from active pint)
  const [pubName, setPubName] = useState('');
  const [beerName, setBeerName] = useState('');
  const [score, setScore] = useState('');
  const [dateString, setDateString] = useState('');

  interface ActivePint { pubName: string; beerName: string; breweryName?: string; dateString: string }

const [activePint, setActivePint] = useState<ActivePint | null>(null);
  const [activeLoaded, setActiveLoaded] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('bras_user_name');
    if (!user) {
      router.push('/login');
      return;
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(true);
     
    setMemberName(user);

    // Fetch active pint from committee
    fetch('/api/active-pint')
      .then(res => res.json())
      .then(data => {
        setActiveLoaded(true);
        if (data.activePint) {
          setActivePint(data.activePint);
          setPubName(data.activePint.pubName);
          setBeerName(data.activePint.beerName);
          setDateString(data.activePint.dateString);
        } else {
          setActivePint(null);
        }
      })
      .catch(err => {
        console.warn(err);
        setActiveLoaded(true);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubName) {
      setErrorMsg("No active pint selected.");
      return;
    }

    const parsedScore = parseFloat(score);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 10) {
      setErrorMsg("Please enter a valid score between 1 and 10.");
      return;
    }

    const finalScore = parseFloat(parsedScore.toFixed(2));

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
          score: finalScore,
          dateString
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit score");
      }

      setSuccessMsg(`Cheers! Your rating of ${finalScore.toFixed(2)}★ for ${pubName} has been logged.`);
      setScore('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
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

  return (
    <div className="page-container animate-fade-in" style={{ alignItems: 'center' }}>

      {/* Page Header */}
      <div className="page-header" style={{ textAlign: 'center' }}>
        <span className="page-header__eyebrow">Member</span>
        <h1 className="page-header__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Beer size={32} className="accent-text" /> Member Rating Log
        </h1>
        <p className="page-header__subtitle">
          Logging score as: <strong style={{ color: 'var(--text-color)' }}>{memberName}</strong>
        </p>
      </div>

      <div className="section-card" style={{ width: '100%', maxWidth: '500px' }}>

        {!activeLoaded ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading active Social pint details...</p>
          </div>
        ) : successMsg ? (
          <div style={{ textAlign: 'center' }}>
            <div className="notice notice--success" style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>{successMsg}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn--outline btn--sm" onClick={() => router.push('/leaderboard')}>
                View Leaderboards
              </button>
            </div>
          </div>
        ) : !activePint ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--warning-text)' }}>
              <AlertTriangle size={48} />
            </div>
            <h2 className="section-card__title" style={{ textAlign: 'center', borderBottom: 'none', marginBottom: '12px', padding: 0 }}>
              No Active Pint Set
            </h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, marginBottom: '24px', fontSize: '0.95rem' }}>
              The committee has not activated a pint for scoring yet. Please check back during the Social when the committee starts a round!
            </p>
            <button className="btn btn--outline btn--sm" onClick={() => router.push('/')}>
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Active Pint Card */}
            <div style={{ 
              background: 'var(--surface-muted)', 
              border: '1px solid var(--border)',
              borderRadius: '6px', 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div>
                <span className="form-label" style={{ marginBottom: '2px', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pub</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>{pubName}</span>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <span className="form-label" style={{ marginBottom: '2px', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cask Pint</span>
                  <span style={{ fontWeight: 600 }}>{beerName || 'Cask Ale'}</span>
                </div>
                {activePint?.breweryName && (
                  <div style={{ flex: 1 }}>
                    <span className="form-label" style={{ marginBottom: '2px', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Brewery</span>
                    <span style={{ fontWeight: 600 }}>{activePint.breweryName}</span>
                  </div>
                )}
              </div>
              <div>
                <span className="form-label" style={{ marginBottom: '2px', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date of Social</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{dateString}</span>
              </div>
            </div>

            {/* Rating Score Input */}
            <div>
              <label className="form-label" style={{ marginBottom: '6px' }}>Score (/10)</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.01"
                placeholder="e.g. 7.45"
                value={score}
                onChange={e => setScore(e.target.value)}
                style={{ width: '100%', fontSize: '1.25rem', padding: '12px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                <span>1.0 = Undrinkable</span>
                <span>10.0 = Nectar</span>
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
