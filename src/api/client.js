// Petit client HTTP pour l'API AfriPay (back-office admin).
// Enveloppe fetch(), préfixe l'URL de base, attache le token d'auth,
// et convertit les réponses { success, data } / { success:false, message }
// en valeurs/erreurs JS classiques.

// Configurable via VITE_API_URL (fichier .env, voir .env.example) — sans cette variable, un build
// de production pointerait sur localhost et ne pourrait jamais atteindre un vrai serveur, et rien
// ne garantirait HTTPS. En développement (aucune variable définie), on retombe sur localhost.
export const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export const API_BASE = `${API_HOST}/api`;

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('admin');
}

// Permet à l'UI (AuthContext) de réagir à une session expirée (401)
// sans créer de dépendance circulaire avec react-router.
let unauthorizedHandler = null;
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

// Un seul rafraîchissement en vol à la fois : si plusieurs requêtes essuient un 401 en même
// temps, elles partagent la même promesse au lieu de déclencher chacune leur propre appel à
// /auth/refresh (qui ferait tourner le refreshToken plusieurs fois pour rien).
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload?.success) return false;
        localStorage.setItem('accessToken', payload.data.accessToken);
        localStorage.setItem('refreshToken', payload.data.refreshToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function doFetch(path, { method, headers, body, isForm }) {
  return fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
}

async function request(path, { method = 'GET', body, isForm = false, auth = true, _retried = false } = {}) {
  const headers = {};
  if (!isForm && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await doFetch(path, { method, headers, body, isForm });
  } catch {
    throw new Error('Impossible de contacter le serveur AfriPay. Vérifiez votre connexion.');
  }

  // Access token expiré (15 min) : on tente un rafraîchissement silencieux une seule fois avant
  // de considérer la session comme terminée — sans ça, l'admin était déconnecté toutes les 15
  // minutes d'usage actif alors qu'un refreshToken valide (30 jours) était déjà stocké mais
  // jamais utilisé.
  if (response.status === 401 && auth && !_retried && path !== '/auth/refresh') {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(path, { method, body, isForm, auth, _retried: true });
    }
    clearSession();
    if (unauthorizedHandler) unauthorizedHandler();
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // pas de corps JSON (ex: 204) — on continue avec payload=null
  }

  if (response.status === 401 && auth && _retried) {
    clearSession();
    if (unauthorizedHandler) unauthorizedHandler();
  }

  if (!response.ok || !payload || payload.success === false) {
    const message = payload?.message || `Erreur ${response.status} lors de l'appel à l'API.`;
    throw new Error(message);
  }

  return payload.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts = {}) => request(path, { method: 'PUT', body, ...opts }),
  patch: (path, body, opts = {}) => request(path, { method: 'PATCH', body, ...opts }),
  del: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
};

// Construit l'URL absolue d'un fichier renvoyé par l'API (ex: /uploads/xxx.jpg)
export function fileUrl(fichierRef) {
  if (!fichierRef) return null;
  if (/^https?:\/\//i.test(fichierRef)) return fichierRef;
  return `${API_HOST}${fichierRef}`;
}
