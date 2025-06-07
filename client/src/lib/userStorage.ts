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

// Enhanced login function that supports both email and hackername
export async function loginUser(identifier: string, password: string): Promise<UserAccount | null> {
  try {
    // Log connection attempt
    console.log(`🔐 Authentication attempt for: ${identifier.substring(0, 3)}***`);
    
    const response = await apiRequest('POST', '/api/auth/login', {
      email: identifier, // Backend will handle both email and hackername
      password
    });
    
    const authData: AuthResponse = await response.json();
    currentUserCache = authData.user;
    
    // Store in localStorage as backup/cache
    localStorage.setItem('roguesim_current_user', JSON.stringify(authData.user));
    localStorage.setItem('authenticated', 'true');
    
    // Log successful connection
    console.log(`✅ Authentication successful for: ${authData.user.hackerName}`);
    logUserConnection(authData.user.hackerName, 'login');
    
    return authData.user;
  } catch (error) {
    console.error('❌ Login failed:', error);
    logUserConnection(identifier, 'login_failed');
    return null;
  }
}

// Enhanced registration with email verification
export async function registerUser(userData: {
  hackerName: string;
  email: string;
  password: string;
  requireVerification?: boolean;
}): Promise<UserAccount | null> {
  try {
    console.log(`📝 Registration attempt for: ${userData.hackerName}`);
    
    // Call the working /api/auth/register endpoint directly
    const response = await apiRequest('POST', '/api/auth/register', userData);
    const result = await response.json();
    
    if (result.requiresVerification) {
      // Registration successful, verification code sent
      console.log(`✅ Registration successful, verification required for: ${userData.hackerName}`);
      return null; // Triggers verification step in frontend
    } else {
      // Registration successful, user logged in immediately  
      currentUserCache = result.user;
      localStorage.setItem('roguesim_current_user', JSON.stringify(result.user));
      localStorage.setItem('authenticated', 'true');
      
      console.log(`✅ Registration successful for: ${result.user.hackerName}`);
      logUserConnection(result.user.hackerName, 'register');
      
      return result.user;
    }
  } catch (error) {
    console.error('❌ Registration failed:', error);
    logUserConnection(userData.hackerName, 'register_failed');
    return null;
  }
}

// Send email verification code - IDENTICAL to registerUser but calls send-verification endpoint
export async function sendVerificationCode(email: string, hackerName?: string, password?: string): Promise<boolean> {
  try {
    console.log(`📧 Sending verification code to: ${email.substring(0, 3)}***`);
    
    // Call the send-verification endpoint directly (which does the same as register)
    await apiRequest('POST', '/api/auth/send-verification', { 
      email, 
      hackerName: hackerName || 'Agent',
      password: password || 'TEMP_PASSWORD_REQUIRED' // This should be the real password
    });
    
    console.log(`✅ Verification code sent successfully via send-verification endpoint`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification code:', error);
    return false;
  }
}

// Verify email with code
export async function verifyEmail(email: string, code: string): Promise<UserAccount | null> {
  try {
    console.log(`🔐 Verifying email with code for: ${email.substring(0, 3)}***`);
    
    const response = await apiRequest('POST', '/api/auth/verify', {
      email,
      code
    });
    
    const authData: AuthResponse = await response.json();
    currentUserCache = authData.user;
    
    // Store in localStorage as backup/cache
    localStorage.setItem('roguesim_current_user', JSON.stringify(authData.user));
    localStorage.setItem('authenticated', 'true');
    
    console.log(`✅ Email verification successful for: ${authData.user.hackerName}`);
    logUserConnection(authData.user.hackerName, 'verify');
    
    return authData.user;
  } catch (error) {
    console.error('❌ Email verification failed:', error);
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

// Enhanced logout with proper cleanup
export async function logoutUser(): Promise<void> {
  const userToLogout = currentUserCache;
  
  try {
    console.log(`👋 Logging out user: ${userToLogout?.hackerName || 'Unknown'}`);
    
    // Call backend logout API
    await apiRequest('POST', '/api/auth/logout', undefined);
    
    if (userToLogout) {
      logUserConnection(userToLogout.hackerName, 'logout');
    }
    
    console.log(`✅ Logout successful`);
  } catch (error) {
    console.error('❌ Logout request failed:', error);
    
    if (userToLogout) {
      logUserConnection(userToLogout.hackerName, 'logout_failed');
    }
  } finally {
    // Always clear cache and localStorage regardless of API success
    currentUserCache = null;
    localStorage.removeItem('roguesim_current_user');
    localStorage.removeItem('authenticated');
    
    // Trigger logout event for other components
    const event = new CustomEvent('userLoggedOut', {
      detail: { user: userToLogout }
    });
    window.dispatchEvent(event);
  }
}

// Update user profile with restrictions on hackername changes
export async function updateUserProfile(updates: {
  hackerName?: string;
  bio?: string;
  profileImageUrl?: string;
  currentPassword?: string; // Required for hackername changes
}): Promise<UserAccount | null> {
  try {
    if (updates.hackerName && !updates.currentPassword) {
      throw new Error('Password required to change hacker name');
    }
    
    console.log(`🔧 Updating profile for: ${currentUserCache?.hackerName || 'Unknown'}`);
    
    const response = await apiRequest('POST', '/api/user/update-profile', updates);
    const updatedUser: UserAccount = await response.json();
    
    // Update cache
    currentUserCache = updatedUser;
    localStorage.setItem('roguesim_current_user', JSON.stringify(updatedUser));
    
    console.log(`✅ Profile updated successfully`);
    
    if (updates.hackerName) {
      logUserConnection(updatedUser.hackerName, 'name_change');
    }
    
    return updatedUser;
  } catch (error) {
    console.error('❌ Profile update failed:', error);
    throw error;
  }
}

// Log user connections and activities
function logUserConnection(username: string, action: string): void {
  const timestamp = new Date().toISOString();
  console.log(`🔄 [${timestamp}] ${action.toUpperCase()}: ${username}`);
  
  // Send to backend for logging if available
  try {
    apiRequest('POST', '/api/user/log-activity', {
      username,
      action,
      timestamp,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Will be replaced by actual IP on backend
    }).catch(error => {
      // Don't throw - logging should be non-blocking
      console.warn('Failed to log user activity to backend:', error);
    });
  } catch (error) {
    // Ignore logging errors
  }
  
  // Also store locally for offline capability
  try {
    const logs = JSON.parse(localStorage.getItem('user_activity_logs') || '[]');
    logs.push({
      username,
      action,
      timestamp,
      userAgent: navigator.userAgent
    });
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('user_activity_logs', JSON.stringify(logs));
  } catch (error) {
    // Ignore localStorage errors
  }
}

// Get user activity logs
export function getUserActivityLogs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('user_activity_logs') || '[]');
  } catch (error) {
    return [];
  }
}

export function clearCurrentUser(): void {
  console.log(`🧹 Clearing current user cache`);
  currentUserCache = null;
  localStorage.removeItem('roguesim_current_user');
  localStorage.removeItem('authenticated');
}

// Legacy functions for backward compatibility
export function createUserAccount(userData: {
  username: string;
  email: string;
  avatar: string;
  specialization: string;
  bio: string;
}): UserAccount {
  console.warn('createUserAccount is deprecated, use registerUser instead');
  return {
    id: 'temp_' + Date.now(),
    hackerName: userData.username,
    email: userData.email,
    profileImageUrl: userData.avatar
  };
}

export function saveUserAccount(user: UserAccount): void {
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