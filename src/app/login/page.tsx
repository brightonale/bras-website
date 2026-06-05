"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import membersData from '../../data/members.json';
import { Lock, Sparkles, Key, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

type LocalUser = {
  password?: string;
  role: string;
  mustChange?: boolean;
  votingName?: string;
};

const DEFAULT_COMMITTEE = ["Harry", "Max", "James G", "Albie", "Takara", "Harrison"];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'create'>('login');
  const [step, setStep] = useState<'auth' | 'change_password' | 'claim_name'>('auth');
  const [isCommitteeMode, setIsCommitteeMode] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedVotingName, setSelectedVotingName] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Alphabetically sort member names
  const sortedMembers = [...membersData].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    // Detect committee mode from URL query parameters
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('committee') === 'true') {
        setIsCommitteeMode(true);
        setTab('login');
      }
    }

    // If already logged in, redirect
    const user = localStorage.getItem('bras_user_name');
    if (user && step !== 'change_password' && step !== 'claim_name') {
      router.push('/');
    }
    
    // Initialize or migrate local DB
    const SCHEMA_VERSION = '2';
    const currentVersion = localStorage.getItem('bras_db_version');
    let db: Record<string, LocalUser> = {};
    
    try {
      db = JSON.parse(localStorage.getItem('bras_users') || '{}');
    } catch { db = {}; }
    
    // Deduplicate keys (migrate old CamelCase keys to lowercase)
    Object.keys(db).forEach(key => {
      const lowerKey = key.toLowerCase().replace(/\s+/g, '');
      if (key !== lowerKey) {
        if (!db[lowerKey]) {
          db[lowerKey] = db[key];
        }
        delete db[key];
      }
    });
    
    // Always ensure committee defaults exist and have committee role
    DEFAULT_COMMITTEE.forEach(name => {
      const usernameKey = name.toLowerCase().replace(/\s+/g, '');
      if (!db[usernameKey]) {
        // New committee member — seed them
        db[usernameKey] = { 
          password: 'BRAS2026!', 
          role: 'committee', 
          mustChange: true,
          votingName: name 
        };
      }
      // Ensure votingName is set
      if (!db[usernameKey].votingName) {
        db[usernameKey].votingName = name;
      }
    });

    // Make EVERYONE a committee member as per user request
    Object.keys(db).forEach(key => {
      if (db[key].role !== 'committee') {
        db[key].role = 'committee';
      }
    });
    
    localStorage.setItem('bras_users', JSON.stringify(db));
    
    if (currentVersion !== SCHEMA_VERSION) {
      localStorage.setItem('bras_db_version', SCHEMA_VERSION);
    }
  }, [step, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Please enter username and password.");
      return;
    }
    setIsLoading(true);
    
    const db = JSON.parse(localStorage.getItem('bras_users') || '{}');
    const userKey = username.toLowerCase().trim();
    const user = db[userKey];
    
    setTimeout(() => {
      setIsLoading(false);
      
      const isLegacyCommittee = password === (process.env.NEXT_PUBLIC_COMMITTEE_PASSWORD || "change_me");
      const isLegacyMember = password === (process.env.NEXT_PUBLIC_MEMBER_PASSWORD || "change_me_member");
      
      if (user) {
        if (user.password !== password) {
          setErrorMsg("Incorrect password.");
          return;
        }
        
        if (user.mustChange) {
          setStep('change_password');
          setErrorMsg(null);
          return;
        }

        if (!user.votingName) {
          setStep('claim_name');
          setErrorMsg(null);
          return;
        }
        
        loginSuccess(user.votingName, user.role);
      } else if (isLegacyCommittee) {
        loginSuccess(username, 'committee');
      } else if (isLegacyMember) {
        loginSuccess(username, 'member');
      } else {
        setErrorMsg("Account not found or incorrect password. Try 'Create Account'.");
      }
    }, 600);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Please choose a username and password.");
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      const db = JSON.parse(localStorage.getItem('bras_users') || '{}');
      const userKey = username.toLowerCase().trim();
      
      if (db[userKey]) {
        setErrorMsg("This username is already taken. Please choose another.");
        return;
      }
      
      db[userKey] = { password, role: 'committee', mustChange: false };
      localStorage.setItem('bras_users', JSON.stringify(db));
      
      setStep('claim_name');
      setErrorMsg(null);
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const db = JSON.parse(localStorage.getItem('bras_users') || '{}');
      const userKey = username.toLowerCase().trim();
      
      if (db[userKey]) {
        db[userKey].password = newPassword;
        db[userKey].mustChange = false;
        localStorage.setItem('bras_users', JSON.stringify(db));
      }
      
      setIsLoading(false);
      
      if (!db[userKey].votingName) {
        setStep('claim_name');
        setErrorMsg(null);
      } else {
        loginSuccess(db[userKey].votingName, db[userKey].role);
      }
    }, 600);
  };

  const handleClaimName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVotingName) {
      setErrorMsg("Please select your voting name.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const db = JSON.parse(localStorage.getItem('bras_users') || '{}');
      const userKey = username.toLowerCase().trim();
      
      if (db[userKey]) {
        db[userKey].votingName = selectedVotingName;
        localStorage.setItem('bras_users', JSON.stringify(db));
      }
      
      setIsLoading(false);
      loginSuccess(selectedVotingName, db[userKey]?.role || 'member');
    }, 600);
  };

  const loginSuccess = (name: string, role: string) => {
    localStorage.setItem('bras_user_name', name);
    localStorage.setItem('bras_user_role', role);
    router.push('/');
    router.refresh();
  };

  if (step === 'change_password') {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '40px' }}>
        <div className="section-card" style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}>
              <Lock size={40} />
            </span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '8px' }}>Update Password</h1>
            <p style={{ color: 'var(--text-muted)' }}>Welcome Committee Member! Please set a secure password.</p>
          </div>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            {errorMsg && (
              <div className="notice notice--error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> {errorMsg}
              </div>
            )}
            <button type="submit" className="btn btn--primary btn--full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'claim_name') {
    return (
      <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '40px' }}>
        <div className="section-card" style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}>
              <Sparkles size={40} />
            </span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '8px' }}>Claim Your Name</h1>
            <p style={{ color: 'var(--text-muted)' }}>Link your account to your past voting history.</p>
          </div>
          <form onSubmit={handleClaimName} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="form-label">Select Voting Name</label>
              <select value={selectedVotingName} onChange={e => setSelectedVotingName(e.target.value)}>
                <option value="">-- Choose Name --</option>
                {sortedMembers.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            {errorMsg && (
              <div className="notice notice--error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> {errorMsg}
              </div>
            )}
            <button type="submit" className="btn btn--primary btn--full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '20px' }}>
      <div className="section-card" style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Tab switcher - hide if in committee mode */}
        {!isCommitteeMode && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button 
              type="button"
              className={`btn ${tab === 'login' ? 'btn--primary' : 'btn--outline'}`} 
              style={{ flex: 1 }}
              onClick={() => { setTab('login'); setErrorMsg(null); }}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`btn ${tab === 'create' ? 'btn--primary' : 'btn--outline'}`} 
              style={{ flex: 1 }}
              onClick={() => { setTab('create'); setErrorMsg(null); }}
            >
              Create Account
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {isCommitteeMode ? (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 12px', 
              background: 'var(--surface-warm)', 
              border: '1px solid var(--accent)', 
              borderRadius: '6px', 
              color: 'var(--accent)', 
              fontWeight: 600, 
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '16px'
            }}>
              <ShieldCheck size={14} /> Committee Mode
            </div>
          ) : (
            <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--primary)' }}>
              <Key size={40} />
            </span>
          )}
          
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '8px' }}>
            {isCommitteeMode ? 'Committee Sign In' : (tab === 'login' ? 'Welcome Back' : 'Join the Society')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {isCommitteeMode 
              ? 'Sign in with your allocated committee account. Default seed password is BRAS2026!.'
              : (tab === 'login' ? 'Sign in to view member-only leaderboards.' : 'Create a username and password to get started.')}
          </p>
        </div>

        <form onSubmit={tab === 'login' ? handleLogin : handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. harry"
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {errorMsg && (
            <div className="notice notice--error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="notice notice--success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> {successMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full"
            disabled={isLoading}
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading 
              ? "Processing..." 
              : (tab === 'login' ? "Sign In" : "Create Account")}
          </button>
        </form>
      </div>
    </div>
  );
}
