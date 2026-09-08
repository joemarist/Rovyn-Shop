import { useState, useEffect } from 'react';
import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import logo from '../imports/1headLogo.png';

interface HeaderProps {
  page: Page;
  navigate: (page: Page) => void;
  cartCount: number;
  authLoading?: boolean;
}

export default function Header({ page, navigate, cartCount, authLoading }: HeaderProps) {
  const { user, logout, isCustomer } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Shop', page: 'shop' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('home');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      } border-b border-black/8`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('home')}
            className="flex-shrink-0 focus:outline-none"
            aria-label="Rovyn home"
          >
            <img src={logo} alt="Rovyn" className="h-10 w-auto object-contain" />
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`font-display font-700 text-base uppercase tracking-wide transition-colors hover:text-brand ${
                  page === link.page ? 'text-brand' : 'text-black'
                }`}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!authLoading && (
              <div className="relative hidden sm:block">
                {user && isCustomer ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/6 transition-colors text-sm font-semibold"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-black">
                          {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                        </span>
                      )}
                      <span className="max-w-[100px] truncate">
                        {user.firstName || user.email.split('@')[0]}
                      </span>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl border border-black/8 shadow-lg py-1 z-50">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-black/5"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate('login')}
                    className="text-sm font-bold uppercase tracking-wide hover:text-brand transition-colors"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('cart')}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
              aria-label={`Cart (${cartCount} items)`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-brand text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none"
                  style={{ fontFamily: "'Barlow', sans-serif" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-black/8 bg-white">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  navigate(link.page);
                  setMenuOpen(false);
                }}
                className={`text-left py-3 px-2 font-display font-bold text-lg uppercase tracking-wide border-b border-black/6 last:border-0 transition-colors hover:text-brand ${
                  page === link.page ? 'text-brand' : 'text-black'
                }`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
            {!authLoading && (
              <button
                onClick={() => {
                  if (user && isCustomer) handleLogout();
                  else navigate('login');
                  setMenuOpen(false);
                }}
                className="text-left py-3 px-2 font-display font-bold text-lg uppercase tracking-wide border-b border-black/6 transition-colors hover:text-brand"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {user && isCustomer ? 'Sign Out' : 'Sign In'}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
