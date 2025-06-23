import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User accounts with Replit Auth integration
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID
  email: varchar("email").unique(),
  password: varchar("password").notNull(), // Added password field for custom auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Game-specific profile fields
  hackerName: varchar("hacker_name").unique(), // In-game username
  playerLevel: integer("player_level").notNull().default(1),
  totalMissionsCompleted: integer("total_missions_completed").notNull().default(0),
  totalCreditsEarned: integer("total_credits_earned").notNull().default(0),
  reputation: text("reputation").notNull().default('ROOKIE'),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
  isOnline: boolean("is_online").default(false),
  currentMode: text("current_mode").default('single'), // 'single' or 'multiplayer'
});

export const gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Links to users.id
  gameMode: text("game_mode").notNull().default('single'), // 'single' or 'multiplayer'
  currentMission: integer("current_mission").notNull().default(0),
  credits: integer("credits").notNull().default(1000),
  reputation: text("reputation").notNull().default('ROOKIE'),
  completedMissions: integer("completed_missions").notNull().default(0),
  unlockedCommands: text("unlocked_commands").array().notNull().default(['help', 'scan', 'connect', 'status', 'clear', 'shop', 'hackide', 'man']),
  missionProgress: integer("mission_progress").notNull().default(0),
  networkStatus: text("network_status").notNull().default('DISCONNECTED'),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  isBootComplete: boolean("is_boot_complete").notNull().default(false),
  currentNetwork: text("current_network"),
  inventory: text("inventory").array().notNull().default([]),
  skillTree: jsonb("skill_tree").default({}),
  sessionId: text("session_id").notNull(),
  lastSaved: timestamp("last_saved").notNull().defaultNow(),
  gameData: jsonb("game_data").default({}),
});

// Multiplayer-specific tables
export const multiplayerRooms = pgTable("multiplayer_rooms", {
  id: serial("id").primaryKey(),
  roomCode: varchar("room_code", { length: 8 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  hostUserId: varchar("host_user_id").notNull(),
  maxPlayers: integer("max_players").notNull().default(4),
  currentPlayers: integer("current_players").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  gameMode: text("game_mode").notNull().default('cooperative'), // 'cooperative', 'competitive', 'pvp'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const roomMembers = pgTable("room_members", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull().default('member'), // 'host', 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  totalPlayTime: integer("total_play_time").notNull().default(0), // in minutes
  totalMissions: integer("total_missions").notNull().default(0),
  favoriteCommands: text("favorite_commands").array().default([]),
  achievementsUnlocked: text("achievements_unlocked").array().default([]),
  multiplayerWins: integer("multiplayer_wins").notNull().default(0),
  multiplayerLosses: integer("multiplayer_losses").notNull().default(0),
  bestCompletionTime: integer("best_completion_time"), // fastest mission completion
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const missionHistory = pgTable("mission_history", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: varchar("user_id"),
  missionId: integer("mission_id").notNull(),
  title: text("title").notNull(),
  objective: text("objective").notNull(),
  status: text("status").notNull(),
  difficulty: text("difficulty").notNull(),
  reward: integer("reward").notNull(),
  timeLimit: integer("time_limit"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: varchar("user_id"),
  command: text("command").notNull(),
  args: text("args").array().default([]),
  success: boolean("success").notNull(),
  output: text("output").array().notNull(),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

// Email verification tables
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  hackerName: varchar("hacker_name"),
  // Store a hashed verification code (SHA-256 hex string)
  code: varchar("code", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const unverifiedUsers = pgTable("unverified_users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  hackerName: varchar("hacker_name").notNull(),
  password: varchar("password").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schema validations
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertGameSaveSchema = createInsertSchema(gameSaves).omit({
  id: true,
  lastSaved: true,
});

export const insertMissionHistorySchema = createInsertSchema(missionHistory).omit({
  id: true,
  createdAt: true,
});

export const insertCommandLogSchema = createInsertSchema(commandLogs).omit({
  id: true,
  executedAt: true,
});

export const insertRoomSchema = createInsertSchema(multiplayerRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoomMemberSchema = createInsertSchema(roomMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  updatedAt: true,
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({
  id: true,
  createdAt: true,
});

export const insertUnverifiedUserSchema = createInsertSchema(unverifiedUsers).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
export type MissionHistory = typeof missionHistory.$inferSelect;
export type InsertMissionHistory = z.infer<typeof insertMissionHistorySchema>;
export type CommandLog = typeof commandLogs.$inferSelect;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
export type MultiplayerRoom = typeof multiplayerRooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type RoomMember = typeof roomMembers.$inferSelect;
export type InsertRoomMember = z.infer<typeof insertRoomMemberSchema>;
export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type UnverifiedUser = typeof unverifiedUsers.$inferSelect;
export type InsertUnverifiedUser = z.infer<typeof insertUnverifiedUserSchema>;
