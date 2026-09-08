import { useState } from 'react';
import { Page } from '../types';
import { api } from '../services/api';
import { clearPendingVerification, getPendingVerification } from '../utils/authFlow';
import { passwordHint, validatePassword } from '../utils/passwordValidation';
import logoMark from '../imports/2.png';

interface AuthPageProps {
  navigate: (page: Page) => void;
}

export default function ResetPasswordPage({ navigate }: AuthPageProps) {
  const pending = getPendingVerification();
  const [email, setEmail] = useState(pending?.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputClass =
    'w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand bg-white';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (code.length !== 6) {
      setError('Enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(email.toLowerCase(), code, password);
      clearPendingVerification();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    try {
      const res = await api.resendCode(email.toLowerCase(), 'password_reset');
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
            New Password
          </h1>
          <p className="text-black/50 text-sm mt-2">
            Enter the verification code from your email and choose a new password
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-black/8 p-8 shadow-sm">
          {success ? (
            <div className="text-center">
              <p className="text-green-700 mb-6">Your password has been updated successfully.</p>
              <button
                type="button"
                onClick={() => navigate('login')}
                className="bg-brand text-black font-bold px-8 py-3 rounded-xl hover:bg-brand-dark uppercase text-sm"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
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
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
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
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                  <p className="text-xs text-black/40 mt-1.5">{passwordHint}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-black font-bold py-4 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm disabled:opacity-60"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em' }}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !email}
                className="w-full mt-4 text-sm text-brand-dark hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend verification code'}
              </button>
              <button
                type="button"
                onClick={() => navigate('forgot-password')}
                className="w-full mt-2 text-sm text-black/40 hover:text-black"
              >
                ← Request new code
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
