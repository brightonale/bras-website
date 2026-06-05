"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  login as dbLogin, 
  createAccount as dbCreateAccount, 
  claimVotingName as dbClaimVotingName, 
  changePassword as dbChangePassword 
} from '@/app/actions';

import { Lock, Sparkles, Key, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function LoginClient({ initialMembers }: { initialMembers: { name: string }[] }) {
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
  const sortedMembers = [...initialMembers].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    // Detect committee mode from URL query parameters
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('committee') === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCommitteeMode(true);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTab('login');
      }
    }

    // If already logged in, redirect
    const user = localStorage.getItem('bras_user_name');
    if (user && step !== 'change_password' && step !== 'claim_name') {
      router.push('/');
    }
  }, [step, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Please enter username and password.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const res = await dbLogin(username, password);
      setIsLoading(false);
      
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      
      if (res.user?.mustChange) {
        setStep('change_password');
        return;
      }

      if (!res.user?.votingName) {
        setStep('claim_name');
        return;
      }
      
      loginSuccess(res.user.votingName, res.user.role);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg("Error communicating with database.");
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Please choose a username and password.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const res = await dbCreateAccount(username, password);
      setIsLoading(false);
      
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      
      setStep('claim_name');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg("Error creating account in database.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const res = await dbChangePassword(username, newPassword);
      setIsLoading(false);
      
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      
      setStep('claim_name');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg("Error changing password in database.");
    }
  };

  const handleClaimName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVotingName) {
      setErrorMsg("Please select your voting name.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const res = await dbClaimVotingName(username, selectedVotingName);
      setIsLoading(false);
      
      loginSuccess(selectedVotingName, 'committee');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg("Error claiming voting name in database.");
    }
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
