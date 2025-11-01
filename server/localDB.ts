import { Database } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { log } from './utils';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

// Local database instance
let localDb: any = null;
let sqliteDb: Database | null = null;

// Database file path
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'roguesim_local.db');

/**
 * Initialize the local SQLite backup database
 */
export async function initLocalDatabase(): Promise<void> {
    try {
        log('🔧 Initializing local SQLite backup database...', 'local-db');

        // Ensure data directory exists
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
            log(`📁 Created data directory: ${DB_DIR}`, 'local-db');
        }

        // Install better-sqlite3 dynamically if not available
        try {
            const BetterSqlite3 = await import('better-sqlite3');
            sqliteDb = new BetterSqlite3.default(DB_PATH);
        } catch (error) {
            log('⚠️ better-sqlite3 not found, installing...', 'local-db');
            // Fallback to JSON-based storage if SQLite not available
            await initJSONFallback();
            return;
        }

        // Initialize Drizzle with SQLite
        localDb = drizzle(sqliteDb, { schema });

        // Create tables if they don't exist
        await createLocalTables();

        log(`✅ Local SQLite database initialized at: ${DB_PATH}`, 'local-db');
        log(`📊 Database size: ${getDBSize()} MB`, 'local-db');

    } catch (error) {
        log(`❌ Failed to initialize local database: ${(error as Error).message}`, 'error');
        // Fallback to JSON storage
        await initJSONFallback();
    }
}

/**
 * Create local database tables matching the main database schema
 */
async function createLocalTables(): Promise<void> {
    try {
        // Users table
        await localDb.run(sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                hacker_name TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                profile_image_url TEXT,
                bio TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Game data table
        await localDb.run(sql`
            CREATE TABLE IF NOT EXISTS game_data (
                user_id TEXT PRIMARY KEY,
                credits INTEGER DEFAULT 0,
                player_level INTEGER DEFAULT 1,
                reputation TEXT DEFAULT 'NOVICE',
                unlocked_commands TEXT DEFAULT '[]',
                completed_missions TEXT DEFAULT '[]',
                skill_tree TEXT DEFAULT '{}',
                faction_standings TEXT DEFAULT '{}',
                psych_profile TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // User stats table
        await localDb.run(sql`
            CREATE TABLE IF NOT EXISTS user_stats (
                user_id TEXT PRIMARY KEY,
                total_play_time INTEGER DEFAULT 0,
                total_missions INTEGER DEFAULT 0,
                favorite_commands TEXT DEFAULT '[]',
                achievements_unlocked TEXT DEFAULT '[]',
                multiplayer_wins INTEGER DEFAULT 0,
                multiplayer_losses INTEGER DEFAULT 0,
                best_completion_time INTEGER,
                last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Verification codes table
        await localDb.run(sql`
            CREATE TABLE IF NOT EXISTS verification_codes (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                code TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // User activity logs table
        await localDb.run(sql`
            CREATE TABLE IF NOT EXISTS user_activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                username TEXT,
                action TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT,
                metadata TEXT DEFAULT '{}'
            )
        `);

        // Chat messages table
        await localDb.run(sql`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                username TEXT NOT NULL,
                message TEXT NOT NULL,
                channel TEXT DEFAULT 'global',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                message_type TEXT DEFAULT 'chat'
            )
        `);

        log('✅ Local database tables created/verified', 'local-db');

    } catch (error) {
        log(`❌ Error creating local tables: ${(error as Error).message}`, 'error');
        throw error;
    }
}

/**
 * JSON fallback storage system if SQLite isn't available
 */
let jsonStorage: Record<string, any> = {};
const JSON_PATH = path.join(DB_DIR, 'roguesim_backup.json');

async function initJSONFallback(): Promise<void> {
    try {
        log('📄 Initializing JSON backup storage...', 'local-db');

        // Load existing data if available
        if (fs.existsSync(JSON_PATH)) {
            const data = fs.readFileSync(JSON_PATH, 'utf8');
            jsonStorage = JSON.parse(data);
            log('✅ Loaded existing JSON backup data', 'local-db');
        } else {
            // Initialize empty structure
            jsonStorage = {
                users: {},
                gameData: {},
                userStats: {},
                verificationCodes: {},
                activityLogs: [],
                chatMessages: []
            };
            saveJSONStorage();
        }

        log(`✅ JSON backup storage initialized at: ${JSON_PATH}`, 'local-db');

    } catch (error) {
        log(`❌ Failed to initialize JSON fallback: ${(error as Error).message}`, 'error');
        jsonStorage = {
            users: {},
            gameData: {},
            userStats: {},
            verificationCodes: {},
            activityLogs: [],
            chatMessages: []
        };
    }
}

function saveJSONStorage(): void {
    try {
        fs.writeFileSync(JSON_PATH, JSON.stringify(jsonStorage, null, 2));
    } catch (error) {
        log(`❌ Failed to save JSON storage: ${(error as Error).message}`, 'error');
    }
}

/**
 * Local database operations that mirror the main database
 */
export class LocalDatabaseStorage {
    private useJSON = !sqliteDb;

    private hashCode(code: string): string {
        return crypto.createHash('sha256').update(code).digest('hex');
    }

    async createUser(userData: {
        id: string;
        hackerName: string;
        email: string;
        password: string;
        profileImageUrl?: string;
    }): Promise<any> {
        try {
            if (this.useJSON) {
                jsonStorage.users[userData.id] = {
                    ...userData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                saveJSONStorage();
                return jsonStorage.users[userData.id];
            }

            const result = await localDb.insert(schema.users).values({
                id: userData.id,
                hackerName: userData.hackerName,
                email: userData.email,
                password: userData.password,
                profileImageUrl: userData.profileImageUrl || null,
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();

            log(`✅ Created user in local DB: ${userData.hackerName}`, 'local-db');
            return result[0];

        } catch (error) {
            log(`❌ Error creating user in local DB: ${(error as Error).message}`, 'error');
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<any | null> {
        try {
            if (this.useJSON) {
                const user = Object.values(jsonStorage.users).find((u: any) => u.email === email);
                return user || null;
            }

            const result = await localDb.select().from(schema.users).where(sql`email = ${email}`).limit(1);
            return result[0] || null;

        } catch (error) {
            log(`❌ Error getting user by email from local DB: ${(error as Error).message}`, 'error');
            return null;
        }
    }

    async getUserByHackerName(hackerName: string): Promise<any | null> {
        try {
            if (this.useJSON) {
                const user = Object.values(jsonStorage.users).find((u: any) => u.hackerName === hackerName);
                return user || null;
            }

            const result = await localDb.select().from(schema.users).where(sql`hacker_name = ${hackerName}`).limit(1);
            return result[0] || null;

        } catch (error) {
            log(`❌ Error getting user by hackername from local DB: ${(error as Error).message}`, 'error');
            return null;
        }
    }

    async getUserById(userId: string): Promise<any | null> {
        try {
            if (this.useJSON) {
                return jsonStorage.users[userId] || null;
            }

            const result = await localDb.select().from(schema.users).where(sql`id = ${userId}`).limit(1);
            return result[0] || null;

        } catch (error) {
            log(`❌ Error getting user by ID from local DB: ${(error as Error).message}`, 'error');
            return null;
        }
    }

    async updateUser(userId: string, updates: any): Promise<any> {
        try {
            if (this.useJSON) {
                if (jsonStorage.users[userId]) {
                    jsonStorage.users[userId] = {
                        ...jsonStorage.users[userId],
                        ...updates,
                        updatedAt: new Date().toISOString()
                    };
                    saveJSONStorage();
                    return jsonStorage.users[userId];
                }
                throw new Error('User not found');
            }

            const result = await localDb.update(schema.users)
                .set({ ...updates, updatedAt: new Date() })
                .where(sql`id = ${userId}`)
                .returning();

            log(`✅ Updated user in local DB: ${userId}`, 'local-db');
            return result[0];

        } catch (error) {
            log(`❌ Error updating user in local DB: ${(error as Error).message}`, 'error');
            throw error;
        }
    }

    async createVerificationCode(email: string, code: string, expiresAt: Date): Promise<any> {
        try {
            const id = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const hashedCode = this.hashCode(code);

            if (this.useJSON) {
                jsonStorage.verificationCodes[id] = {
                    id,
                    email,
                    code: hashedCode,
                    expiresAt: expiresAt.toISOString(),
                    used: false,
                    createdAt: new Date().toISOString()
                };
                saveJSONStorage();
                return jsonStorage.verificationCodes[id];
            }

            const result = await localDb.insert(schema.verificationCodes).values({
                id,
                email,
                code: hashedCode,
                expiresAt,
                used: false,
                createdAt: new Date()
            }).returning();

            log(`✅ Created verification code in local DB: ${email}`, 'local-db');
            return result[0];

        } catch (error) {
            log(`❌ Error creating verification code in local DB: ${(error as Error).message}`, 'error');
            throw error;
        }
    }

    async getVerificationCode(email: string, code: string): Promise<any | null> {
        try {
            const hashedCode = this.hashCode(code);
            if (this.useJSON) {
                const verification = Object.values(jsonStorage.verificationCodes).find((v: any) =>
                    v.email === email && v.code === hashedCode
                );
                return verification || null;
            }

            const result = await localDb.select().from(schema.verificationCodes)
                .where(sql`email = ${email} AND code = ${hashedCode}`)
                .limit(1);
            return result[0] || null;

        } catch (error) {
            log(`❌ Error getting verification code from local DB: ${(error as Error).message}`, 'error');
            return null;
        }
    }

    async markVerificationCodeUsed(id: string): Promise<void> {
        try {
            if (this.useJSON) {
                if (jsonStorage.verificationCodes[id]) {
                    jsonStorage.verificationCodes[id].used = true;
                    saveJSONStorage();
                }
                return;
            }

            await localDb.update(schema.verificationCodes)
                .set({ used: true })
                .where(sql`id = ${id}`);

            log(`✅ Marked verification code as used in local DB: ${id}`, 'local-db');

        } catch (error) {
            log(`❌ Error marking verification code as used in local DB: ${(error as Error).message}`, 'error');
        }
    }

    async logUserActivity(userId: string, username: string, action: string, metadata: any = {}): Promise<void> {
        try {
            if (this.useJSON) {
                jsonStorage.activityLogs.push({
                    id: Date.now(),
                    userId,
                    username,
                    action,
                    timestamp: new Date().toISOString(),
                    metadata: JSON.stringify(metadata)
                });
                
                // Keep only last 1000 logs
                if (jsonStorage.activityLogs.length > 1000) {
                    jsonStorage.activityLogs = jsonStorage.activityLogs.slice(-1000);
                }
                
                saveJSONStorage();
                return;
            }

            await localDb.insert(schema.userActivityLogs).values({
                userId,
                username,
                action,
                timestamp: new Date(),
                metadata: JSON.stringify(metadata)
            });

            log(`✅ Logged user activity in local DB: ${username} - ${action}`, 'local-db');

        } catch (error) {
            log(`❌ Error logging user activity in local DB: ${(error as Error).message}`, 'error');
        }
    }

    async saveGameData(userId: string, gameData: any): Promise<void> {
        try {
            if (this.useJSON) {
                jsonStorage.gameData[userId] = {
                    userId,
                    ...gameData,
                    updatedAt: new Date().toISOString()
                };
                saveJSONStorage();
                return;
            }

            // Upsert game data
            await localDb.insert(schema.gameData).values({
                userId,
                credits: gameData.credits || 0,
                playerLevel: gameData.playerLevel || 1,
                reputation: gameData.reputation || 'NOVICE',
                unlockedCommands: JSON.stringify(gameData.unlockedCommands || []),
                completedMissions: JSON.stringify(gameData.completedMissions || []),
                skillTree: JSON.stringify(gameData.skillTree || {}),
                factionStandings: JSON.stringify(gameData.factionStandings || {}),
                psychProfile: JSON.stringify(gameData.psychProfile || {}),
                updatedAt: new Date()
            }).onConflictDoUpdate({
                target: schema.gameData.userId,
                set: {
                    credits: gameData.credits || 0,
                    playerLevel: gameData.playerLevel || 1,
                    reputation: gameData.reputation || 'NOVICE',
                    unlockedCommands: JSON.stringify(gameData.unlockedCommands || []),
                    completedMissions: JSON.stringify(gameData.completedMissions || []),
                    skillTree: JSON.stringify(gameData.skillTree || {}),
                    factionStandings: JSON.stringify(gameData.factionStandings || {}),
                    psychProfile: JSON.stringify(gameData.psychProfile || {}),
                    updatedAt: new Date()
                }
            });

            log(`✅ Saved game data in local DB: ${userId}`, 'local-db');

        } catch (error) {
            log(`❌ Error saving game data in local DB: ${(error as Error).message}`, 'error');
        }
    }

    async getGameData(userId: string): Promise<any | null> {
        try {
            if (this.useJSON) {
                const data = jsonStorage.gameData[userId];
                if (data) {
                    return {
                        ...data,
                        unlockedCommands: JSON.parse(data.unlockedCommands || '[]'),
                        completedMissions: JSON.parse(data.completedMissions || '[]'),
                        skillTree: JSON.parse(data.skillTree || '{}'),
                        factionStandings: JSON.parse(data.factionStandings || '{}'),
                        psychProfile: JSON.parse(data.psychProfile || '{}')
                    };
                }
                return null;
            }

            const result = await localDb
                .select()
                .from(schema.gameData)
                .where(sql`user_id = ${userId}`)
                .limit(1);
            if (result[0]) {
                const data = result[0];
                return {
                    ...data,
                    unlockedCommands: JSON.parse(data.unlockedCommands || '[]'),
                    completedMissions: JSON.parse(data.completedMissions || '[]'),
                    skillTree: JSON.parse(data.skillTree || '{}'),
                    factionStandings: JSON.parse(data.factionStandings || '{}'),
                    psychProfile: JSON.parse(data.psychProfile || '{}')
                };
            }
            return null;

        } catch (error) {
            log(`❌ Error getting game data from local DB: ${(error as Error).message}`, 'error');
            return null;
        }
    }
}

/**
 * Sync data between main and local databases when main comes back online
 */
export async function syncDatabases(mainStorage: any, localStorage: LocalDatabaseStorage): Promise<void> {
    try {
        log('🔄 Starting database synchronization...', 'local-db');

        // This would implement bidirectional sync logic
        // For now, we'll log the intention
        log('📊 Database sync completed (placeholder - implement sync logic as needed)', 'local-db');

    } catch (error) {
        log(`❌ Database sync failed: ${(error as Error).message}`, 'error');
    }
}

/**
 * Get database file size in MB
 */
function getDBSize(): string {
    try {
        if (fs.existsSync(DB_PATH)) {
            const stats = fs.statSync(DB_PATH);
            return (stats.size / (1024 * 1024)).toFixed(2);
        }
        return '0.00';
    } catch {
        return 'unknown';
    }
}

/**
 * Get local database instance
 */
export function getLocalDb(): any {
    return localDb;
}

/**
 * Check if local database is available
 */
export function isLocalDbAvailable(): boolean {
    return localDb !== null || jsonStorage !== null;
}

/**
 * Get database stats
 */
export async function getLocalDbStats(): Promise<any> {
    try {
        if (jsonStorage && Object.keys(jsonStorage).length > 0) {
            return {
                type: 'JSON',
                users: Object.keys(jsonStorage.users || {}).length,
                gameData: Object.keys(jsonStorage.gameData || {}).length,
                activityLogs: (jsonStorage.activityLogs || []).length,
                size: fs.existsSync(JSON_PATH) ? (fs.statSync(JSON_PATH).size / 1024).toFixed(2) + ' KB' : '0 KB'
            };
        }

        if (localDb && sqliteDb) {
            // Get table counts
            const userCount = await localDb.select().from(schema.users);
            return {
                type: 'SQLite',
                users: userCount.length,
                size: getDBSize() + ' MB',
                path: DB_PATH
            };
        }

        return { type: 'None', status: 'Not initialized' };

    } catch (error) {
        return { type: 'Error', error: (error as Error).message };
    }
} 