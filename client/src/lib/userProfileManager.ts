interface UserProfile {
  id: string;
  hackerName: string;
  email: string;
  profileImageUrl?: string;
  joinDate: string;
  lastActive: string;
  
  // Game Progress
  level: number;
  experience: number;
  reputation: string;
  credits: number;
  
  // Statistics
  totalMissions: number;
  successfulMissions: number;
  failedMissions: number;
  currentStreak: number;
  longestStreak: number;
  totalPlayTime: number;
  
  // Preferences
  hasCompletedTutorial: boolean;
  soundEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  preferredGameMode: 'single' | 'multiplayer';
  
  // Achievements
  unlockedAchievements: string[];
  unlockedCommands: string[];
  unlockedPayloads: string[];
  
  // Save State
  currentGameState: any;
  savedMissions: string[];
  inventory: string[];
}

class UserProfileManager {
  private apiEndpoint = '/api/user/profile';

  async createProfile(userData: {
    hackerName: string;
    email: string;
    profileImageUrl?: string;
  }): Promise<UserProfile> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...userData,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        
        // Initial game state
        level: 1,
        experience: 0,
        reputation: 'Novice',
        credits: 1000,
        
        // Initial stats
        totalMissions: 0,
        successfulMissions: 0,
        failedMissions: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPlayTime: 0,
        
        // Default preferences
        hasCompletedTutorial: false,
        soundEnabled: true,
        difficulty: 'normal',
        preferredGameMode: 'single',
        
        // Initial unlocks
        unlockedAchievements: [],
        unlockedCommands: ['help', 'scan', 'connect', 'missions'],
        unlockedPayloads: ['basic_payload'],
        
        // Empty save state
        currentGameState: null,
        savedMissions: [],
        inventory: []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create user profile');
    }

    return response.json();
  }

  async loadProfile(): Promise<UserProfile | null> {
    try {
      const response = await fetch(this.apiEndpoint, {
        credentials: 'include'
      });

      if (response.ok) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(this.apiEndpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...updates,
        lastActive: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }

    return response.json();
  }

  async saveGameState(gameState: any): Promise<void> {
    await this.updateProfile({
      currentGameState: gameState,
      lastActive: new Date().toISOString()
    });
  }

  async markTutorialComplete(): Promise<void> {
    await this.updateProfile({
      hasCompletedTutorial: true
    });
  }

  async updateGameProgress(progress: {
    experience?: number;
    credits?: number;
    level?: number;
    reputation?: string;
  }): Promise<void> {
    await this.updateProfile(progress);
  }

  async recordMissionCompletion(success: boolean, missionId: string): Promise<void> {
    const profile = await this.loadProfile();
    if (!profile) return;

    const updates: Partial<UserProfile> = {
      totalMissions: profile.totalMissions + 1,
      currentStreak: success ? profile.currentStreak + 1 : 0
    };

    if (success) {
      updates.successfulMissions = profile.successfulMissions + 1;
      updates.longestStreak = Math.max(profile.longestStreak, updates.currentStreak);
      updates.savedMissions = [...profile.savedMissions, missionId];
    } else {
      updates.failedMissions = profile.failedMissions + 1;
    }

    await this.updateProfile(updates);
  }

  async unlockAchievement(achievementId: string): Promise<void> {
    const profile = await this.loadProfile();
    if (!profile) return;

    if (!profile.unlockedAchievements.includes(achievementId)) {
      await this.updateProfile({
        unlockedAchievements: [...profile.unlockedAchievements, achievementId]
      });
    }
  }

  async unlockCommand(commandId: string): Promise<void> {
    const profile = await this.loadProfile();
    if (!profile) return;

    if (!profile.unlockedCommands.includes(commandId)) {
      await this.updateProfile({
        unlockedCommands: [...profile.unlockedCommands, commandId]
      });
    }
  }

  async updatePlayTime(additionalSeconds: number): Promise<void> {
    const profile = await this.loadProfile();
    if (!profile) return;

    await this.updateProfile({
      totalPlayTime: profile.totalPlayTime + additionalSeconds
    });
  }

  async updatePreferences(preferences: {
    soundEnabled?: boolean;
    difficulty?: 'easy' | 'normal' | 'hard' | 'expert';
    preferredGameMode?: 'single' | 'multiplayer';
  }): Promise<void> {
    await this.updateProfile(preferences);
  }

  // Analytics and insights
  calculateLevel(experience: number): number {
    return Math.floor(experience / 1000) + 1;
  }

  getReputationTitle(level: number, successfulMissions: number): string {
    if (level >= 20 && successfulMissions >= 100) return 'Elite';
    if (level >= 15 && successfulMissions >= 50) return 'Expert';
    if (level >= 10 && successfulMissions >= 25) return 'Advanced';
    if (level >= 5 && successfulMissions >= 10) return 'Skilled';
    if (successfulMissions >= 3) return 'Apprentice';
    return 'Novice';
  }

  getNextLevelRequirement(currentLevel: number): number {
    return currentLevel * 1000;
  }
}

export const userProfileManager = new UserProfileManager();
export type { UserProfile };