import { 
  users, 
  gameSaves, 
  missionHistory, 
  commandLogs,
  type User, 
  type InsertUser, 
  type GameSave, 
  type InsertGameSave,
  type MissionHistory,
  type InsertMissionHistory,
  type CommandLog,
  type InsertCommandLog
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game save operations
  saveGameState(gameState: InsertGameSave): Promise<GameSave>;
  loadGameState(sessionId: string): Promise<GameSave | undefined>;
  
  // Mission history
  saveMissionHistory(mission: InsertMissionHistory): Promise<MissionHistory>;
  getMissionHistory(sessionId: string): Promise<MissionHistory[]>;
  
  // Command logging
  logCommand(commandLog: InsertCommandLog): Promise<CommandLog>;
  getCommandHistory(sessionId: string): Promise<CommandLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
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
