import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, onUnauthorized } from '../api/client';

const AuthContext = createContext(null);

function readStoredAdmin() {
  try {
    const raw = localStorage.getItem('admin');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => readStoredAdmin());
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('admin');
    setAdmin(null);
  }, []);

  useEffect(() => {
    onUnauthorized(() => setAdmin(null));
  }, []);

  // Au chargement, si un token existe, on vérifie qu'il est toujours valide.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get('/admin/me')
      .then((data) => {
        setAdmin(data);
        localStorage.setItem('admin', JSON.stringify(data));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, motDePasse) => {
    const data = await api.post('/admin/login', { email, motDePasse }, { auth: false });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  }, []);

  // Permet à la page Profil de mettre à jour la topbar/sidebar immédiatement après
  // un changement de nom/email, sans attendre une prochaine connexion.
  const updateAdmin = useCallback((next) => {
    setAdmin(next);
    localStorage.setItem('admin', JSON.stringify(next));
  }, []);

  const value = useMemo(
    () => ({ admin, isAuthenticated: !!admin, ready, login, logout, updateAdmin }),
    [admin, ready, login, logout, updateAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  return ctx;
}
