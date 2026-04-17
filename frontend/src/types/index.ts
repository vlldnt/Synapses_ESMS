// ─── Domaine métier ────────────────────────────────────────────────────────

export type Role = 'agent' | 'direction' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  job: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  /** Type court affiché dans l'UI — ex: "IME", "EHPAD", "CHRS" */
  type: string;
  description?: string;
}

/** Alias pour compatibilité rétroactive */
export type Company = Organization;

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthPayload {
  user: User;
  organization: Organization;
}

// ─── Redux state partiel (pour typage des hooks) ──────────────────────────

export interface AuthState {
  isLogged: boolean;
  isLoading: boolean;
  user: User | null;
  organization: Organization | null;
}

export interface RootState {
  auth: AuthState;
  theme: { theme: 'light' | 'dark' };
  role: { role: Role };
}
