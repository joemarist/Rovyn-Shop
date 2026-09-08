import { useState } from 'react';
import { Page } from '../types';
import { api, setToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { savePendingVerification } from '../utils/authFlow';
import { passwordHint, validatePassword } from '../utils/passwordValidation';
import logoMark from '../imports/2.png';

interface AuthPageProps {
  navigate: (page: Page) => void;
}

export default function SignupPage({ navigate }: AuthPageProps) {
  const { setUserFromLogin } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClass =
    'w-full border border-black/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors bg-white';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pwErr = validatePassword(form.password);
    if (pwErr) {
      setError(pwErr);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });

      if ('needsVerification' in res && res.needsVerification) {
        savePendingVerification({ email: res.email, purpose: 'registration' });
        navigate('verify-email');
        return;
      }
      navigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
      navigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
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
            Create Account
          </h1>
          <p className="text-black/50 text-sm mt-2">Join Rovyn for faster checkout</p>
        </div>

        <div className="bg-white rounded-2xl border border-black/8 p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                  First Name
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                  Last Name
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-black/50 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
              {loading ? 'Sending code...' : 'Create Account'}
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

          <GoogleSignInButton onSuccess={handleGoogle} text="signup_with" />

          <p className="text-center text-sm text-black/50 mt-6">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('login')}
              className="text-brand-dark font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
