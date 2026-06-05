"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import membersData from '../../data/members.json';

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
    // If already logged in, redirect
    const user = localStorage.getItem('bras_user_name');
    if (user && step !== 'change_password' && step !== 'claim_name') {
      router.push('/');
    }
    
    // Initialize fake local DB if missing
    let usersDb = localStorage.getItem('bras_users');
    if (!usersDb) {
      const initialDb: Record<string, LocalUser> = {};
      DEFAULT_COMMITTEE.forEach(name => {
        const usernameKey = name.toLowerCase().replace(/\s+/g, ''); // e.g. "harry", "jamesg"
        initialDb[usernameKey] = { 
          password: 'BRAS2026!', 
          role: 'committee', 
          mustChange: true,
          votingName: name 
        };
      });
      localStorage.setItem('bras_users', JSON.stringify(initialDb));
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
      
      const isLegacyCommittee = password === "bras2025";
      const isLegacyMember = password === "realale2026";
      
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
      
      db[userKey] = { password, role: 'member', mustChange: false };
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
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🔒</span>
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
            {errorMsg && <div className="notice notice--error">⚠️ {errorMsg}</div>}
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
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>✨</span>
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
            {errorMsg && <div className="notice notice--error">⚠️ {errorMsg}</div>}
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

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>
            {tab === 'login' ? '🍺' : '👋'}
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '8px' }}>
            {tab === 'login' ? 'Welcome Back' : 'Join the Society'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {tab === 'login' 
              ? 'Sign in to view member-only leaderboards.' 
              : 'Create a username and password to get started.'}
          </p>
        </div>

        <form onSubmit={tab === 'login' ? handleLogin : handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. johnsmith"
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

          {errorMsg && <div className="notice notice--error">⚠️ {errorMsg}</div>}
          {successMsg && <div className="notice notice--success">✅ {successMsg}</div>}

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
