// server/storage.ts (Refactored to export class, not instance, and use passed dbClients)
// YOU NEED TO MAKE THESE CHANGES TO YOUR LOCAL storage.ts FILE

import {
  users, gameSaves, missionHistory, commandLogs, multiplayerRooms, roomMembers, playerStats,
  type User, type GameSave, type MissionHistory, type CommandLog, type MultiplayerRoom, type RoomMember, type PlayerStats,
  type UpsertUser, type InsertGameSave, type InsertMissionHistory, type InsertCommandLog, type InsertRoom, type InsertRoomMember, type InsertPlayerStats,
} from "@shared/schema";
// REMOVE THIS LINE: import { db, pool } from "./db"; // <--- REMOVE THIS LINE from your actual file

// Import necessary types for the database client (assuming you use `postgres` and Drizzle)
import { Pool as NodePgPool } from "pg"; // For node-postgres Pool if used
import { Sql as PostgresJsClient } from "postgres"; // For postgres.js client (you use this for `pool` in db.ts)
import { PgDatabase } from "drizzle-orm/pg-core"; // For Drizzle DB instance type
import { PgColumn } from "drizzle-orm/pg-core"; // For Column types in Drizzle

import { eq, and, desc } from "drizzle-orm"; // Drizzle ORM functions
import { log } from "./vite"; // Import log function for consistent logging

export interface IStorage {
    // ... (your existing IStorage interface) ...
}

export class DatabaseStorage implements IStorage {
    // Constructor now takes the fully initialized dbClient (which is `db` from db.ts and `pool` from db.ts)
    // You are passing both the Drizzle instance (`db`) and the raw client (`pool`)
    constructor(private drizzleDb: PgDatabase<any, any>, private rawPool: PostgresJsClient | NodePgPool) {
        // `this.drizzleDb` will be your Drizzle instance (`db` from `db.ts`)
        // `this.rawPool` will be your postgres.js client (`pool` from `db.ts`)
        
        // DEBUG: Log what we're actually receiving
        console.log('=== DatabaseStorage Constructor Debug ===');
        console.log('drizzleDb type:', typeof drizzleDb);
        console.log('drizzleDb defined:', !!drizzleDb);
        console.log('rawPool type:', typeof rawPool);
        console.log('rawPool defined:', !!rawPool);
        console.log('rawPool.query type:', typeof (rawPool as any)?.query);
        console.log('rawPool constructor:', rawPool?.constructor?.name);
        console.log('rawPool is function:', typeof rawPool === 'function');
        console.log('================================================');
    }

    private normalizeUserRow(row: any): any {
        if (!row) return row;
        return {
            ...row,
            hackerName: row.hacker_name ?? row.hackerName,
            profileImageUrl: row.profile_image_url ?? row.profileImageUrl,
            createdAt: row.created_at ?? row.createdAt,
            updatedAt: row.updated_at ?? row.updatedAt,
            joinedAt: row.joined_at ?? row.joinedAt,
            lastActive: row.last_active ?? row.lastActive,
            playerLevel: row.player_level ?? row.playerLevel,
            totalMissionsCompleted: row.total_missions_completed ?? row.totalMissionsCompleted,
            totalCreditsEarned: row.total_credits_earned ?? row.totalCreditsEarned,
            isOnline: row.is_online ?? row.isOnline,
            currentMode: row.current_mode ?? row.currentMode
        };
    }

    private normalizeUnverifiedUserRow(row: any): any {
        if (!row) return row;
        return {
            ...row,
            hackerName: row.hacker_name ?? row.hackerName,
            profileImageUrl: row.profile_image_url ?? row.profileImageUrl,
            createdAt: row.created_at ?? row.createdAt,
            updatedAt: row.updated_at ?? row.updatedAt,
        };
    }

    // --- USER OPERATIONS ---
    // Change all `db.select()` to `this.drizzleDb.select()`
    // Change all `pool.query()` (if using NodePgPool) to `(this.rawPool as NodePgPool).query()`
    // Change all `await pool` (if using postgres.js client) to `await this.rawPool`

    async getUser(id: string): Promise<User | undefined> {
        const [user] = await this.drizzleDb.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByEmail(email: string): Promise<any> {
        // Handle both Neon Pool and postgres.js client
        try {
            let result: any;
            if (typeof (this.rawPool as any).query === 'function') {
                // Neon Pool with .query() method
                result = await (this.rawPool as any).query('SELECT * FROM users WHERE email = $1', [email]);
                return this.normalizeUserRow(result.rows[0]);
            } else {
                // postgres.js client with template literals
                result = await (this.rawPool as PostgresJsClient)`SELECT * FROM users WHERE email = ${email}`;
                return this.normalizeUserRow(result[0]);
            }
        } catch (error) {
            console.error('Error in getUserByEmail:', error);
            throw error;
        }
    }

    async getUserByHackerName(hackerName: string): Promise<User | undefined> {
        const [user] = await this.drizzleDb.select().from(users).where(eq(users.hackerName, hackerName));
        return user;
    }

    async createUser(userData: any): Promise<User> {
        if (typeof (this.rawPool as any).query === 'function') {
            // Neon Pool
            await (this.rawPool as any).query(`
                INSERT INTO users (
                    id, email, password, hacker_name,
                    player_level, total_missions_completed, total_credits_earned,
                    reputation, created_at, updated_at, joined_at, last_active,
                    is_online, current_mode
                ) VALUES (
                    $1, $2, $3, $4, 1, 0, 0, 'ROOKIE',
                    NOW(), NOW(), NOW(), NOW(), false, 'single'
                )
            `, [userData.id, userData.email, userData.password, userData.hackerName]);

            const result = await (this.rawPool as any).query(
                'SELECT id, email, hacker_name, profile_image_url FROM users WHERE id = $1',
                [userData.id]
            );
            return this.normalizeUserRow(result.rows[0]);
        } else {
            // postgres.js client
            await (this.rawPool as PostgresJsClient)`
            INSERT INTO users (
                id, email, password, hacker_name,
                player_level, total_missions_completed, total_credits_earned,
                reputation, created_at, updated_at, joined_at, last_active,
                is_online, current_mode
            ) VALUES (
                ${userData.id},
                ${userData.email},
                ${userData.password},
                ${userData.hackerName},
                1, 0, 0, 'ROOKIE',
                NOW(), NOW(), NOW(), NOW(),
                false, 'single'
            )
        `;

            const result = await (this.rawPool as PostgresJsClient)`
                SELECT id, email, hacker_name, profile_image_url
                FROM users
                WHERE id = ${userData.id}
            `;
            return this.normalizeUserRow(result[0] as any);
        }
    }

    async updateHackerName(userId: string, hackerName: string): Promise<User> {
        const [user] = await this.drizzleDb
            .update(users)
            .set({ hackerName, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        return user;
    }

    async getUserGameSave(userId: string, gameMode: string): Promise<GameSave | undefined> {
        const [save] = await this.drizzleDb
            .select()
            .from(gameSaves)
            .where(and(eq(gameSaves.userId, userId), eq(gameSaves.gameMode, gameMode)))
            .orderBy(desc(gameSaves.lastSaved));
        return save;
    }

    async saveGameState(gameState: InsertGameSave): Promise<GameSave> {
        const [existingSave] = await this.drizzleDb
            .select()
            .from(gameSaves)
            .where(eq(gameSaves.sessionId, gameState.sessionId));

        if (existingSave) {
            const [updatedSave] = await this.drizzleDb
                .update(gameSaves)
                .set(gameState)
                .where(eq(gameSaves.sessionId, gameState.sessionId))
                .returning();
            return updatedSave;
        } else {
            const [newSave] = await this.drizzleDb
                .insert(gameSaves)
                .values(gameState)
                .returning();
            return newSave;
        }
    }

    async loadGameState(sessionId: string): Promise<GameSave | undefined> {
        try {
            const [save] = await this.drizzleDb
                .select()
                .from(gameSaves)
                .where(eq(gameSaves.sessionId, sessionId))
                .orderBy(desc(gameSaves.lastSaved));
            return save || undefined;
        } catch (error) {
            console.log("Database schema updating, falling back to client storage");
            return undefined;
        }
    }

    async getAllGameSaves(): Promise<GameSave[]> {
        try {
            return await this.drizzleDb
                .select()
                .from(gameSaves)
                .orderBy(desc(gameSaves.lastSaved));
        } catch (error) {
            console.log("Error getting all game saves:", error);
            return [];
        }
    }

    async saveMissionHistory(mission: InsertMissionHistory): Promise<MissionHistory> {
        const [savedMission] = await this.drizzleDb
            .insert(missionHistory)
            .values(mission)
            .returning();
        return savedMission;
    }

    async getMissionHistory(sessionId: string): Promise<MissionHistory[]> {
        return await this.drizzleDb
            .select()
            .from(missionHistory)
            .where(eq(missionHistory.sessionId, sessionId))
            .orderBy(desc(missionHistory.createdAt));
    }

    async logCommand(commandLog: InsertCommandLog): Promise<CommandLog> {
        const [savedLog] = await this.drizzleDb
            .insert(commandLogs)
            .values(commandLog)
            .returning();
        return savedLog;
    }

    async getCommandHistory(sessionId: string): Promise<CommandLog[]> {
        return await this.drizzleDb
            .select()
            .from(commandLogs)
            .where(eq(commandLogs.sessionId, sessionId))
            .orderBy(desc(commandLogs.executedAt))
            .limit(100);
    }

    async createRoom(room: InsertRoom): Promise<MultiplayerRoom> {
        const [newRoom] = await this.drizzleDb
            .insert(multiplayerRooms)
            .values(room)
            .returning();
        return newRoom;
    }

    async joinRoom(roomMember: InsertRoomMember): Promise<RoomMember> {
        const [member] = await this.drizzleDb
            .insert(roomMembers)
            .values(roomMember)
            .returning();

        const activeMembers = await this.drizzleDb
            .select()
            .from(roomMembers)
            .where(and(eq(roomMembers.roomId, roomMember.roomId), eq(roomMembers.isActive, true)));

        await this.drizzleDb
            .update(multiplayerRooms)
            .set({ currentPlayers: activeMembers.length })
            .where(eq(multiplayerRooms.id, roomMember.roomId));

        return member;
    }

    async leaveRoom(roomId: number, userId: string): Promise<void> {
        await this.drizzleDb
            .update(roomMembers)
            .set({ isActive: false })
            .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));

        const activeMembers = await this.drizzleDb
            .select()
            .from(roomMembers)
            .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.isActive, true)));

        await this.drizzleDb
            .update(multiplayerRooms)
            .set({ currentPlayers: activeMembers.length })
            .where(eq(multiplayerRooms.id, roomId));
    }

    async getRoomByCode(roomCode: string): Promise<MultiplayerRoom | undefined> {
        const [room] = await this.drizzleDb
            .select()
            .from(multiplayerRooms)
            .where(eq(multiplayerRooms.roomCode, roomCode));
        return room;
    }

    async getRoomMembers(roomId: number): Promise<RoomMember[]> {
        return await this.drizzleDb
            .select()
            .from(roomMembers)
            .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.isActive, true)));
    }

    async getPlayerStats(userId: string): Promise<PlayerStats | undefined> {
        const [stats] = await this.drizzleDb
            .select()
            .from(playerStats)
            .where(eq(playerStats.userId, userId));
        return stats;
    }

    async updatePlayerStats(userId: string, stats: Partial<InsertPlayerStats>): Promise<PlayerStats> {
        const [updatedStats] = await this.drizzleDb
            .update(playerStats)
            .set({ ...stats, updatedAt: new Date() })
            .where(eq(playerStats.userId, userId))
            .returning();
        return updatedStats;
    }

    async createUserProfile(profileData: any): Promise<any> {
        const [user] = await this.drizzleDb
            .insert(users)
            .values({
                id: profileData.id,
                email: profileData.email,
                hackerName: profileData.hackerName,
                profileImageUrl: profileData.profileImageUrl,
                password: profileData.password || ''
            })
            .onConflictDoUpdate({
                target: users.id,
                set: {
                    hackerName: profileData.hackerName,
                    email: profileData.email,
                    profileImageUrl: profileData.profileImageUrl,
                    updatedAt: new Date(),
                },
            })
            .returning();

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
            hackerName: user.hackerName || 'Anonymous_Hacker',
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            joinDate: user.createdAt?.toISOString(),
            lastActive: user.updatedAt?.toISOString(),

            level: user.playerLevel || 1,
            experience: user.totalMissionsCompleted || 0,
            reputation: user.reputation || 'Novice',
            credits: user.totalCreditsEarned || 1000,

            totalMissions: stats?.totalMissions || 0,
            multiplayerWins: stats?.multiplayerWins || 0,
            multiplayerLosses: stats?.multiplayerLosses || 0,
            bestCompletionTime: stats?.bestCompletionTime || null,
            totalPlayTime: stats?.totalPlayTime || 0,

            hasCompletedTutorial: false,
            soundEnabled: true,
            difficulty: 'normal',
            preferredGameMode: 'single',

            unlockedAchievements: stats?.achievementsUnlocked || [],
            unlockedCommands: ['help', 'scan', 'connect', 'status', 'clear', 'shop', 'hackide'],
            unlockedPayloads: ['basic_payload'],

            currentGameState: null,
            savedMissions: [],
            inventory: [],
        };
    }

    async updateUserProfile(userId: string, updates: any): Promise<any> {
        const userUpdates: any = {};
        if (updates.hackerName !== undefined) userUpdates.hackerName = updates.hackerName;
        if (updates.email !== undefined) userUpdates.email = updates.email;
        if (updates.profileImageUrl !== undefined) userUpdates.profileImageUrl = updates.profileImageUrl;

        if (Object.keys(userUpdates).length > 0) {
            await this.drizzleDb
                .update(users)
                .set({ ...userUpdates, updatedAt: new Date() })
                .where(eq(users.id, userId));
        }

        const statsUpdates: Partial<InsertPlayerStats> = {};
        if (updates.totalPlayTime !== undefined) statsUpdates.totalPlayTime = updates.totalPlayTime;
        if (updates.multiplayerWins !== undefined) statsUpdates.multiplayerWins = updates.multiplayerWins;
        if (updates.multiplayerLosses !== undefined) statsUpdates.multiplayerLosses = updates.multiplayerLosses;
        if (updates.bestCompletionTime !== undefined) statsUpdates.bestCompletionTime = updates.bestCompletionTime;
        if (updates.unlockedAchievements !== undefined) statsUpdates.achievementsUnlocked = updates.unlockedAchievements;

        if (Object.keys(statsUpdates).length > 0) {
            await this.updatePlayerStats(userId, statsUpdates);
        }

        return this.getUserProfile(userId);
    }

    // Email verification operations
    async storeVerificationCode(data: any): Promise<void> {
        console.log(`DEBUG: Storing verification code - email: ${data.email}, hacker_name: ${data.hackerName}, code: ${data.code}, expires_at: ${data.expiresAt}`);
        if (typeof (this.rawPool as any).query === 'function') {
            // Neon Pool
            await (this.rawPool as any).query(
                'INSERT INTO verification_codes (email, hacker_name, code, expires_at, used) VALUES ($1, $2, $3, $4, false)',
                [data.email, data.hackerName, data.code, data.expiresAt]
            );
            console.log(`DEBUG: Verification code stored successfully using Neon Pool`);
        } else {
            // postgres.js client
            await (this.rawPool as PostgresJsClient)`
                INSERT INTO verification_codes (email, hacker_name, code, expires_at, used)
                VALUES (${data.email}, ${data.hackerName}, ${data.code}, ${data.expiresAt}, false)
            `;
            console.log(`DEBUG: Verification code stored successfully using postgres.js`);
        }
    }

    async getVerificationCode(email: string, code: string): Promise<any> {
        console.log(`DEBUG: Looking up verification code - email: ${email}, code: ${code}`);
        if (typeof (this.rawPool as any).query === 'function') {
            // Neon Pool
            const result = await (this.rawPool as any).query(
                'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND used = false ORDER BY created_at DESC LIMIT 1',
                [email, code]
            );
            console.log(`DEBUG: Neon Pool query result:`, result.rows[0] ? 'Found' : 'Not found', result.rows[0] || 'No record');
            return result.rows[0];
        } else {
            // postgres.js client
            const result = await (this.rawPool as PostgresJsClient)`
            SELECT * FROM verification_codes
                WHERE email = ${email} AND code = ${code} AND used = false
            ORDER BY created_at DESC LIMIT 1
        `;
            console.log(`DEBUG: postgres.js query result:`, result[0] ? 'Found' : 'Not found', result[0] || 'No record');
            return result[0];
        }
    }

    async markVerificationCodeUsed(id: number): Promise<void> {
        if (typeof (this.rawPool as any).query === 'function') {
            // Neon Pool
            await (this.rawPool as any).query('UPDATE verification_codes SET used = true WHERE id = $1', [id]);
        } else {
            // postgres.js client
            await (this.rawPool as PostgresJsClient)`UPDATE verification_codes SET used = true WHERE id = ${id}`;
        }
    }

    async storeUnverifiedUser(userData: any): Promise<void> {
        try {
            log(`DEBUG: Attempting to store unverified user: ${userData.email}. User ID: ${userData.id}`, 'auth');
            console.log(`DEBUG: storeUnverifiedUser - Raw data:`, {
                id: userData.id,
                hackerName: userData.hackerName,
                email: userData.email,
                password: userData.password ? '[REDACTED]' : 'MISSING',
                profileImageUrl: userData.profileImageUrl || null
            });

            if (typeof (this.rawPool as any).query === 'function') {
                // Neon Pool
                console.log(`DEBUG: Using Neon Pool for storeUnverifiedUser`);
                await (this.rawPool as any).query(`
                    INSERT INTO unverified_users (id, hacker_name, email, password, profile_image_url, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                    ON CONFLICT (email) DO UPDATE SET
                        id = $1, hacker_name = $2, password = $4, profile_image_url = $5, updated_at = NOW()
                `, [userData.id, userData.hackerName, userData.email, userData.password, userData.profileImageUrl]);
                log(`DEBUG: Unverified user stored successfully using Neon Pool for email: ${userData.email}`, 'auth');
            } else {
                // postgres.js client
                console.log(`DEBUG: Using postgres.js client for storeUnverifiedUser`);
                await (this.rawPool as PostgresJsClient)`
            INSERT INTO unverified_users (id, hacker_name, email, password, profile_image_url, created_at, updated_at)
                    VALUES (${userData.id}, ${userData.hackerName}, ${userData.email}, ${userData.password}, ${userData.profileImageUrl}, NOW(), NOW())
            ON CONFLICT (email) DO UPDATE SET
                        id = ${userData.id}, hacker_name = ${userData.hackerName}, password = ${userData.password}, profile_image_url = ${userData.profileImageUrl}, updated_at = NOW()
                `;
                log(`DEBUG: Unverified user stored successfully using postgres.js for email: ${userData.email}`, 'auth');
            }

        } catch (error) {
            log(`CRITICAL ERROR: Failed to store unverified user: ${userData.email} - ${(error as Error).message}`, 'error');
            console.error("FULL STACK ERROR: Storing unverified user failed:", error);
            throw error; // Re-throw to ensure it's caught by register route and results in a 500
        }
    }

    async getUnverifiedUser(email: string): Promise<any> {
        log(`DEBUG: Attempting to retrieve unverified user for email: ${email}`, 'auth');
        try {
            if (typeof (this.rawPool as any).query === 'function') {
                // Neon Pool
                console.log(`DEBUG: Using Neon Pool for getUnverifiedUser`);
                const result = await (this.rawPool as any).query('SELECT * FROM unverified_users WHERE email = $1', [email]);
                if (result && result.rows && result.rows.length > 0) {
                    log(`DEBUG: getUnverifiedUser result for ${email}: Found record with ID ${result.rows[0].id}`, 'auth');
                    return this.normalizeUnverifiedUserRow(result.rows[0]);
                } else {
                    log(`DEBUG: getUnverifiedUser result for ${email}: Not found in DB (Neon Pool)`, 'auth');
                    return undefined;
                }
            } else {
                // postgres.js client
                console.log(`DEBUG: Using postgres.js client for getUnverifiedUser`);
                const result = await (this.rawPool as PostgresJsClient)`SELECT * FROM unverified_users WHERE email = ${email}`;
                if (result && result.length > 0) {
                    log(`DEBUG: getUnverifiedUser result for ${email}: Found record with ID ${result[0].id}`, 'auth');
                    return this.normalizeUnverifiedUserRow(result[0]);
                } else {
                    log(`DEBUG: getUnverifiedUser result for ${email}: Not found in DB (postgres.js)`, 'auth');
                    return undefined;
                }
            }
        } catch (error) {
            log(`ERROR: Failed to retrieve unverified user: ${email} - ${(error as Error).message}`, 'error');
            console.error("FULL STACK ERROR: Retrieving unverified user failed:", error);
            throw error;
        }
    }

    async deleteUnverifiedUser(email: string): Promise<void> {
        if (typeof (this.rawPool as any).query === 'function') {
            // Neon Pool
            await (this.rawPool as any).query('DELETE FROM unverified_users WHERE email = $1', [email]);
        } else {
            // postgres.js client
            await (this.rawPool as PostgresJsClient)`DELETE FROM unverified_users WHERE email = ${email}`;
        }
    }
}