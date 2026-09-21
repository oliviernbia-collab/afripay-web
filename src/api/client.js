// Petit client HTTP pour l'API AfriPay (back-office admin).
// Enveloppe fetch(), préfixe l'URL de base, attache le token d'auth,
// et convertit les réponses { success, data } / { success:false, message }
// en valeurs/erreurs JS classiques.

export const API_HOST = 'http://localhost:4000';
export const API_BASE = `${API_HOST}/api`;

function getAccessToken() {
  return localStorage.getItem('accessToken');
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

async function request(path, { method = 'GET', body, isForm = false, auth = true } = {}) {
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
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new Error('Impossible de contacter le serveur AfriPay. Vérifiez votre connexion.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // pas de corps JSON (ex: 204) — on continue avec payload=null
  }

  if (response.status === 401 && auth) {
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
};

// Construit l'URL absolue d'un fichier renvoyé par l'API (ex: /uploads/xxx.jpg)
export function fileUrl(fichierRef) {
  if (!fichierRef) return null;
  if (/^https?:\/\//i.test(fichierRef)) return fichierRef;
  return `${API_HOST}${fichierRef}`;
}
