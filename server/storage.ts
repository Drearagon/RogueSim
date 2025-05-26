import {
  users,
  gameSaves,
  missionHistory,
  commandLogs,
  multiplayerRooms,
  roomMembers,
  playerStats,
  type User,
  type GameSave,
  type MissionHistory,
  type CommandLog,
  type MultiplayerRoom,
  type RoomMember,
  type PlayerStats,
  type UpsertUser,
  type InsertGameSave,
  type InsertMissionHistory,
  type InsertCommandLog,
  type InsertRoom,
  type InsertRoomMember,
  type InsertPlayerStats,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations for custom authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByHackerName(hackerName: string): Promise<User | undefined>;
  createUser(userData: any): Promise<User>;
  updateHackerName(userId: string, hackerName: string): Promise<User>;
  
  // Extended user profile operations
  createUserProfile(profileData: any): Promise<any>;
  getUserProfile(userId: string): Promise<any>;
  updateUserProfile(userId: string, updates: any): Promise<any>;
  
  // Email verification operations
  storeVerificationCode(data: any): Promise<void>;
  getVerificationCode(email: string, code: string): Promise<any>;
  markVerificationCodeUsed(id: number): Promise<void>;
  storeUnverifiedUser(userData: any): Promise<void>;
  getUnverifiedUser(email: string): Promise<any>;
  deleteUnverifiedUser(email: string): Promise<void>;
  
  // Game save operations
  saveGameState(gameState: InsertGameSave): Promise<GameSave>;
  loadGameState(sessionId: string): Promise<GameSave | undefined>;
  getUserGameSave(userId: string, gameMode: string): Promise<GameSave | undefined>;
  
  // Mission history
  saveMissionHistory(mission: InsertMissionHistory): Promise<MissionHistory>;
  getMissionHistory(sessionId: string): Promise<MissionHistory[]>;
  
  // Command logging
  logCommand(commandLog: InsertCommandLog): Promise<CommandLog>;
  getCommandHistory(sessionId: string): Promise<CommandLog[]>;
  
  // Multiplayer operations
  createRoom(room: InsertRoom): Promise<MultiplayerRoom>;
  joinRoom(roomMember: InsertRoomMember): Promise<RoomMember>;
  leaveRoom(roomId: number, userId: string): Promise<void>;
  getRoomByCode(roomCode: string): Promise<MultiplayerRoom | undefined>;
  getRoomMembers(roomId: number): Promise<RoomMember[]>;
  
  // Player stats
  getPlayerStats(userId: string): Promise<PlayerStats | undefined>;
  updatePlayerStats(userId: string, stats: Partial<InsertPlayerStats>): Promise<PlayerStats>;
}

export class DatabaseStorage implements IStorage {
  public pool = pool; // Expose pool for direct queries
  
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<any> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async getUserByHackerName(hackerName: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.hackerName, hackerName));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    // Use direct SQL with parameter substitution - this will definitely work
    const insertQuery = `
      INSERT INTO users (
        id, email, password, hacker_name, 
        player_level, total_missions_completed, total_credits_earned, 
        reputation, created_at, updated_at, joined_at, last_active, 
        is_online, current_mode
      ) VALUES (
        '${userData.id}', 
        '${userData.email}', 
        '${userData.password}', 
        '${userData.hackerName}', 
        1, 0, 0, 'ROOKIE', 
        NOW(), NOW(), NOW(), NOW(), 
        false, 'single'
      )
    `;
    
    await pool.query(insertQuery);
    
    // Return the created user
    const selectQuery = `SELECT id, email, hacker_name, profile_image_url FROM users WHERE id = '${userData.id}'`;
    const result = await pool.query(selectQuery);
    return result.rows[0];
  }

  async updateHackerName(userId: string, hackerName: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ hackerName, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserGameSave(userId: string, gameMode: string): Promise<GameSave | undefined> {
    const [save] = await db
      .select()
      .from(gameSaves)
      .where(and(eq(gameSaves.userId, userId), eq(gameSaves.gameMode, gameMode)))
      .orderBy(desc(gameSaves.lastSaved));
    return save;
  }

  async saveGameState(gameState: InsertGameSave): Promise<GameSave> {
    // Check if a save already exists for this session
    const [existingSave] = await db
      .select()
      .from(gameSaves)
      .where(eq(gameSaves.sessionId, gameState.sessionId));

    if (existingSave) {
      // Update existing save
      const [updatedSave] = await db
        .update(gameSaves)
        .set(gameState)
        .where(eq(gameSaves.sessionId, gameState.sessionId))
        .returning();
      return updatedSave;
    } else {
      // Create new save
      const [newSave] = await db
        .insert(gameSaves)
        .values(gameState)
        .returning();
      return newSave;
    }
  }

  async loadGameState(sessionId: string): Promise<GameSave | undefined> {
    try {
      const [save] = await db
        .select()
        .from(gameSaves)
        .where(eq(gameSaves.sessionId, sessionId))
        .orderBy(desc(gameSaves.lastSaved));
      return save || undefined;
    } catch (error) {
      // Handle backward compatibility - if new columns don't exist yet, return undefined
      console.log("Database schema updating, falling back to client storage");
      return undefined;
    }
  }

  async saveMissionHistory(mission: InsertMissionHistory): Promise<MissionHistory> {
    const [savedMission] = await db
      .insert(missionHistory)
      .values(mission)
      .returning();
    return savedMission;
  }

  async getMissionHistory(sessionId: string): Promise<MissionHistory[]> {
    return await db
      .select()
      .from(missionHistory)
      .where(eq(missionHistory.sessionId, sessionId))
      .orderBy(desc(missionHistory.createdAt));
  }

  async logCommand(commandLog: InsertCommandLog): Promise<CommandLog> {
    const [savedLog] = await db
      .insert(commandLogs)
      .values(commandLog)
      .returning();
    return savedLog;
  }

  async getCommandHistory(sessionId: string): Promise<CommandLog[]> {
    return await db
      .select()
      .from(commandLogs)
      .where(eq(commandLogs.sessionId, sessionId))
      .orderBy(desc(commandLogs.executedAt))
      .limit(100); // Limit to last 100 commands
  }

  // Multiplayer room operations
  async createRoom(room: InsertRoom): Promise<MultiplayerRoom> {
    const [newRoom] = await db
      .insert(multiplayerRooms)
      .values(room)
      .returning();
    return newRoom;
  }

  async joinRoom(roomMember: InsertRoomMember): Promise<RoomMember> {
    const [member] = await db
      .insert(roomMembers)
      .values(roomMember)
      .returning();
    
    // Update room player count
    const activeMembers = await db
      .select()
      .from(roomMembers)
      .where(and(eq(roomMembers.roomId, roomMember.roomId), eq(roomMembers.isActive, true)));
    
    await db
      .update(multiplayerRooms)
      .set({ currentPlayers: activeMembers.length })
      .where(eq(multiplayerRooms.id, roomMember.roomId));
    
    return member;
  }

  async leaveRoom(roomId: number, userId: string): Promise<void> {
    await db
      .update(roomMembers)
      .set({ isActive: false })
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));
    
    // Update room player count
    const activeMembers = await db
      .select()
      .from(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.isActive, true)));
    
    await db
      .update(multiplayerRooms)
      .set({ currentPlayers: activeMembers.length })
      .where(eq(multiplayerRooms.id, roomId));
  }

  async getRoomByCode(roomCode: string): Promise<MultiplayerRoom | undefined> {
    const [room] = await db
      .select()
      .from(multiplayerRooms)
      .where(eq(multiplayerRooms.roomCode, roomCode));
    return room;
  }

  async getRoomMembers(roomId: number): Promise<RoomMember[]> {
    return await db
      .select()
      .from(roomMembers)
      .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.isActive, true)));
  }

  // Player stats operations
  async getPlayerStats(userId: string): Promise<PlayerStats | undefined> {
    const [stats] = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.userId, userId));
    return stats;
  }

  async updatePlayerStats(userId: string, stats: Partial<InsertPlayerStats>): Promise<PlayerStats> {
    const [updatedStats] = await db
      .update(playerStats)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(playerStats.userId, userId))
      .returning();
    return updatedStats;
  }

  // Extended user profile operations
  async createUserProfile(profileData: any): Promise<any> {
    // Store extended profile data in the user table
    const [user] = await db
      .insert(users)
      .values({
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.hackerName,
        profileImageUrl: profileData.profileImageUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          firstName: profileData.hackerName,
          email: profileData.email,
          profileImageUrl: profileData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Create initial player stats
    await this.updatePlayerStats(profileData.id, {
      totalPlayTime: 0,
      multiplayerWins: 0,
      multiplayerLosses: 0,
      bestCompletionTime: null,
      favoriteCommands: [],
      achievementsUnlocked: [],
    });

    return {
      ...user,
      ...profileData,
    };
  }

  async getUserProfile(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const stats = await this.getPlayerStats(userId);
    
    return {
      id: user.id,
      hackerName: user.firstName || 'Anonymous_Hacker',
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      joinDate: user.createdAt?.toISOString(),
      lastActive: user.updatedAt?.toISOString(),
      
      // Game Progress (from profile data or defaults)
      level: 1,
      experience: 0,
      reputation: 'Novice',
      credits: 1000,
      
      // Statistics
      totalMissions: 0,
      successfulMissions: 0,
      failedMissions: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPlayTime: stats?.totalPlayTime || 0,
      
      // Preferences
      hasCompletedTutorial: false,
      soundEnabled: true,
      difficulty: 'normal',
      preferredGameMode: 'single',
      
      // Achievements
      unlockedAchievements: stats?.achievementsUnlocked || [],
      unlockedCommands: ['help', 'scan', 'connect', 'missions'],
      unlockedPayloads: ['basic_payload'],
      
      // Save State
      currentGameState: null,
      savedMissions: [],
      inventory: [],
    };
  }

  async updateUserProfile(userId: string, updates: any): Promise<any> {
    // Update user table if needed
    if (updates.hackerName || updates.email || updates.profileImageUrl) {
      await db
        .update(users)
        .set({
          firstName: updates.hackerName,
          email: updates.email,
          profileImageUrl: updates.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Update player stats if needed
    const statsUpdates: any = {};
    if (updates.totalPlayTime !== undefined) statsUpdates.totalPlayTime = updates.totalPlayTime;
    if (updates.multiplayerWins !== undefined) statsUpdates.multiplayerWins = updates.multiplayerWins;
    if (updates.multiplayerLosses !== undefined) statsUpdates.multiplayerLosses = updates.multiplayerLosses;
    if (updates.bestCompletionTime !== undefined) statsUpdates.bestCompletionTime = updates.bestCompletionTime;
    if (updates.unlockedAchievements !== undefined) statsUpdates.achievementsUnlocked = updates.unlockedAchievements;

    if (Object.keys(statsUpdates).length > 0) {
      await this.updatePlayerStats(userId, statsUpdates);
    }

    // Return updated profile
    return this.getUserProfile(userId);
  }

  // Email verification operations
  async storeVerificationCode(data: any): Promise<void> {
    const query = `
      INSERT INTO verification_codes (email, hacker_name, code, expires_at)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [data.email, data.hackerName, data.code, data.expiresAt]);
  }

  async getVerificationCode(email: string, code: string): Promise<any> {
    const query = `
      SELECT * FROM verification_codes 
      WHERE email = $1 AND code = $2 AND used = false
      ORDER BY created_at DESC LIMIT 1
    `;
    const result = await pool.query(query, [email, code]);
    return result.rows[0];
  }

  async markVerificationCodeUsed(id: number): Promise<void> {
    const query = `UPDATE verification_codes SET used = true WHERE id = $1`;
    await pool.query(query, [id]);
  }

  async storeUnverifiedUser(userData: any): Promise<void> {
    const query = `
      INSERT INTO unverified_users (id, hacker_name, email, password, profile_image_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        id = $1, hacker_name = $2, password = $4, updated_at = $7
    `;
    await pool.query(query, [userData.id, userData.hackerName, userData.email, userData.password, userData.profileImageUrl, userData.createdAt, userData.updatedAt]);
  }

  async getUnverifiedUser(email: string): Promise<any> {
    const query = `SELECT * FROM unverified_users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  async deleteUnverifiedUser(email: string): Promise<void> {
    const query = `DELETE FROM unverified_users WHERE email = $1`;
    await pool.query(query, [email]);
  }
}

export const storage = new DatabaseStorage();
