"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Beer, Gamepad2, Newspaper, Compass, Ban, CheckCircle, AlertTriangle, Users, Play, Square, Camera, RotateCw, Trash2, Star } from 'lucide-react';

interface ActiveVoteItem {
  id: string;
  voterName: string;
  userId: string;
  score: number;
  pubName: string;
  createdAt: string;
}

interface ActiveVotesState {
  activePint: {
    id: string;
    pubName: string;
    beerName: string;
    breweryName: string;
    dateString: string;
  } | null;
  totalVotes: number;
  averageScore: number | null;
  votes: ActiveVoteItem[];
}

export default function CommitteeClient({ initialPubs }: { initialPubs: { name: string; status: string; comment?: string | null }[] }) {
  const router = useRouter();
  const [isCommittee, setIsCommittee] = useState(false);
  const [memberName, setMemberName] = useState('');
  
  // Active Pint Settings Form
  const [activePubName, setActivePubName] = useState('');
  const [activeBeerName, setActiveBeerName] = useState('');
  const [activeBreweryName, setActiveBreweryName] = useState('');
  const [activeDateString, setActiveDateString] = useState('');
  const [currentActivePint, setCurrentActivePint] = useState<{ pubName: string; beerName: string; breweryName: string; dateString: string } | null>(null);

  // Active Pint Live Votes
  const [activeVotes, setActiveVotes] = useState<ActiveVotesState | null>(null);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);
  const [deletingVoteId, setDeletingVoteId] = useState<string | null>(null);

  // Feature Flags Form
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

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
  const [customPages, setCustomPages] = useState<{ slug: string; title: string }[]>([]);

  // User Management
  const [localUsers, setLocalUsers] = useState<Record<string, { votingName?: string; role: string }>>({});

  // Gallery Photo Manager
  const [gallerySocials, setGallerySocials] = useState<{ id: string; pubName: string; date: string; beerName: string | null; coverPhotoUrl: string | null }[]>([]);
  const [selectedGallerySocialId, setSelectedGallerySocialId] = useState('');
  const [galleryCoverUrl, setGalleryCoverUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // List of unique checklist pubs for datalist dropdowns
  const checklistPubs = initialPubs.map(p => p.name).sort();
  const unvisitedPubs = initialPubs.filter(p => p.status === 'Not Visited');

  useEffect(() => {
    const name = localStorage.getItem('bras_user_name');
    const role = localStorage.getItem('bras_user_role');

    if (!name || role !== 'committee') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCommittee(false);
    } else {
       
      setIsCommittee(true);
       
      setMemberName(name);

      // Pre-fill today's date for forms
      const today = new Date();
      const todayStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      setEventDate(todayStr);
      setActiveDateString(todayStr);

      // Fetch Wordle config & custom pages list & active pint & settings
      fetchActivePint();
      fetchWordleConfig();
      fetchCustomPages();
      fetchSettings();

      fetchUsers();
      fetchGallerySocials();
      fetchActiveVotes();
    }
  }, []);

  // Live polling for active votes while committee panel is open and pint is active
  useEffect(() => {
    if (!isCommittee || !currentActivePint) return;
    const interval = setInterval(() => {
      fetchActiveVotes();
    }, 10000);
    return () => clearInterval(interval);
  }, [isCommittee, currentActivePint]);

  async function fetchActiveVotes() {
    setIsLoadingVotes(true);
    try {
      const res = await fetch('/api/committee/active-votes');
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveVotes(data);
      }
    } catch (e) {
      console.warn("Could not fetch active votes", e);
    } finally {
      setIsLoadingVotes(false);
    }
  };

  async function handleDeleteVote(voteId: string, voterName: string) {
    if (!confirm(`Are you sure you want to remove the vote from "${voterName}"?`)) {
      return;
    }
    setDeletingVoteId(voteId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/committee/active-votes?id=${encodeURIComponent(voteId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove vote");

      setSuccessMsg(`Successfully removed vote from ${voterName}!`);
      await fetchActiveVotes();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to remove vote.");
    } finally {
      setDeletingVoteId(null);
    }
  };

  async function fetchUsers() {
    try {
      const res = await fetch('/api/committee/users');
      const data = await res.json();
      if (data.users) {
        setLocalUsers(data.users);
      }
    } catch (e) {
      console.warn("Could not fetch users", e);
    }
  };

  async function fetchActivePint() {
    try {
      const res = await fetch('/api/active-pint');
      const data = await res.json();
      if (data.activePint) {
        setCurrentActivePint(data.activePint);
        setActivePubName(data.activePint.pubName);
        setActiveBeerName(data.activePint.beerName);
        setActiveBreweryName(data.activePint.breweryName);
        setActiveDateString(data.activePint.dateString);
      }
    } catch (e) {
      console.warn("Could not fetch active pint", e);
    }
  };

  async function updateUserRole(username: string, newRole: string) {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/committee/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setSuccessMsg(`Successfully updated role for @${username} to ${newRole}!`);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update role.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePubStatus = async (pubName: string, status: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/committee/pubs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubName, status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update pub status");

      setSuccessMsg(`Marked ${pubName} as ${status}!`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update pub status");
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchWordleConfig() {
    try {
      const res = await fetch('/api/wordle');
      const data = await res.json();
      if (data.word) setWordleWord(data.word);
      if (data.hint) setWordleHint(data.hint);
    } catch (e) {
      console.warn(e);
    }
  };

  async function fetchCustomPages() {
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

  const handleSetActivePint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePubName.trim()) {
      setErrorMsg("Pub name is required to set an active pint.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/active-pint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pubName: activePubName.trim(),
          beerName: activeBeerName.trim(),
          breweryName: activeBreweryName.trim(),
          dateString: activeDateString.trim(),
          role: "committee"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set active pint");

      setCurrentActivePint(data.activePint);
      setSuccessMsg(`Social Pint active: ${data.activePint.beerName} at ${data.activePint.pubName}! Members can now log scores.`);
      fetchActiveVotes();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearActivePint = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/active-pint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pubName: "",
          role: "committee"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clear active pint");

      setCurrentActivePint(null);
      setActivePubName('');
      setActiveBeerName('');
      setActiveBreweryName('');
      const today = new Date();
      setActiveDateString(today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
      setSuccessMsg("Active scoring pint cleared!");
      fetchActiveVotes();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
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

  async function fetchSettings() {
    try {
      const res = await fetch('/api/committee/settings');
      const data = await res.json();
      if (data.features) {
        setFeatureFlags(data.features);
      }
    } catch (e) {
      console.warn("Could not fetch settings", e);
    }
  };

  async function fetchGallerySocials() {
    try {
      const res = await fetch('/api/committee/gallery?all=true');
      const data = await res.json();
      if (data.socials) {
        setGallerySocials(data.socials);
      }
    } catch (e) {
      console.warn('Could not fetch gallery socials', e);
    }
  }

  const handleSetCoverPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGallerySocialId) {
      setErrorMsg('Please select a social event.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/committee/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialId: selectedGallerySocialId,
          coverPhotoUrl: galleryCoverUrl.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update cover photo');

      setSuccessMsg(`Cover photo ${galleryCoverUrl.trim() ? 'set' : 'removed'} successfully!`);
      setGalleryCoverUrl('');
      setSelectedGallerySocialId('');
      fetchGallerySocials();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeature = async (featureName: string) => {
    const newFlags = { ...featureFlags, [featureName]: !featureFlags[featureName] };
    setFeatureFlags(newFlags);
    
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/committee/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: newFlags, role: "committee" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");
      setSuccessMsg(`Page layout settings updated successfully!`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update settings");
      // Revert on fail
      setFeatureFlags(featureFlags);
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
          Welcome back, <strong>{memberName}</strong>. Manage Socials, set active pints, update Wordle, and manage registered users.
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
        
        {/* Panel 1: Set Active Pint */}
        <div className="section-card">
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Beer size={20} /> Social Control (Active Pint)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', marginTop: '-8px' }}>
            Set the pint that society members are currently rating. Setting an active pint also records it as a Social event.
          </p>
          
          <form onSubmit={handleSetActivePint} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Pub Name</label>
              <input 
                type="text" 
                list="committee-active-pubs"
                value={activePubName} 
                onChange={e => setActivePubName(e.target.value)} 
                placeholder="e.g. Fiddler&apos;s Elbow" 
                required 
              />
              <datalist id="committee-active-pubs">
                {checklistPubs.map(p => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 180px', minWidth: '0' }}>
                <label className="form-label">Cask Pint / Drink Name</label>
                <input type="text" value={activeBeerName} onChange={e => setActiveBeerName(e.target.value)} placeholder="e.g. Sussex Best" />
              </div>
              <div style={{ flex: '1 1 180px', minWidth: '0' }}>
                <label className="form-label">Brewery</label>
                <input type="text" value={activeBreweryName} onChange={e => setActiveBreweryName(e.target.value)} placeholder="e.g. Harvey's" />
              </div>
            </div>

            <div>
              <label className="form-label">Date of Visit</label>
              <input type="text" value={activeDateString} onChange={e => setActiveDateString(e.target.value)} placeholder="e.g. 18 Dec 2025" />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn--primary" style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} disabled={isLoading}>
                <Play size={16} /> {currentActivePint ? "Update Active Pint" : "Start Scoring Pint"}
              </button>
              {currentActivePint && (
                <button type="button" onClick={handleClearActivePint} className="btn btn--outline" style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} disabled={isLoading}>
                  <Square size={16} /> Stop Scoring
                </button>
              )}
            </div>
          </form>

          {currentActivePint && (
            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--surface-muted)', border: '1px dashed var(--border)', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong>Currently Live:</strong> {currentActivePint.beerName} at <em>{currentActivePint.pubName}</em> ({currentActivePint.dateString})
            </div>
          )}
        </div>

        {/* Panel 2: Log visited pub (historical/manual override) */}
        <div className="section-card">
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Beer size={20} /> Log Visited Pub (Manual)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', marginTop: '-8px' }}>
            Manually log a Social event without forcing members to score it live.
          </p>
          <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Pub Name</label>
              <input 
                type="text" 
                list="committee-manual-pubs"
                value={pubName} 
                onChange={e => setPubName(e.target.value)} 
                placeholder="e.g. Fiddler&apos;s Elbow" 
                required 
              />
              <datalist id="committee-manual-pubs">
                {checklistPubs.map(p => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 180px', minWidth: '0' }}>
                <label className="form-label">Cask Pint / Drink Name</label>
                <input type="text" value={pintName} onChange={e => setPintName(e.target.value)} placeholder="e.g. Sussex Best" />
              </div>
              <div style={{ flex: '1 1 180px', minWidth: '0' }}>
                <label className="form-label">Brewery</label>
                <input type="text" value={breweryName} onChange={e => setBreweryName(e.target.value)} placeholder="e.g. Harvey's" />
              </div>
            </div>

            <div>
              <label className="form-label">Date of Visit</label>
              <input type="text" value={eventDate} onChange={e => setEventDate(e.target.value)} placeholder="e.g. 18 Dec 2025" />
            </div>

            <button type="submit" className="btn btn--outline" disabled={isLoading} style={{ marginTop: '8px' }}>
              {isLoading ? "Logging..." : "Log Manual Visit"}
            </button>
          </form>
        </div>

        {/* Panel: Active Pint Live Votes */}
        <div className="section-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Beer size={22} className="accent-text" />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
                Active Pint Live Votes
              </h2>
              {currentActivePint && (
                <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34D399', display: 'inline-block' }} />
                  Live Scoring Open
                </span>
              )}
            </div>
            
            <button
              type="button"
              onClick={fetchActiveVotes}
              disabled={isLoadingVotes}
              className="btn btn--outline btn--sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCw size={14} />
              {isLoadingVotes ? 'Refreshing...' : 'Refresh Votes'}
            </button>
          </div>

          {!currentActivePint ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <Beer size={40} style={{ opacity: 0.4, margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '1.05rem', margin: '0 0 6px 0', color: 'var(--text-color)' }}>
                No Pint Currently Live
              </p>
              <p style={{ fontSize: '0.88rem', margin: 0, maxWidth: '420px', marginInline: 'auto' }}>
                Set an active pint in the &quot;Social Control&quot; panel above to allow members and attendees to submit live scores at <code>/rate</code>.
              </p>
            </div>
          ) : (
            <div>
              {/* Summary Stats Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="stat-box" style={{ padding: '16px' }}>
                  <div className="stat-label">Active Round</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', marginTop: '4px', color: 'var(--text-color)', wordBreak: 'break-word' }}>
                    {currentActivePint.beerName || 'Cask Ale'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    @{currentActivePint.pubName}
                  </div>
                </div>

                <div className="stat-box" style={{ padding: '16px' }}>
                  <div className="stat-label">Total Votes</div>
                  <div className="stat-value">
                    {activeVotes?.totalVotes ?? 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {activeVotes?.totalVotes === 1 ? '1 vote logged' : `${activeVotes?.totalVotes ?? 0} votes logged`}
                  </div>
                </div>

                <div className="stat-box" style={{ padding: '16px' }}>
                  <div className="stat-label">Live Average Score</div>
                  <div className="stat-value" style={{ color: 'var(--accent)' }}>
                    {activeVotes?.averageScore !== null && activeVotes?.averageScore !== undefined
                      ? `${activeVotes.averageScore.toFixed(2)}★`
                      : '—'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Scale: 1.00 – 10.00
                  </div>
                </div>
              </div>

              {/* Votes List */}
              <h3 style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: '12px' }}>
                Votes Breakdown ({activeVotes?.votes?.length ?? 0})
              </h3>

              {(!activeVotes?.votes || activeVotes.votes.length === 0) ? (
                <div style={{ padding: '24px', background: 'var(--surface-muted)', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-color)' }}>No votes recorded yet for this active pint.</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Attendees can visit <strong>/rate</strong> on any phone to submit their score without needing a password.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeVotes.votes.map((vote) => {
                    const dateObj = new Date(vote.createdAt);
                    const formattedDate = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const isDeleting = deletingVoteId === vote.id;

                    return (
                      <div
                        key={vote.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                          padding: '12px 14px',
                          background: 'var(--surface-muted)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '140px', flex: '1 1 auto' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            flexShrink: 0
                          }}>
                            {vote.voterName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-color)' }}>
                              {vote.voterName}
                            </div>
                            {formattedDate && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                Logged at {formattedDate}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <span className="badge badge--accent" style={{ fontSize: '0.95rem', padding: '4px 12px', fontWeight: 'bold' }}>
                            {vote.score.toFixed(2)} ★
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteVote(vote.id, vote.voterName)}
                            disabled={isDeleting}
                            title={`Remove vote from ${vote.voterName}`}
                            className="btn btn--outline btn--sm"
                            style={{
                              borderColor: 'rgba(239, 68, 68, 0.4)',
                              color: 'var(--error-text)',
                              padding: '6px 10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              opacity: isDeleting ? 0.6 : 1
                            }}
                          >
                            <Trash2 size={14} /> {isDeleting ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel 3: Configure Wordle */}
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

        {/* Panel 4: HTML Page Publisher */}
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

        {/* Panel 5: Unvisited Pub Research List */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '580px', padding: 0 }}>
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: 'var(--card-padding) var(--card-padding) 16px', margin: 0, position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 5, borderRadius: 'var(--card-radius) var(--card-radius) 0 0' }}>
            <Compass size={20} /> Unvisited Pubs ({unvisitedPubs.length})
          </h2>
          <div style={{ padding: '0 var(--card-padding) var(--card-padding)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>
              Pubs from our target list we have not visited yet. James' notes included.
            </p>

            {unvisitedPubs.map(pub => (
              <div key={pub.name} style={{ 
                padding: '12px 16px', 
                background: 'var(--surface-muted)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{pub.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--warning-text)', fontStyle: 'italic', fontWeight: 500 }}>
                    {pub.comment ? `James' Notes: "${pub.comment}"` : "No notes logged."}
                  </p>
                </div>
                <button 
                  className="btn btn--outline btn--sm" 
                  onClick={() => handleUpdatePubStatus(pub.name, 'Visited')}
                  disabled={isLoading}
                >
                  Mark Visited
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 8: Gallery Photo Manager */}
        <div className="section-card">
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={20} /> Gallery Photo Manager</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', marginTop: '-8px' }}>
            Assign a cover photo URL (Google Drive link) to a social event. This photo will appear in the Gallery.
          </p>
          <form onSubmit={handleSetCoverPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Social Event</label>
              <select
                value={selectedGallerySocialId}
                onChange={e => {
                  setSelectedGallerySocialId(e.target.value);
                  // Pre-fill existing URL if the social already has one
                  const social = gallerySocials.find(s => s.id === e.target.value);
                  if (social?.coverPhotoUrl) {
                    setGalleryCoverUrl(social.coverPhotoUrl);
                  } else {
                    setGalleryCoverUrl('');
                  }
                }}
                className="form-input"
                required
              >
                <option value="">— Select a social —</option>
                {gallerySocials.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.pubName} — {s.date} {s.coverPhotoUrl ? '✓ (has photo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Cover Photo URL</label>
              <input
                type="url"
                value={galleryCoverUrl}
                onChange={e => setGalleryCoverUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
                Paste a direct image link or Google Drive shareable URL. Leave empty to remove the cover photo.
              </p>
            </div>

            <button type="submit" className="btn btn--accent" disabled={isLoading} style={{ marginTop: '8px' }}>
              {isLoading ? 'Saving...' : 'Set Cover Photo'}
            </button>
          </form>

          {/* Show socials that already have cover photos */}
          {gallerySocials.filter(s => s.coverPhotoUrl).length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 12px 0' }}>Gallery Entries:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                {gallerySocials.filter(s => s.coverPhotoUrl).map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--surface-muted)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <span className="badge badge--muted">{s.date}</span>
                    <span style={{ fontWeight: 600 }}>{s.pubName}</span>
                    {s.beerName && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>— {s.beerName}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel 6: User Management */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '580px', padding: 0, gridColumn: '1 / -1' }}>
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: 'var(--card-padding) var(--card-padding) 16px', margin: 0, position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 5, borderRadius: 'var(--card-radius) var(--card-radius) 0 0' }}>
            <Users size={20} /> User Allocations & Roles
          </h2>
          <div style={{ padding: '0 var(--card-padding) var(--card-padding)', overflowY: 'auto' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 24px 0' }}>
              Assign roles to registered accounts. <strong>Users</strong> are non-members with restricted access. <strong>Members</strong> have full gallery access. <strong>Committee</strong> have admin privileges.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '24px' }}>
              
              {/* Column 1: Committee */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '8px', margin: 0 }}>
                  Committee ({Object.values(localUsers).filter(u => u.role === 'committee').length})
                </h3>
                {Object.entries(localUsers).filter(([_, u]) => u.role === 'committee').map(([username, user]) => {
                  const isSelf = username === memberName.toLowerCase().replace(/\s+/g, '');
                  return (
                    <div key={username} style={{ padding: '12px', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{user.votingName || username}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-light)' }}>@{username}</p>
                      <select 
                        disabled={isSelf || isLoading}
                        value={user.role}
                        onChange={(e) => updateUserRole(username, e.target.value)}
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto' }}
                      >
                        <option value="committee">Committee</option>
                        <option value="member">Member</option>
                        <option value="user">User (Non-Member)</option>
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Column 2: Members */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '8px', margin: 0 }}>
                  Members ({Object.values(localUsers).filter(u => u.role === 'member').length})
                </h3>
                {Object.entries(localUsers).filter(([_, u]) => u.role === 'member').map(([username, user]) => (
                  <div key={username} style={{ padding: '12px', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{user.votingName || username}</h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-light)' }}>@{username}</p>
                    <select 
                      disabled={isLoading}
                      value={user.role}
                      onChange={(e) => updateUserRole(username, e.target.value)}
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto' }}
                    >
                      <option value="committee">Committee</option>
                      <option value="member">Member</option>
                      <option value="user">User (Non-Member)</option>
                    </select>
                  </div>
                ))}
              </div>

              {/* Column 3: Users */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '2px dashed var(--border)', paddingBottom: '8px', margin: 0, color: 'var(--text-muted)' }}>
                  Users ({Object.values(localUsers).filter(u => u.role === 'user').length})
                </h3>
                {Object.entries(localUsers).filter(([_, u]) => u.role === 'user').map(([username, user]) => (
                  <div key={username} style={{ padding: '12px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: '8px', opacity: 0.8 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{user.votingName || username}</h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-light)' }}>@{username}</p>
                    <select 
                      disabled={isLoading}
                      value={user.role}
                      onChange={(e) => updateUserRole(username, e.target.value)}
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto' }}
                    >
                      <option value="committee">Committee</option>
                      <option value="member">Member</option>
                      <option value="user">User (Non-Member)</option>
                    </select>
                  </div>
                ))}
              </div>

            </div>

            {Object.keys(localUsers).length === 0 && (
               <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '16px' }}>No registered users found.</p>
            )}
          </div>
        </div>

        {/* Panel 7: Feature Flags (Page Layout Toggles) */}
        <div className="section-card">
          <h2 className="section-card__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Square size={20} /> Page Layout Settings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', marginTop: '-8px' }}>
            Enable or disable specific pages/sections across the entire website.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(featureFlags).length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Loading settings...</p>}
            {Object.entries(featureFlags).map(([key, value]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={value as boolean} 
                  onChange={() => handleToggleFeature(key)} 
                  disabled={isLoading}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{key} Page</span>
              </label>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
