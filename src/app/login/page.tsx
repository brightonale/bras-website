"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import membersData from '../../data/members.json';

export default function LoginPage() {
  const router = useRouter();
  const [selectedName, setSelectedName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Alphabetically sort member names
  const sortedMembers = [...membersData].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    // If already logged in, redirect
    const user = localStorage.getItem('bras_user_name');
    if (user) {
      router.push('/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedName) {
      setErrorMsg("Please select your name.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter a password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedName, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save credentials in local storage
      localStorage.setItem('bras_user_name', data.name);
      localStorage.setItem('bras_user_role', data.role);

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ alignItems: 'center', paddingTop: '20px' }}>

      <div className="section-card" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🍺</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '8px' }}>
            Sign in to BRAS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Choose your name to log in and unlock member-only leaderboards and profiles.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Member Name */}
          <div>
            <label className="form-label">Select Member Name</label>
            <select
              value={selectedName}
              onChange={e => setSelectedName(e.target.value)}
            >
              <option value="">-- Choose Name --</option>
              {sortedMembers.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="notice notice--error">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Tip Notice */}
          <div className="notice notice--warning" style={{ fontSize: '0.8rem' }}>
            💡 <strong>Password Tips:</strong> Use the shared member password to view all pub scores and profiles, or the committee password to access admin controls.
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn--primary btn--lg btn--full"
            disabled={isLoading}
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? "Signing in..." : "Access Platform"}
          </button>
        </form>
      </div>

    </div>
  );
}
