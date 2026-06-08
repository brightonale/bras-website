"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';


const ALL_LINKS = [
  { href: '/leaderboard', label: 'Pint Leaderboard', key: 'leaderboard' },
  { href: '/checklist', label: 'Pubs', key: 'checklist' },
  { href: '/matrix', label: 'Members', key: 'matrix' },
  { href: '/wordle', label: 'Wordle', key: 'wordle' },
  { href: '/awards', label: 'Awards', key: 'awards' },
  { href: '/rate', label: 'Rate a Pint', key: 'rate' },
  { href: '/history', label: 'History', key: 'about' },
  { href: '/gallery', label: 'Gallery', key: 'about' },
  { href: '/about', label: 'About', key: 'about' },
  { href: '/contact', label: 'Contact', key: 'contact' },
];

// NAV_LINKS is calculated dynamically inside the component body based on role

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Navbar({ settings }: { settings: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isCommittee, setIsCommittee] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = ALL_LINKS.filter(link => {
    if (link.key === 'wordle' || link.key === 'awards') {
      return isCommittee;
    }
    return settings ? settings[link.key] !== false : true;
  });

  useEffect(() => {
    const name = localStorage.getItem('bras_user_name');
    const role = localStorage.getItem('bras_user_role');
    if (name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserName(name);
       
      setIsCommittee(role === 'committee');
    } else {
       
      setUserName(null);
       
      setIsCommittee(false);
    }
  }, [pathname]);

  // Close mobile menu on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('bras_user_name');
    localStorage.removeItem('bras_user_role');
    setUserName(null);
    setIsCommittee(false);
    router.push('/');
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="site-nav">
      <div className="site-nav__inner">
        {/* Brand */}
        <Link href="/" className="site-nav__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/bras-logo.png"
            alt="BRAS Logo"
            className="site-nav__logo"
            style={{ borderRadius: '50%' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <div className="site-nav__title">Brighton Real Ale Society</div>
            <div className="site-nav__subtitle">Est. 2023 · BRAS</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="site-nav__links">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`site-nav__link ${isActive(link.href) ? 'site-nav__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          {isCommittee && (
            <Link
              href="/committee"
              className={`site-nav__link site-nav__link--accent ${isActive('/committee') ? 'site-nav__link--active' : ''}`}
            >
              Committee
            </Link>
          )}
        </div>

        {/* Desktop auth */}
        <div className="site-nav__auth" style={{ gap: '8px', alignItems: 'center' }}>
          {userName ? (
            <>
              <span className="site-nav__user">
                <Link href={`/profile/${encodeURIComponent(userName)}`}>{userName}</Link>
              </span>
              <button onClick={handleLogout} className="btn btn--outline btn--sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login?committee=true" className="btn btn--outline btn--sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                Committee Sign In
              </Link>
              <Link href="/login" className="btn btn--primary btn--sm">
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="site-nav__toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`site-nav__mobile ${menuOpen ? 'is-open' : ''}`}>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`site-nav__link ${isActive(link.href) ? 'site-nav__link--active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
        {isCommittee && (
          <Link
            href="/committee"
            className={`site-nav__link site-nav__link--accent ${isActive('/committee') ? 'site-nav__link--active' : ''}`}
          >
            Committee
          </Link>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px' }}>
          {userName ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="site-nav__user">
                <Link href={`/profile/${encodeURIComponent(userName)}`}>{userName}</Link>
              </span>
              <button onClick={handleLogout} className="btn btn--outline btn--sm">Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/login?committee=true" className="btn btn--outline btn--full" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', textAlign: 'center' }}>
                Committee Sign In
              </Link>
              <Link href="/login" className="btn btn--primary btn--full" style={{ textAlign: 'center' }}>
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
