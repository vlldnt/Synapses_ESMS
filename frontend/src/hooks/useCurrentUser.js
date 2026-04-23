import { useSelector } from 'react-redux';

export function useCurrentUser() {
  const user = useSelector((state) => state.auth.user);
  const organization = useSelector((state) => state.auth.organization);

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
