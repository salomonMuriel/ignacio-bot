import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingScreen from './ui/LoadingScreen';
import { useApi } from '@/hooks/useApi';
import ProfileCompletionPage from '@/pages/ProfileCompletionPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth0();
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const api = useApi()

  useEffect(() => {
    // Only run the check if the user is authenticated.
    if (isAuthenticated) {
      const checkComplete = async () => {
        try {
          const completeStatus = await api.getProfileCompletion();
          // Update state with the result from the API
          setIsComplete(completeStatus.is_complete); 
        } catch (error) {
          console.error("Failed to fetch profile completion status:", error);
          // Handle error case, e.g., assume incomplete
          setIsComplete(false);
        }
      };

      checkComplete();
    }
  }, [isAuthenticated, api]);

  // 1. First, wait for Auth0 to finish loading.
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 2. If not authenticated after loading, redirect to home.
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. If authenticated, but we are still waiting for the profile check API call.
  if (isComplete === null) {
    return <LoadingScreen />;
  }

  // 4. If authenticated, but the profile is not complete.
  if (isComplete === false || isComplete === null) {
    return <ProfileCompletionPage/>;
  }

  // 5. If all checks pass, render the protected content.
  return <>{children}</>;
}