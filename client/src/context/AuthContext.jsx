import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = React.createContext(null);

function getStoredAuth() {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = React.useState(() => getStoredAuth());
  const [loading, setLoading] = React.useState(true);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  React.useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!auth?.token) {
        if (active) {
          setAuth(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await axios.get(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });

        if (!active) return;
        setAuth({ token: auth.token, user: res.data.user });
      } catch (e) {
        if (!active) return;
        localStorage.removeItem('auth');
        setAuth(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token, user) => {
    const next = { token, user };
    setAuth(next);
    localStorage.setItem('auth', JSON.stringify(next));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('auth');
    toast.info('Logged out');
  };

  const value = {
    auth,
    user: auth?.user || null,
    token: auth?.token || null,
    isAuthenticated: Boolean(auth?.token),
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
