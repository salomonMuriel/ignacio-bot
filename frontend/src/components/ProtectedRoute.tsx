import { type ReactNode } from 'react';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import LoadingScreen from './ui/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <SessionAuth
      requireAuth={true}
      onSessionExpired={() => {
        // Handle session expiration if needed
        console.log('Session expired');
      }}
    >
      {children}
    </SessionAuth>
  );
}