import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getCurrentUser } from "../lib/userStorage";

export function useAuth() {
  const queryClient = useQueryClient();
  const isDev = import.meta.env.DEV;

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getCurrentUser,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors (401/403)
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 2 times for network errors
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Add detailed error handling for authentication requests
    throwOnError: false,
  });

  // Listen for authentication events to refetch user data
  useEffect(() => {
    const handleAuthChange = () => {
      if (isDev) {
        console.debug('🔄 Authentication state changed, refetching user data...');
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      refetch();
    };

    // Listen for login/logout events
    window.addEventListener('userLoggedIn', handleAuthChange);
    window.addEventListener('userLoggedOut', handleAuthChange);
    window.addEventListener('userVerified', handleAuthChange);

    return () => {
      window.removeEventListener('userLoggedIn', handleAuthChange);
      window.removeEventListener('userLoggedOut', handleAuthChange);
      window.removeEventListener('userVerified', handleAuthChange);
    };
  }, [isDev, queryClient, refetch]);

  // Enhanced authentication state with detailed error tracking
  const isAuthenticated = !!user && !error;
  const authError = error ? 
    `Authentication check failed: ${error.message || 'Unknown error'}` : 
    null;

  return {
    user,
    isLoading,
    isAuthenticated,
    error: authError,
    refetch
  };
}
