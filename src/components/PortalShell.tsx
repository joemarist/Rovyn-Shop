import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import logo from '../imports/1headLogo.png';

interface PortalShellProps {
  navigate: (page: Page) => void;
  title: string;
  subtitle?: string;
  backPage?: Page;
  children: React.ReactNode;
}

export default function PortalShell({
  navigate,
  title,
  subtitle,
  backPage = 'home',
  children,
}: PortalShellProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Barlow', sans-serif" }}>
      <header className="sticky top-0 z-50 bg-white border-b border-black/8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="flex-shrink-0 focus:outline-none"
              aria-label="Rovyn home"
            >
              <img src={logo} alt="Rovyn" className="h-10 w-auto object-contain" />
            </button>

            <div className="hidden sm:block text-center">
              <h1
                className="font-display font-black text-lg uppercase tracking-wide text-black"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em' }}
              >
                {title}
              </h1>
              {subtitle && <p className="text-xs text-black/40">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate(backPage)}
                className="text-xs sm:text-sm font-semibold text-black/50 hover:text-brand transition-colors uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Portal
              </button>
              <button
                type="button"
                onClick={() => navigate('home')}
                className="text-xs sm:text-sm font-semibold text-black/50 hover:text-black transition-colors"
              >
                Store
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-brand text-black font-bold px-3 sm:px-4 py-2 rounded-xl hover:bg-brand-dark transition-all text-xs sm:text-sm uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="sm:hidden bg-white border-b border-black/8 px-4 py-3">
        <h1
          className="font-display font-black text-xl uppercase"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-xs text-black/40 mt-0.5">{subtitle}</p>}
        {user && (
          <p className="text-xs text-black/30 mt-1">
            Signed in as {user.firstName || user.username || user.email}
          </p>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

export const portalInputClass =
  'w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-white';

export const portalLabelClass =
  'block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5';

export const portalTabClass = (active: boolean) =>
  `px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${
    active
      ? 'bg-brand text-black shadow-sm'
      : 'bg-white text-black/50 border border-black/10 hover:border-black/25 hover:text-black'
  }`;

export const portalCardClass = 'bg-white rounded-2xl p-6 border border-black/8 shadow-sm';

export const portalSectionTitleClass =
  'font-display font-bold text-lg uppercase mb-5 flex items-center gap-2';
