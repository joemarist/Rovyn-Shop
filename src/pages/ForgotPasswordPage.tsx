import { useState } from 'react';
import { Page } from '../types';
import { api } from '../services/api';
import { savePendingVerification } from '../utils/authFlow';
import logoMark from '../imports/2.png';

interface AuthPageProps {
  navigate: (page: Page) => void;
}

export default function ForgotPasswordPage({ navigate }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevCode('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message);
      if (res.devCode) setDevCode(res.devCode);

      savePendingVerification({
        email: res.email ?? email.toLowerCase(),
        purpose: 'password_reset',
      });
      navigate('reset-password');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
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
            Reset Password
          </h1>
          <p className="text-black/50 text-sm mt-2">
            Enter your email and we will send you a verification code
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-black/8 p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-xl bg-brand/15 border border-brand/30 text-sm px-4 py-3">
              {message}
              {devCode && (
                <p className="mt-2">
                  <span className="font-semibold">Dev code: </span>
                  <span className="font-mono">{devCode}</span>
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm disabled:opacity-60"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('login')}
            className="w-full mt-4 text-sm text-black/50 hover:text-black"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
