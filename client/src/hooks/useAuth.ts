import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
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

  // Enhanced authentication state with detailed error tracking
  const isAuthenticated = !!user && !error;
  const authError = error ? 
    `Authentication check failed: ${error.message || 'Unknown error'}` : 
    null;

  return {
    user,
    isLoading,
    isAuthenticated,
    error: authError
  };
}