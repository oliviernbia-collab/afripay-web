import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, onUnauthorized, refreshAccessToken, setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    // Best-effort : même si l'appel échoue (réseau coupé...), on efface la session côté client —
    // le cookie httpOnly expirera de toute façon à son terme.
    api.post('/admin/logout', undefined, { auth: false }).catch(() => {});
    setAccessToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    onUnauthorized(() => setAdmin(null));
  }, []);

  // Au chargement, aucun token n'est plus persisté côté client (voir api/client.js) : on tente un
  // rafraîchissement silencieux à partir du cookie httpOnly (s'il existe et est encore valide)
  // pour retrouver une session sans repasser par l'écran de connexion à chaque rechargement.
  useEffect(() => {
    refreshAccessToken()
      .then((refreshed) => {
        if (!refreshed) return null;
        return api.get('/admin/me').then(setAdmin);
      })
      .catch(() => setAdmin(null))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email, motDePasse) => {
    const data = await api.post('/admin/login', { email, motDePasse }, { auth: false });
    setAccessToken(data.accessToken);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  // Permet à la page Profil de mettre à jour la topbar/sidebar immédiatement après
  // un changement de nom/email, sans attendre une prochaine connexion.
  const updateAdmin = useCallback((next) => {
    setAdmin(next);
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
