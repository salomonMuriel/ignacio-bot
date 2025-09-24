import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { setAuth0Instance } from '@/services/api';

interface Auth0InitProps {
  children: React.ReactNode;
}

export default function Auth0Init({ children }: Auth0InitProps) {
  const auth0 = useAuth0();

  useEffect(() => {
    setAuth0Instance(auth0);
  }, [auth0]);

  return <>{children}</>;
}