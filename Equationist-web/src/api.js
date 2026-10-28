const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'equationist-token';

export function getToken() {
  try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function saveToken(token) {
  try { window.localStorage.setItem(TOKEN_KEY, token); } catch { /* storage may be unavailable */ }
}

export function clearToken() {
  try { window.localStorage.removeItem(TOKEN_KEY); } catch { /* storage may be unavailable */ }
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && auth) clearToken();
    throw new Error(data?.error || `Request failed (${response.status}).`);
  }
  return data;
}
