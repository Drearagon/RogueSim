// Simple user account storage for the hacking game
interface UserAccount {
  id: string;
  username: string;
  email: string;
  avatar: string;
  specialization: string;
  bio: string;
  reputation: string;
  level: number;
  credits: number;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'roguesim_user_accounts';
const CURRENT_USER_KEY = 'roguesim_current_user';

export function saveUserAccount(user: UserAccount): void {
  const accounts = getUserAccounts();
  accounts[user.email] = user;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getUserAccount(email: string): UserAccount | null {
  const accounts = getUserAccounts();
  return accounts[email] || null;
}

export function getUserAccounts(): Record<string, UserAccount> {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function getCurrentUser(): UserAccount | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function createUserAccount(userData: {
  username: string;
  email: string;
  avatar: string;
  specialization: string;
  bio: string;
}): UserAccount {
  const user: UserAccount = {
    id: 'user_' + Date.now(),
    username: userData.username,
    email: userData.email,
    avatar: userData.avatar,
    specialization: userData.specialization,
    bio: userData.bio,
    reputation: 'UNKNOWN',
    level: 1,
    credits: 500,
    createdAt: new Date().toISOString()
  };
  
  saveUserAccount(user);
  return user;
}

export function loginUser(email: string, password: string): UserAccount | null {
  // For development, just check if account exists
  const user = getUserAccount(email);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}