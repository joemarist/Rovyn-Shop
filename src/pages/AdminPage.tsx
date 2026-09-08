import { useEffect, useState } from 'react';
import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import { api, StaffMember } from '../services/api';
import PortalShell, {
  portalCardClass,
  portalInputClass,
  portalSectionTitleClass,
  portalTabClass,
} from '../components/PortalShell';

interface AdminPageProps {
  navigate: (page: Page) => void;
}

export default function AdminPage({ navigate }: AdminPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'overview' | 'staff'>('overview');
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const canAccess = user?.role === 'admin';

  useEffect(() => {
    if (!authLoading && !canAccess) {
      navigate('login');
    }
  }, [user, authLoading, canAccess, navigate]);

  const loadData = async () => {
    try {
      setError('');
      const [statsRes, staffRes] = await Promise.all([api.getAdminStats(), api.getStaff()]);
      setStats(statsRes.stats);
      setStaff(staffRes.staff);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  useEffect(() => {
    if (canAccess) loadData();
  }, [canAccess]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editId) {
        await api.updateStaff(editId, {
          username: form.username,
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          ...(form.password ? { password: form.password } : {}),
        });
        setMessage('Staff member updated successfully.');
      } else {
        await api.createStaff(form);
        setMessage('Staff member added successfully.');
      }
      setForm({ username: '', email: '', password: '', firstName: '', lastName: '', phone: '' });
      setEditId(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const startEdit = (s: StaffMember) => {
    setEditId(s.id);
    setForm({
      username: s.username,
      email: s.email,
      password: '',
      firstName: s.firstName,
      lastName: s.lastName,
      phone: s.phone,
    });
    setTab('staff');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate this staff member?')) return;
    try {
      await api.deleteStaff(id);
      loadData();
      setMessage('Staff member deactivated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (authLoading || !canAccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-black/50">Loading...</p>
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: 'Customers', value: stats.totalCustomers, icon: '👥' },
        { label: 'Staff', value: stats.totalStaff, icon: '🧑‍💼' },
        { label: 'Products', value: stats.totalProducts, icon: '🎒' },
        { label: 'Total Orders', value: stats.totalOrders, icon: '📋' },
        { label: 'Pending', value: stats.pendingOrders, icon: '⏳' },
        { label: 'Revenue', value: `₱${stats.revenue.toLocaleString()}`, icon: '💰' },
      ]
    : [];

  return (
    <PortalShell
      navigate={navigate}
      title="Administration"
      subtitle="System overview & staff management"
    >
      <div className="mb-8">
        <div className="bg-black text-white rounded-2xl px-6 py-8 sm:py-10">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2">Dashboard</p>
          <h2
            className="font-display font-black text-white uppercase"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            }}
          >
            Store Overview
          </h2>
          <p className="text-white/40 text-sm mt-2 max-w-lg">
            Monitor performance, manage your team, and keep Rovyn running smoothly.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {(['overview', 'staff'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={portalTabClass(tab === t)}
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {t === 'overview' ? 'Overview' : 'Staff Management'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-6 rounded-xl bg-brand/15 border border-brand/30 text-black text-sm px-4 py-3">
          {message}
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className={`${portalCardClass} hover:border-brand/30 transition-colors`}>
              <div className="flex items-start justify-between">
                <p className="text-xs uppercase text-black/40 font-bold tracking-wide">{s.label}</p>
                <span className="text-xl opacity-60">{s.icon}</span>
              </div>
              <p
                className="font-display font-black text-3xl mt-3 text-black"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={portalCardClass}>
            <h2 className={portalSectionTitleClass} style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              <span className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-xs font-bold text-black">
                {editId ? '✎' : '+'}
              </span>
              {editId ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <input
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className={portalInputClass}
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={portalInputClass}
                required
              />
              <input
                type="password"
                placeholder={editId ? 'New password (leave blank to keep)' : 'Password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={portalInputClass}
                required={!editId}
                minLength={6}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={portalInputClass}
                />
                <input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={portalInputClass}
                />
              </div>
              <input
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={portalInputClass}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand text-black font-bold py-3.5 rounded-xl hover:bg-brand-dark transition-all uppercase tracking-wide text-sm"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.08em' }}
                >
                  {editId ? 'Save Changes' : 'Add Staff'}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setForm({
                        username: '',
                        email: '',
                        password: '',
                        firstName: '',
                        lastName: '',
                        phone: '',
                      });
                    }}
                    className="px-5 py-3.5 border-2 border-black/15 rounded-xl font-bold text-sm uppercase hover:border-black/30 transition-all"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={`${portalCardClass} p-0 overflow-hidden`}>
            <div className="p-6 border-b border-black/8">
              <h2 className={portalSectionTitleClass} style={{ fontFamily: "'Barlow Condensed', sans-serif", marginBottom: 0 }}>
                Team Members
              </h2>
            </div>
            <div className="divide-y divide-black/8">
              {staff.length === 0 ? (
                <p className="p-6 text-black/40 text-sm">No staff members yet. Add your first team member.</p>
              ) : (
                staff.map((s) => (
                  <div key={s.id} className="p-5 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{s.username}</p>
                      <p className="text-xs text-black/40 truncate">
                        {s.firstName} {s.lastName} · {s.email}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg bg-black/5 hover:bg-brand/20 hover:text-black transition-colors"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="text-xs font-bold uppercase px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
