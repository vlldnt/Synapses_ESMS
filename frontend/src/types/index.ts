// ─── Domaine métier ────────────────────────────────────────────────────────

export type Role = 'agent' | 'direction' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  /** Type court affiché dans l'UI — ex: "IME", "EHPAD", "CHRS" */
  type: string;
  /** Description longue pour l'affichage UI */
  description: string;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthPayload {
  user: User;
  company: Company;
}

// ─── Redux state partiel (pour typage des hooks) ──────────────────────────

export interface AuthState {
  isLogged: boolean;
  isLoading: boolean;
  user: User | null;
  company: Company | null;
}

export interface RootState {
  auth: AuthState;
  theme: { theme: 'light' | 'dark' };
  role: { role: Role };
}
