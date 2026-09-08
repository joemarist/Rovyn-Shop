import { useState } from 'react';
import { Page } from '../types';
import { api, setToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { clearPendingVerification, getPendingVerification } from '../utils/authFlow';
import logoMark from '../imports/2.png';

interface VerifyEmailPageProps {
  navigate: (page: Page) => void;
  redirectAfter?: Page;
}

export default function VerifyEmailPage({ navigate, redirectAfter = 'home' }: VerifyEmailPageProps) {
  const pending = getPendingVerification();
  const { setUserFromLogin } = useAuth();
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (!pending || pending.purpose !== 'registration') {
    navigate('signup');
    return null;
  }

  const inputClass =
    'w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-white text-center tracking-[0.4em] font-mono text-lg';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.verifyRegister(pending.email, code);
      setToken(token);
      setUserFromLogin(user);
      clearPendingVerification();
      navigate(redirectAfter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await api.resendCode(pending.email, 'registration');
      if (res.devCode) setDevCode(res.devCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoMark} alt="Rovyn" className="h-16 w-auto mx-auto mb-4" />
          <h1
            className="font-display font-black text-3xl uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Verify Email
          </h1>
          <p className="text-black/50 text-sm mt-2">
            Enter the 6-digit code sent to <strong className="text-black/70">{pending.email}</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-black/8 p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}
          {devCode && (
            <div className="mb-4 rounded-xl bg-brand/15 border border-brand/30 text-sm px-4 py-3">
              <span className="font-semibold">Dev code: </span>
              <span className="font-mono">{devCode}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={inputClass}
              placeholder="000000"
              required
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm disabled:opacity-60"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full mt-4 text-sm text-brand-dark hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={() => {
              clearPendingVerification();
              navigate('signup');
            }}
            className="w-full mt-2 text-sm text-black/40 hover:text-black"
          >
            ← Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
