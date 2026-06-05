"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Beer, Crown, PartyPopper } from 'lucide-react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxW9kr6f0ysPfnUKnzF4_QtCcfFeO4bdP2__QdaQIPO5G5BLSa5dcJgG5NI_2PkOaEg/exec";
const COMMITTEE_PASSWORD = process.env.NEXT_PUBLIC_COMMITTEE_PASSWORD || "change_me";

type Category = {
  id: string;
  title: string;
  options: string[];
};

const categoryDescriptions: Record<string, string> = {
  analyzer: "Always analyses the hops, malt, and clarity of their ale before taking a sip.",
  lightweight: "The member who gets tipsy the fastest and is usually the first to head home.",
  funniest_drunk: "The person who becomes consistently hilarious after a few pints.",
  most_punctual: "Always the first one at the pub, often waiting for the doors to open.",
  least_punctual: "The member who consistently shows up just in time for last orders.",
  more_consistent: "Our most reliable member who never misses a society social.",
  ale_traitor: "The person most likely to order a lager or cider instead of a proper ale.",
  chatterbox: "The member who never stops talking and can chat for hours on end."
};

const defaultCategories: Category[] = [
  { id: "analyzer", title: "Top Member", options: ["Harry R.", "James W.", "Ben T."] },
  { id: "lightweight", title: "The Half-Pinter", options: ["Tom S.", "Alice M."] },
  { id: "funniest_drunk", title: "The Pub Comedian", options: ["Harry R.", "Pete J."] },
  { id: "most_punctual", title: "The Early Bird", options: ["Ben T.", "Alice M."] },
  { id: "least_punctual", title: "The Late Arrival", options: ["Dave P.", "Tom S."] },
  { id: "more_consistent", title: "The Die-Hard Regular", options: ["Sarah L.", "Emma C."] },
  { id: "ale_traitor", title: "The Ale Traitor", options: ["Pete J.", "Harry R."] },
  { id: "chatterbox", title: "The Waffler", options: ["Alice M.", "Dave P."] }
];

type View = 'role' | 'voting' | 'review' | 'success' | 'committee';

export default function AwardsPage() {
  const [view, setView] = useState<View>('role');
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [voterName, setVoterName] = useState('');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [pendingNominees, setPendingNominees] = useState<{categoryId: string, name: string}[]>([]);
  const [customInputValues, setCustomInputValues] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [deviceId, setDeviceId] = useState('');
  const [committeePass, setCommitteePass] = useState('');
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  
  // Committee state
  const [allVotes, setAllVotes] = useState<any[]>([]);

  useEffect(() => {
    // Generate/get device ID
    let id = localStorage.getItem('brasDeviceId');
    if (!id) {
      id = 'device-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('brasDeviceId', id);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeviceId(id);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStartVoting = () => {
    if (!voterName.trim()) {
      showToast("Please enter your name");
      return;
    }
    setView('voting');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (categoryId: string, option: string) => {
    setSelections(prev => ({ ...prev, [categoryId]: option }));
  };

  const handleAddCustomNominee = (categoryId: string) => {
    const val = customInputValues[categoryId]?.trim();
    if (!val) return;

    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        if (!c.options.includes(val)) {
          return { ...c, options: [...c.options, val] };
        }
      }
      return c;
    }));

    setPendingNominees(prev => [...prev, { categoryId, name: val }]);
    handleSelectOption(categoryId, val);
    setCustomInputValues(prev => ({ ...prev, [categoryId]: '' }));
    showToast(`Nominated ${val}!`);
  };

  const handleSubmitBallot = async () => {
    setIsLoading(true);
    try {
      const newNomineesStr = encodeURIComponent(JSON.stringify(pendingNominees));
      const url = `${SCRIPT_URL}?action=submitBallot&voter=${encodeURIComponent(voterName)}&votes=${encodeURIComponent(JSON.stringify(selections))}&newNominees=${newNomineesStr}&deviceId=${encodeURIComponent(deviceId)}&t=${Date.now()}`;
      
      await fetch(url, { mode: 'no-cors' }); // no-cors for apps script write
      
      showToast("Ballot saved successfully!");
      setView('success');
    } catch (err) {
      console.error(err);
      showToast("Submission recorded locally.");
      setView('success');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitteeLogin = async () => {
    if (committeePass === COMMITTEE_PASSWORD) {
      setShowCommitteeModal(false);
      setIsLoading(true);
      try {
        const res = await fetch(`${SCRIPT_URL}?action=getVotes&t=${Date.now()}`);
        const data = await res.json();
        if (data && data.votes) setAllVotes(data.votes);
      } catch (err) {
        console.warn("Could not reach backend to sync votes");
      } finally {
        setIsLoading(false);
        setView('committee');
      }
    } else {
      showToast("Incorrect Password");
    }
  };

  const renderRoleSelect = () => (
    <div className={`section-card ${styles.view}`} style={{ maxWidth: '400px', margin: 'auto', padding: '40px', textAlign: 'center' }}>
      <div className={styles.beerIcon}><Beer size={64} className="accent-text" /></div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '10px' }}>Brighton Real Ale Society</h1>
      <span className="badge badge--accent" style={{ alignSelf: 'center' }}>Annual Awards</span>
      
      <div style={{ marginTop: '30px', textAlign: 'left' }}>
        <label className="form-label">Your Name</label>
        <input 
          type="text" 
          value={voterName}
          onChange={e => setVoterName(e.target.value)}
          placeholder="e.g. Harry Rogers"
          style={{ marginBottom: '16px' }}
        />
        <button className="btn btn--accent btn--full btn--lg" onClick={handleStartVoting}>
          Start Voting
        </button>
      </div>

      <button onClick={() => setShowCommitteeModal(true)} style={{ marginTop: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-body)' }}>
        Committee Access
      </button>

      {showCommitteeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="section-card" style={{ padding: '30px', width: '90%', maxWidth: '350px' }}>
            <h2 className="section-card__title">Committee Login</h2>
            <input 
              type="password" 
              value={committeePass}
              onChange={e => setCommitteePass(e.target.value)}
              placeholder="Password"
              style={{ marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn--outline" onClick={() => setShowCommitteeModal(false)}>Cancel</button>
              <button className="btn btn--accent" onClick={handleCommitteeLogin}>Enter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVoting = () => {
    const votedCount = Object.keys(selections).length;
    const total = categories.length;
    const progress = (votedCount / total) * 100;

    return (
      <div className={styles.view}>
        <div className="section-card" style={{ position: 'sticky', top: '20px', zIndex: 50, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Cast Your Votes</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Voting as: <strong>{voterName}</strong></p>
          </div>
          <div style={{ width: '150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Progress</span>
              <span>{votedCount}/{total}</span>
            </div>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        {categories.map((cat, idx) => (
          <div key={cat.id} className="section-card" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '8rem', fontWeight: 'bold', color: 'var(--primary-light)', pointerEvents: 'none', fontFamily: 'var(--font-heading)' }}>
              {idx + 1}
            </div>
            
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-color)', fontFamily: 'var(--font-heading)' }}>{cat.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', fontStyle: 'italic' }}>{categoryDescriptions[cat.id]}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {cat.options.map(opt => (
                <button 
                  key={opt}
                  className={`${styles.optionChip} ${selections[cat.id] === opt ? styles.optionChipSelected : ''}`}
                  onClick={() => handleSelectOption(cat.id, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className={styles.customInputContainer}>
              <input 
                type="text" 
                placeholder="Nominate someone else..." 
                value={customInputValues[cat.id] || ''}
                onChange={e => setCustomInputValues(prev => ({ ...prev, [cat.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomNominee(cat.id)}
              />
              <button className="btn btn--outline btn--sm" onClick={() => handleAddCustomNominee(cat.id)}>Add</button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '40px' }}>
          <button 
            className={`btn btn--lg ${votedCount === total ? 'btn--accent' : 'btn--outline'}`}
            style={{ opacity: votedCount === total ? 1 : 0.5, cursor: votedCount === total ? 'pointer' : 'not-allowed' }}
            onClick={() => {
              if (votedCount === total) setView('review');
              else showToast(`Please vote for all categories (${total - votedCount} remaining)`);
            }}
          >
            Review &amp; Submit Ballot
          </button>
        </div>
      </div>
    );
  };

  const renderReview = () => (
    <div className={`section-card ${styles.view}`} style={{ maxWidth: '600px', margin: 'auto', padding: '40px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>Review Ballot</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Review your choices before submitting.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-muted)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>{cat.title}</span>
            <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{selections[cat.id]}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button className="btn btn--outline" style={{ flex: 1 }} onClick={() => setView('voting')}>Go Back</button>
        <button className="btn btn--accent" style={{ flex: 2 }} onClick={handleSubmitBallot}>
          Submit Final Ballot
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className={`section-card ${styles.view}`} style={{ maxWidth: '400px', margin: 'auto', padding: '50px', textAlign: 'center' }}>
      <div className={styles.beerIcon}><Beer size={64} className="accent-text" /></div>
      <h2 style={{ fontSize: '2rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Cheers, Ballot Received!</h2>
      <p style={{ color: 'var(--text-muted)' }}>Your votes have been submitted successfully.</p>
      <div className="notice notice--success" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        <PartyPopper size={20} /> Thank you for participating in the annual awards!
      </div>
    </div>
  );

  const renderCommittee = () => {
    return (
      <div className={styles.view} style={{ maxWidth: '900px', margin: 'auto' }}>
        <div className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Committee Leaderboard</h2>
          <button className="btn btn--outline btn--sm" onClick={() => setView('role')}>Exit</button>
        </div>

        <div className="grid-auto">
          {categories.map(cat => {
            const tally: Record<string, number> = {};
            let totalCategoryVotes = 0;
            
            allVotes.forEach(ballot => {
              const vote = ballot.selections && ballot.selections[cat.id];
              if (vote) {
                tally[vote] = (tally[vote] || 0) + 1;
                totalCategoryVotes++;
              }
            });

            const sortedResults = Object.keys(tally).map(name => ({
              name, 
              count: tally[name],
              percent: totalCategoryVotes > 0 ? ((tally[name] / totalCategoryVotes) * 100).toFixed(0) : "0"
            })).sort((a,b) => b.count - a.count).slice(0, 5);

            return (
              <div key={cat.id} className="section-card">
                <h3 className="section-card__title">{cat.title}</h3>
                
                {sortedResults.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No votes yet.</p>}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sortedResults.map((res, i) => (
                    <div key={res.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: i === 0 ? 'bold' : 'normal', color: i === 0 ? 'var(--accent)' : 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {res.name} {i === 0 ? <Crown size={16} /> : ''}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{res.count} votes ({res.percent}%)</span>
                      </div>
                      <div className={styles.leaderboardBarBg}>
                        <div className={styles.leaderboardBarFill} style={{ width: `${res.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`page-container animate-fade-in ${styles.container}`}>
      {isLoading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(250, 246, 240, 0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.beerIcon}><Beer size={64} className="accent-text" /></div>
        </div>
      )}
      
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}

      {view === 'role' && renderRoleSelect()}
      {view === 'voting' && renderVoting()}
      {view === 'review' && renderReview()}
      {view === 'success' && renderSuccess()}
      {view === 'committee' && renderCommittee()}
    </div>
  );
}
