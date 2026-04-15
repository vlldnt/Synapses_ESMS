import type { User, Company } from '../types';

/**
 * URL du backend réel. Si vide (défaut en dev), on tombe sur le mock JSON.
 * Pour activer le vrai backend : VITE_API_URL=https://api.synapses.fr dans .env
 */
const BASE_API_URL = import.meta.env.VITE_API_URL ?? '';

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_API_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API ${endpoint} → HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Données mock (chargées dynamiquement pour éviter de bundler en prod) ──

async function loadMock() {
  const mod = await import('../data/user.json');
  return mod.default as { user: User; company: Company };
}

// ─── API publique ──────────────────────────────────────────────────────────

/**
 * Retourne l'utilisateur connecté.
 * → En dev (VITE_API_URL absent) : lit src/data/user.json
 * → En prod : GET /auth/me  (JWT via cookie httpOnly)
 */
export async function getCurrentUser(): Promise<User> {
  if (BASE_API_URL) return apiFetch<User>('/auth/me');
  const mock = await loadMock();
  return mock.user;
}

/**
 * Retourne l'établissement associé à un utilisateur.
 * → En dev : lit src/data/user.json
 * → En prod : GET /companies/:id
 */
export async function getCompanyByUser(user: User): Promise<Company> {
  if (BASE_API_URL) return apiFetch<Company>(`/companies/${user.companyId}`);
  const mock = await loadMock();
  return mock.company;
}
