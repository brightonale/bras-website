"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Beer, AlertTriangle, CheckCircle, UserCheck, Star } from 'lucide-react';

interface ActivePint {
  pubName: string;
  beerName: string;
  breweryName?: string;
  dateString: string;
}

const SCORE_PRESETS = [5.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

export default function RatePage() {
  const router = useRouter();
  const [memberName, setMemberName] = useState('');
  const [hasExistingName, setHasExistingName] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [isSamePersonUpdating, setIsSamePersonUpdating] = useState(false);

  // Rating states (loaded from active pint)
  const [pubName, setPubName] = useState('');
  const [beerName, setBeerName] = useState('');
  const [score, setScore] = useState('');
  const [dateString, setDateString] = useState('');

  const [activePint, setActivePint] = useState<ActivePint | null>(null);
  const [activeLoaded, setActiveLoaded] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

  // Load existing user name from local storage or cookie (no redirect to login)
  useEffect(() => {
    try {
      let storedName = localStorage.getItem('bras_voting_name') || localStorage.getItem('bras_user_name');
      if (!storedName || !storedName.trim()) {
        const match = document.cookie.match(/(?:^|;\s*)(?:bras_voting_name|bras_user_name)=([^;]*)/);
        if (match && match[1]) {
          storedName = decodeURIComponent(match[1]);
        }
      }
      if (storedName && storedName.trim()) {
        setMemberName(storedName.trim());
        setHasExistingName(true);
      }
    } catch {
      // Ignore localStorage access issues in restrictive environments
    }

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
        console.warn("Failed to load active pint", err);
        setActiveLoaded(true);
      });
  }, []);

  // Check if voter already has an active score once voterName and pint are known
  const checkPreviousScore = useCallback(async (voter: string) => {
    const clean = voter.trim();
    if (clean.length < 2) {
      setPreviousScore(null);
      setAlreadyVoted(false);
      setIsSamePersonUpdating(false);
      return;
    }
    try {
      const res = await fetch(`/api/rate?voterName=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.existingRating) {
        setPreviousScore(data.existingRating.score);
        setAlreadyVoted(true);
      } else {
        setPreviousScore(null);
        setAlreadyVoted(false);
        setIsSamePersonUpdating(false);
      }
    } catch {
      // Non-critical background lookup
    }
  }, []);

  useEffect(() => {
    if (!memberName.trim() || !activePint) {
      setAlreadyVoted(false);
      setIsSamePersonUpdating(false);
      return;
    }
    const timer = setTimeout(() => {
      checkPreviousScore(memberName);
    }, 350);
    return () => clearTimeout(timer);
  }, [memberName, activePint, checkPreviousScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = memberName.trim();
    if (!cleanName) {
      setErrorMsg("Please enter your name to log your rating.");
      return;
    }

    if (!pubName) {
      setErrorMsg("No active pint selected.");
      return;
    }

    if (alreadyVoted && !isSamePersonUpdating) {
      setErrorMsg(`This person (${cleanName}) has already voted this week. Please enter a different name (e.g. ${cleanName} W. or ${cleanName} 2).`);
      return;
    }

    const parsedScore = parseFloat(score);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 10) {
      setErrorMsg("Please enter a valid score between 1.00 and 10.00.");
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
          memberName: cleanName,
          pubName: pubName.trim(),
          beerName: beerName.trim(),
          score: finalScore,
          dateString,
          confirmUpdate: isSamePersonUpdating
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit score");
      }

      // Persist name in localStorage and cookies for future ratings
      try {
        localStorage.setItem('bras_user_name', cleanName);
        localStorage.setItem('bras_voting_name', cleanName);
        const oneYear = 60 * 60 * 24 * 365;
        document.cookie = `bras_user_name=${encodeURIComponent(cleanName)}; path=/; max-age=${oneYear}; SameSite=Lax`;
        document.cookie = `bras_voting_name=${encodeURIComponent(cleanName)}; path=/; max-age=${oneYear}; SameSite=Lax`;
      } catch {
        // Ignore cookie/storage errors
      }

      setHasExistingName(true);
      setPreviousScore(finalScore);
      setAlreadyVoted(true);
      setIsSamePersonUpdating(true);

      const isUpdate = data.rating?.updated;
      setSuccessMsg(
        isUpdate
          ? `Score updated! Your new rating of ${finalScore.toFixed(2)}★ for ${pubName} has been recorded.`
          : `Cheers, ${cleanName}! Your rating of ${finalScore.toFixed(2)}★ for ${pubName} has been logged.`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ alignItems: 'center' }}>

      {/* Page Header */}
      <div className="page-header" style={{ textAlign: 'center', width: '100%', maxWidth: '540px' }}>
        <span className="page-header__eyebrow">BRAS Live Scoring</span>
        <h1 className="page-header__title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Beer size={32} className="accent-text" /> Rate Tonight&apos;s Pint
        </h1>
        <p className="page-header__subtitle" style={{ margin: '0 auto' }}>
          No password needed. Enter your name, select your score, and tap submit to add your vote to the society record.
        </p>
      </div>

      <div className="section-card" style={{ width: '100%', maxWidth: '520px', boxSizing: 'border-box' }}>

        {!activeLoaded ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '16px' }}>
            <div className="beer-loader" style={{ scale: 0.8 }}>
              <div className="beer-loader__glass">
                <div className="beer-loader__liquid" />
              </div>
              <div className="beer-loader__handle" />
            </div>
            <div className="beer-loader__text" style={{ fontSize: '0.9rem' }}>Loading active Social pint details...</div>
          </div>
        ) : successMsg ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div className="notice notice--success" style={{ marginBottom: '24px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', fontSize: '1rem' }}>Vote Submitted!</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)' }}>{successMsg}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setSuccessMsg(null)}
              >
                Change My Score
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => router.push('/leaderboard')}
              >
                View Leaderboards
              </button>
            </div>
          </div>
        ) : !activePint ? (
          <div className="empty-state" style={{ border: 'none', background: 'transparent', padding: '20px 0', margin: '0', textAlign: 'center' }}>
            <AlertTriangle className="empty-state__icon" size={48} style={{ color: 'var(--warning-text)', margin: '0 auto 16px' }} />
            <h3 className="empty-state__title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Active Pint Set</h3>
            <p className="empty-state__description" style={{ marginBottom: '24px', maxWidth: '380px', marginInline: 'auto' }}>
              The committee has not activated a pint for scoring right now. Please check back during the Social when the committee starts a round!
            </p>
            <button className="btn btn--outline btn--sm" onClick={() => router.push('/')}>
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Active Pint Card with responsive flex-wrap */}
            <div style={{ 
              background: 'var(--surface-muted)', 
              border: '1px solid var(--border)',
              borderRadius: '10px', 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              boxSizing: 'border-box'
            }}>
              <div>
                <span className="form-label" style={{ marginBottom: '2px', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  Tonight&apos;s Pub
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
                  {pubName}
                </span>
              </div>

              {/* Flex container wraps cleanly on small mobile viewports */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 140px', minWidth: '140px' }}>
                  <span className="form-label" style={{ marginBottom: '2px', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                    Cask Ale
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.98rem' }}>{beerName || 'Cask Ale'}</span>
                </div>
                {activePint?.breweryName && (
                  <div style={{ flex: '1 1 140px', minWidth: '140px' }}>
                    <span className="form-label" style={{ marginBottom: '2px', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                      Brewery
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.98rem' }}>{activePint.breweryName}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '2px', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  Social Date
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dateString}</span>
              </div>
            </div>

            {/* Voter Name Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Your Name / Nickname</label>
                {hasExistingName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={14} /> Saved on device
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMemberName('');
                        setPreviousScore(null);
                        setAlreadyVoted(false);
                        setIsSamePersonUpdating(false);
                        setHasExistingName(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Different Name
                    </button>
                  </div>
                )}
              </div>
              <input
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                placeholder="e.g. Harry, Emma, Oliver"
                value={memberName}
                onChange={e => {
                  setMemberName(e.target.value);
                  if (alreadyVoted) {
                    setAlreadyVoted(false);
                    setIsSamePersonUpdating(false);
                  }
                }}
                required
                style={{
                  width: '100%',
                  fontSize: '1rem',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  borderColor: (alreadyVoted && !isSamePersonUpdating) ? 'var(--accent)' : undefined
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                No password required. If someone shares your first name, add an initial (e.g. Harry W.) so your rating is separate.
              </span>
            </div>

            {/* Duplicate Name / Previous Rating Notice */}
            {alreadyVoted && (
              <div style={{
                background: 'var(--surface-warm)',
                border: '1px solid var(--accent)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 600, fontSize: '0.92rem' }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>This person has already voted this week!</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-color)', lineHeight: 1.45 }}>
                  A vote of <strong>{previousScore !== null ? `${previousScore.toFixed(2)}★` : ''}</strong> is already recorded for <strong>&ldquo;{memberName.trim()}&rdquo;</strong>.
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  If there&apos;s more than one {memberName.trim()} at the social, please <strong>enter a different name</strong> (such as <strong>{memberName.trim()} W.</strong> or <strong>{memberName.trim()} 2</strong>) so your vote is counted separately!
                </p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '2px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-color)' }}>
                    <input 
                      type="checkbox" 
                      checked={isSamePersonUpdating} 
                      onChange={e => {
                        const checked = e.target.checked;
                        setIsSamePersonUpdating(checked);
                        if (checked && previousScore !== null && !score) {
                          setScore(previousScore.toString());
                        }
                      }} 
                      style={{ accentColor: 'var(--accent)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>I am the original <strong>{memberName.trim()}</strong> and I want to update my rating</span>
                  </label>
                </div>
              </div>
            )}

            {/* Rating Score Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Score (/10)</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                  {score ? `${parseFloat(score || '0').toFixed(2)} ★` : 'Select score'}
                </span>
              </div>

              <input
                type="number"
                inputMode="decimal"
                min="1"
                max="10"
                step="0.01"
                placeholder="e.g. 7.45"
                value={score}
                onChange={e => setScore(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '1.4rem',
                  padding: '12px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'bold',
                  boxSizing: 'border-box'
                }}
                required
              />

              {/* Quick score buttons for comfortable mobile tap voting */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                {SCORE_PRESETS.map(preset => {
                  const isSelected = Math.abs(parseFloat(score || '0') - preset) < 0.001;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setScore(preset.toFixed(1))}
                      className="btn btn--outline"
                      style={{
                        flex: '1 1 calc(25% - 6px)',
                        minWidth: '48px',
                        padding: '8px 4px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        background: isSelected ? 'var(--accent-light)' : 'transparent',
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border)'
                      }}
                    >
                      {preset.toFixed(1)}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                <span>1.0 = Undrinkable</span>
                <span>5.0 = Average</span>
                <span>10.0 = Nectar</span>
              </div>
            </div>

            {/* Error Notice */}
            {errorMsg && (
              <div className="notice notice--error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn--primary btn--lg btn--full"
              disabled={isLoading || (alreadyVoted && !isSamePersonUpdating)}
              style={{
                cursor: (isLoading || (alreadyVoted && !isSamePersonUpdating)) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                opacity: (alreadyVoted && !isSamePersonUpdating) ? 0.65 : 1
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  <span>Submitting Vote...</span>
                </>
              ) : alreadyVoted ? (
                isSamePersonUpdating ? `Update Rating for ${memberName.trim()}` : "Enter a Different Name to Vote"
              ) : (
                "Submit Rating"
              )}
            </button>

          </form>
        )}
      </div>

    </div>
  );
}
