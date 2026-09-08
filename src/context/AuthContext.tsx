import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken, User } from '../services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  setUserFromLogin: (user: User) => void;
  logout: () => Promise<void>;
  isCustomer: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rovyn_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.login(identifier, password);
    if ('portalUnlocked' in res && res.portalUnlocked) {
      throw new Error('Use portal unlock flow');
    }
    const { token, user: u } = res as { token: string; user: User };
    setToken(token);
    setUser(u);
    return u;
  };

  const setUserFromLogin = (u: User) => {
    setUser(u);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        setUserFromLogin,
        logout,
        isCustomer: user?.role === 'customer',
        isStaff: user?.role === 'staff',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
