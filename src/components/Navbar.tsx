"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_LINKS = [
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/checklist', label: 'Pubs' },
  { href: '/matrix', label: 'Members' },
  { href: '/wordle', label: 'Wordle' },
  { href: '/awards', label: 'Awards' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isCommittee, setIsCommittee] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('bras_user_name');
    const role = localStorage.getItem('bras_user_role');
    if (name) {
      setUserName(name);
      setIsCommittee(role === 'committee');
    } else {
      setUserName(null);
      setIsCommittee(false);
    }
  }, [pathname]);

  // Close mobile menu on navigation
  useEffect(() => {
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
          <img
            src="/assets/bras-logo-roundel.png"
            alt="BRAS Logo"
            className="site-nav__logo"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <div className="site-nav__title">Brighton Real Ale Society</div>
            <div className="site-nav__subtitle">Est. 2023 · BRAS</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="site-nav__links">
          {NAV_LINKS.map(link => (
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
        <div className="site-nav__auth">
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
            <Link href="/login">
              <button className="btn btn--primary btn--sm">Login</button>
            </Link>
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
        {NAV_LINKS.map(link => (
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
            <Link href="/login">
              <button className="btn btn--primary btn--full">Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
