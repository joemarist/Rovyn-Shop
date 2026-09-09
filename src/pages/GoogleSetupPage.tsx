import { useState } from 'react';
import { Page } from '../types';
import { api, setToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  clearPendingVerification,
  getPendingVerification,
  savePendingVerification,
} from '../utils/authFlow';
import { passwordHint, validatePassword } from '../utils/passwordValidation';
import logoMark from '../imports/2.png';

interface GoogleSetupPageProps {
  navigate: (page: Page) => void;
  redirectAfter?: Page;
}

export default function GoogleSetupPage({ navigate, redirectAfter = 'home' }: GoogleSetupPageProps) {
  const [pending, setPending] = useState(() => getPendingVerification());
  const { setUserFromLogin } = useAuth();
  const [code, setCode] = useState('');
  const [passwordMode, setPasswordMode] = useState<'random' | 'manual'>('random');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [done, setDone] = useState(false);

  if (!pending || pending.purpose !== 'google_signup' || !pending.setupToken) {
    navigate('login');
    return null;
  }

  const inputClass =
    'w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-white';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordMode === 'manual') {
      const pwErr = validatePassword(password);
      if (pwErr) {
        setError(pwErr);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.completeGoogleSetup({
        setupToken: pending.setupToken!,
        code,
        passwordMode,
        password: passwordMode === 'manual' ? password : undefined,
      });
      setToken(res.token);
      setUserFromLogin(res.user);
      if (res.generatedPassword) setGeneratedPassword(res.generatedPassword);
      clearPendingVerification();
      setDone(true);
      if (!res.generatedPassword) {
        navigate(redirectAfter);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await api.resendCode(pending.email, 'google_signup');
      if (res.setupToken) {
        const updatedPending = {
          ...pending!,
          setupToken: res.setupToken,
        };
      
        savePendingVerification(updatedPending);
        setPending(updatedPending);
      }
      if (res.devCode) setDevCode(res.devCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  if (done && generatedPassword) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-black/8 p-8 shadow-sm text-center">
          <h1
            className="font-display font-black text-2xl uppercase mb-4"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Account Ready
          </h1>
          <p className="text-black/50 text-sm mb-4">
            A secure password was generated for your account. Save it — you can use it to sign in
            with email and password.
          </p>
          <div className="bg-stone-50 rounded-xl p-4 font-mono text-sm break-all mb-6 border border-black/8">
            {generatedPassword}
          </div>
          <button
            type="button"
            onClick={() => navigate(redirectAfter)}
            className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark uppercase text-sm"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Continue to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {pending.avatarUrl && (
            <img
              src={pending.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-brand"
            />
          )}
          <img src={logoMark} alt="Rovyn" className="h-12 w-auto mx-auto mb-3 opacity-80" />
          <h1
            className="font-display font-black text-3xl uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Complete Sign Up
          </h1>
          <p className="text-black/50 text-sm mt-2">
            Welcome{pending.firstName ? `, ${pending.firstName}` : ''}! Verify your email and set up
            a password.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-black/8 p-8 shadow-sm space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}
          {devCode && (
            <div className="rounded-xl bg-brand/15 border border-brand/30 text-sm px-4 py-3">
              <span className="font-semibold">Dev code: </span>
              <span className="font-mono">{devCode}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={inputClass + ' text-center tracking-[0.4em] font-mono text-lg'}
                placeholder="000000"
                required
              />
              <p className="text-xs text-black/40 mt-1">Sent to {pending.email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-2">
                Password Setup
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPasswordMode('random')}
                  className={`py-3 px-3 rounded-xl border-2 text-xs font-bold uppercase transition-all ${
                    passwordMode === 'random'
                      ? 'border-brand bg-brand/10 text-black'
                      : 'border-black/15 text-black/50'
                  }`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  🔐 Auto-generate
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordMode('manual')}
                  className={`py-3 px-3 rounded-xl border-2 text-xs font-bold uppercase transition-all ${
                    passwordMode === 'manual'
                      ? 'border-brand bg-brand/10 text-black'
                      : 'border-black/15 text-black/50'
                  }`}
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  ✏️ Set manually
                </button>
              </div>

              {passwordMode === 'random' ? (
                <p className="text-xs text-black/50 bg-stone-50 rounded-lg p-3">
                  We will create a strong random password for your account. You can change it later
                  via Forgot Password.
                </p>
              ) : (
                <>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass + ' mb-2'}
                    placeholder="Your password"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Confirm password"
                    required
                  />
                  <p className="text-xs text-black/40 mt-2">{passwordHint}</p>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm disabled:opacity-60"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}
            >
              {loading ? 'Creating account...' : 'Complete Sign Up'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full text-sm text-brand-dark hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend verification code'}
          </button>
        </div>
      </div>
    </div>
  );
}
