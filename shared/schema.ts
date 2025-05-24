import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  currentMission: integer("current_mission").notNull().default(0),
  credits: integer("credits").notNull().default(2847),
  reputation: text("reputation").notNull().default('TRUSTED'),
  completedMissions: integer("completed_missions").notNull().default(12),
  unlockedCommands: text("unlocked_commands").array().notNull().default(['help', 'scan', 'connect', 'status', 'clear', 'man']),
  missionProgress: integer("mission_progress").notNull().default(15),
  networkStatus: text("network_status").notNull().default('CONNECTED'),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  isBootComplete: boolean("is_boot_complete").notNull().default(false),
  currentNetwork: text("current_network"),
  playerLevel: integer("player_level").notNull().default(1),
  sessionId: text("session_id").notNull(),
  lastSaved: timestamp("last_saved").notNull().defaultNow(),
  gameData: jsonb("game_data").default({}),
});

export const missionHistory = pgTable("mission_history", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
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
  command: text("command").notNull(),
  args: text("args").array().default([]),
  success: boolean("success").notNull(),
  output: text("output").array().notNull(),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = z.infer<typeof insertGameSaveSchema>;
export type MissionHistory = typeof missionHistory.$inferSelect;
export type InsertMissionHistory = z.infer<typeof insertMissionHistorySchema>;
export type CommandLog = typeof commandLogs.$inferSelect;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
