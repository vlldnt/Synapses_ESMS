import { useSelector } from 'react-redux';

export function useCurrentUser() {
  const user = useSelector((state) => state.auth.user);
  const organization = useSelector((state) => state.auth.organization);

  const firstName = user?.first_name ?? 'Professionnel';
  const job = user?.job ?? '';
  const fullName =
    user ? `${user.first_name} ${user.last_name}` : 'Professionnel';

  const initials =
    user
      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
      : 'PR';

  return { user, organization, firstName, job, fullName, initials };
}
