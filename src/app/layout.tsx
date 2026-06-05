import type { Metadata } from 'next';
import { Lora, Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import Navbar from '../components/Navbar';
import settingsData from '@/data/settings.json';

const lora = Lora({ subsets: ['latin'], variable: '--font-serif', weight: ['400', '500', '600', '700'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Brighton Real Ale Society | BRAS',
  description: 'The official digital home for the Brighton Real Ale Society (BRAS). Rate pubs, play Wordle, vote in annual awards, and browse our leaderboards.',
  keywords: 'Brighton, Real Ale, Beer, Pub Crawls, University, Society, BRAS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body style={{ fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{
          flex: 1,
          padding: 'var(--section-gap) var(--page-px)',
          maxWidth: 'var(--page-max)',
          width: '100%',
          margin: '0 auto',
        }}>
          {children}
        </main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="site-footer__inner">
            <div>
              <div className="site-footer__brand">Brighton Real Ale Society</div>
              <p className="site-footer__copy">
                Est. 2023 · University of Brighton<br />
                May your pints be cask-conditioned.
              </p>
            </div>
            <div className="site-footer__links">
              {settingsData.features.about && <Link href="/about" className="site-footer__link">About</Link>}
              {settingsData.features.contact && <Link href="/contact" className="site-footer__link">Contact</Link>}
              {settingsData.features.leaderboard && <Link href="/leaderboard" className="site-footer__link">Pint Leaderboard</Link>}
              {settingsData.features.checklist && <Link href="/checklist" className="site-footer__link">Pubs</Link>}
              {settingsData.features.awards && <Link href="/awards" className="site-footer__link">Awards</Link>}
              <Link href="/login" className="site-footer__link">Login</Link>
            </div>
          </div>
        </footer>
        <div style={{ position: 'fixed', bottom: '8px', left: '8px', fontSize: '0.75rem', color: 'var(--text-light)', zIndex: 9999, pointerEvents: 'none' }}>
          v1.0.4
        </div>
      </body>
    </html>
  );
}
