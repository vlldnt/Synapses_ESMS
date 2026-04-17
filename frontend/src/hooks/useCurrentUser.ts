import { useSelector } from 'react-redux';
import type { User, Organization, RootState } from '../types';

interface UseCurrentUserResult {
  user: User | null;
  organization: Organization | null;
  /** Prénom seul, avec fallback sécurisé */
  firstName: string;
  /** Métier/poste de l'utilisateur */
  job: string;
  /** "Prénom Nom" complet, avec fallback */
  fullName: string;
  /** Initiales "PD" dérivées du nom complet */
  initials: string;
}

/**
 * Lit l'utilisateur connecté et son établissement depuis le store Redux.
 * Les données sont populées au login et au rechargement de page via fetchCurrentUser().
 */
export function useCurrentUser(): UseCurrentUserResult {
  const user = useSelector((state: RootState) => state.auth.user);
  const organization = useSelector((state: RootState) => state.auth.organization);

  const firstName = user?.firstName ?? 'Professionnel';
  const job = user?.job ?? '';
  const fullName =
    user ? `${user.firstName} ${user.lastName}` : 'Professionnel';

  const initials =
    user
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : 'PR';

  return { user, organization, firstName, job, fullName, initials };
}
