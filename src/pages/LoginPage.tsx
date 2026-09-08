import { useState } from 'react';
import { Page } from '../types';
import { api, setToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { savePendingVerification, savePortalUnlocked } from '../utils/authFlow';
import logoMark from '../imports/2.png';

interface AuthPageProps {
  navigate: (page: Page) => void;
  redirectAfter?: Page;
}

export default function LoginPage({ navigate, redirectAfter = 'home' }: AuthPageProps) {
  const { setUserFromLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(identifier, password);

      if ('portalUnlocked' in res && res.portalUnlocked) {
        savePortalUnlocked();
        navigate('portal-gate');
        return;
      }

      const { token, user } = res as { token: string; user: import('../services/api').User };
      setToken(token);
      setUserFromLogin(user);

      if (user.role === 'staff') {
        navigate('staff');
      } else if (user.role === 'admin') {
        navigate('admin');
      } else {
        navigate(redirectAfter);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.googleLogin(credential);

      if ('needsSetup' in res && res.needsSetup) {
        savePendingVerification({
          email: res.email,
          purpose: 'google_signup',
          setupToken: res.setupToken,
          firstName: res.firstName,
          lastName: res.lastName,
          avatarUrl: res.avatarUrl,
        });
        navigate('google-setup');
        return;
      }

      const { token, user } = res as { token: string; user: import('../services/api').User };
      setToken(token);
      setUserFromLogin(user);
      navigate(redirectAfter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-white';

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoMark} alt="Rovyn" className="h-16 w-auto mx-auto mb-4" />
          <h1
            className="font-display font-black text-3xl uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Welcome Back
          </h1>
          <p className="text-black/50 text-sm mt-2">
            {redirectAfter === 'checkout'
              ? 'Sign in to complete your checkout'
              : 'Sign in to your Rovyn account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-black/8 p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputClass}
                placeholder="you@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('forgot-password')}
              className="text-sm text-brand-dark hover:underline"
            >
              Forgot password?
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm disabled:opacity-60"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-black/40">or</span>
            </div>
          </div>

          <GoogleSignInButton onSuccess={handleGoogle} text="signin_with" />

          <p className="text-center text-sm text-black/50 mt-6">
            {"Don't have an account? "}
            <button
              type="button"
              onClick={() => navigate('signup')}
              className="text-brand-dark font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
