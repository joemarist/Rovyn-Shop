import { useEffect, useState } from 'react';
import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import { clearPortalUnlocked, isPortalUnlocked, savePortalUnlocked } from '../utils/authFlow';
import logoMark from '../imports/2.png';

interface PortalGatePageProps {
  navigate: (page: Page) => void;
}

export default function PortalGatePage({ navigate }: PortalGatePageProps) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPortalUnlocked()) {
      navigate('login');
    }
  }, [navigate]);

  const inputClass =
    'w-full border border-white/15 rounded-xl px-4 py-3 text-sm bg-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password);
      clearPortalUnlocked();

      if (user.role === 'admin') {
        navigate('admin');
      } else if (user.role === 'staff') {
        navigate('staff');
      } else {
        setError('Invalid portal credentials. Use admin or staff account.');
        savePortalUnlocked();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    clearPortalUnlocked();
    navigate('login');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoMark} alt="Rovyn" className="h-16 w-auto mx-auto mb-4" />
          <h1
            className="font-display font-black text-3xl uppercase text-white"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Portal Access
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Enter your admin or staff credentials to continue
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-4 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/50 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputClass}
                placeholder="admin or staff"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-white/50 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm disabled:opacity-60"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleBack}
            className="w-full mt-4 text-sm text-white/40 hover:text-white/60"
          >
            ← Back to Store Login
          </button>
        </div>
      </div>
    </div>
  );
}
