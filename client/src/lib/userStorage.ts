import { apiRequest } from './queryClient';

// User account interface
interface UserAccount {
  id: string;
  hackerName: string;
  email: string;
  profileImageUrl?: string;
  authenticated?: boolean;
}

// Auth response interface
interface AuthResponse {
  user: UserAccount;
  sessionId?: string;
}

// Current user cache
let currentUserCache: UserAccount | null = null;

export async function loginUser(email: string, password: string): Promise<UserAccount | null> {
  try {
    const response = await apiRequest('POST', '/api/auth/login', {
      email,
      password
    });
    
    const authData: AuthResponse = await response.json();
    currentUserCache = authData.user;
    
    // Also store in localStorage as backup/cache
    localStorage.setItem('roguesim_current_user', JSON.stringify(authData.user));
    
    return authData.user;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

export async function registerUser(userData: {
  hackerName: string;
  email: string;
  password: string;
}): Promise<UserAccount | null> {
  try {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const authData: AuthResponse = await response.json();
    currentUserCache = authData.user;
    
    // Store in localStorage as backup/cache
    localStorage.setItem('roguesim_current_user', JSON.stringify(authData.user));
    
    return authData.user;
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<UserAccount | null> {
  // Return cached user if available
  if (currentUserCache) {
    return currentUserCache;
  }
  
  try {
    // Try to get user from backend
    const response = await apiRequest('GET', '/api/auth/user', undefined);
    const user: UserAccount = await response.json();
    currentUserCache = user;
    
    // Update localStorage cache
    localStorage.setItem('roguesim_current_user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    
    // Try to get from localStorage as fallback
    try {
      const stored = localStorage.getItem('roguesim_current_user');
      if (stored) {
        const user = JSON.parse(stored);
        return user;
      }
    } catch (storageError) {
      console.error('Failed to get user from localStorage:', storageError);
    }
    
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest('POST', '/api/auth/logout', undefined);
  } catch (error) {
    console.error('Logout request failed:', error);
  } finally {
    // Clear cache and localStorage regardless of API success
    currentUserCache = null;
    localStorage.removeItem('roguesim_current_user');
  }
}

export function clearCurrentUser(): void {
  currentUserCache = null;
  localStorage.removeItem('roguesim_current_user');
}

// Legacy functions for backward compatibility
export function createUserAccount(userData: {
  username: string;
  email: string;
  avatar: string;
  specialization: string;
  bio: string;
}): UserAccount {
  // This should now use the registerUser function
  console.warn('createUserAccount is deprecated, use registerUser instead');
  return {
    id: 'temp_' + Date.now(),
    hackerName: userData.username,
    email: userData.email,
    profileImageUrl: userData.avatar
  };
}

export function saveUserAccount(user: UserAccount): void {
  // This is now handled by the backend, just update cache
  console.warn('saveUserAccount is deprecated, user data is saved automatically');
  currentUserCache = user;
  localStorage.setItem('roguesim_current_user', JSON.stringify(user));
}

export function getUserAccount(email: string): UserAccount | null {
  console.warn('getUserAccount is deprecated, use getCurrentUser instead');
  return currentUserCache;
}

export function getUserAccounts(): Record<string, UserAccount> {
  console.warn('getUserAccounts is deprecated');
  return {};
}