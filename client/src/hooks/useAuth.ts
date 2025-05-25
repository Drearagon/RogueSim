import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  hackerName?: string;
  playerLevel: number;
  reputation: string;
  currentMode: 'single' | 'multiplayer';
  isOnline: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const setupProfileMutation = useMutation({
    mutationFn: async (data: { hackerName: string; preferredMode: 'single' | 'multiplayer' }) => {
      const response = await fetch('/api/auth/setup-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to setup profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  });

  const switchModeMutation = useMutation({
    mutationFn: async (mode: 'single' | 'multiplayer') => {
      const response = await fetch('/api/auth/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      
      if (!response.ok) {
        throw new Error('Failed to switch mode');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  });

  const checkUsernameMutation = useMutation({
    mutationFn: async (hackerName: string) => {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackerName })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Username not available');
      }
      
      return response.json();
    }
  });

  return {
    user: user as AuthUser | undefined,
    isLoading,
    isAuthenticated: !!user,
    needsProfileSetup: user && !user.hackerName,
    setupProfile: setupProfileMutation.mutateAsync,
    switchMode: switchModeMutation.mutateAsync,
    checkUsername: checkUsernameMutation.mutateAsync,
    isSettingUpProfile: setupProfileMutation.isPending,
    isSwitchingMode: switchModeMutation.isPending,
    isCheckingUsername: checkUsernameMutation.isPending,
  };
}