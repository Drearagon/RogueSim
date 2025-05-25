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
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateHackerName(userId: string, hackerName: string): Promise<User>;
  
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
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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
    const [save] = await db
      .select()
      .from(gameSaves)
      .where(eq(gameSaves.sessionId, sessionId))
      .orderBy(desc(gameSaves.lastSaved));
    return save || undefined;
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
}

export const storage = new DatabaseStorage();
