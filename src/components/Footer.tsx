import { useState } from 'react';
import { Page } from '../types';
import logo from '../imports/1.png';

interface FooterProps {
  navigate: (page: Page) => void;
}

export default function Footer({ navigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="bg-black text-white">
      {/* Mountain divider top */}
      <div className="w-full overflow-hidden leading-none bg-white">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12 block">
          <path d="M0,48 L0,38 L120,20 L200,32 L320,8 L400,22 L510,4 L580,18 L640,2 L720,20 L800,6 L900,28 L1000,10 L1100,26 L1220,8 L1340,22 L1440,14 L1440,48 Z" fill="#000000"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <button onClick={() => navigate('home')} className="mb-4 block">
              <img src={logo} alt="Rovyn" className="h-10 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            </button>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Built for your everyday. Gear that goes the distance — on the trail and off it.
            </p>
            <div className="flex gap-3">
              {['instagram', 'facebook', 'tiktok', 'youtube'].map((s) => (
                <a key={s} href="#" aria-label={s}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-brand hover:text-brand transition-colors text-white/50 text-xs font-bold uppercase">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-display font-bold text-base uppercase tracking-widest text-white/40 mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Shop</h4>
            <ul className="space-y-2">
              {[
                { label: 'All Products', page: 'shop' as Page },
                { label: 'Backpacks', page: 'shop' as Page },
                { label: 'Footwear', page: 'shop' as Page },
                { label: 'Apparel', page: 'shop' as Page },
              ].map((l) => (
                <li key={l.label}>
                  <button onClick={() => navigate(l.page)}
                    className="text-white/70 hover:text-brand transition-colors text-sm">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h4 className="font-display font-bold text-base uppercase tracking-widest text-white/40 mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Info</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', page: 'about' as Page },
                { label: 'Contact', page: 'contact' as Page },
                { label: 'Shipping & Returns', page: 'contact' as Page },
                { label: 'FAQs', page: 'contact' as Page },
              ].map((l) => (
                <li key={l.label}>
                  <button onClick={() => navigate(l.page)}
                    className="text-white/70 hover:text-brand transition-colors text-sm">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold text-base uppercase tracking-widest text-white/40 mb-4"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Stay in the loop</h4>
            <p className="text-white/60 text-sm mb-4">New drops, trail-tested reviews, and member-only deals.</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-brand text-sm font-semibold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                You're in!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand transition-colors"
                  required
                />
                <button type="submit"
                  className="bg-brand text-black font-bold text-sm py-2.5 px-4 rounded-lg hover:bg-brand-dark transition-colors"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.04em' }}>
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">© 2026 Rovyn. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service'].map((t) => (
              <a key={t} href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
