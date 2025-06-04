// server/routes.ts (FINAL REFACTORED VERSION)

import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
// Remove: import { storage } from "./storage"; // <--- REMOVE THIS LINE!
// Remove: import { pool } from "./db"; // <--- REMOVE THIS LINE!

// NEW IMPORTS matching refactored db.ts and storage.ts
import { getDb, getPool } from "./db"; // <--- Import the getter functions
import { DatabaseStorage } from "./storage"; // <--- Import the DatabaseStorage CLASS

import { insertGameSaveSchema, insertMissionHistorySchema, insertCommandLogSchema } from "@shared/schema";
// import { MultiplayerWebSocketServer } from "./websocket"; // (Keep commented if not used)
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { EmailService } from "./emailService";
import { logger, authLogger, sessionLogger, logAuthEvent, logUserAction } from "./logger"; // Make sure these are defined/imported correctly
import { log } from "./vite"; // Your custom logger

// Authentication middleware
const isAuthenticated: RequestHandler = (req: any, res, next) => {
    // console.log('Auth check - Session exists:', !!req.session); // Debug logging
    // console.log('Auth check - User ID in session:', req.session?.userId); // Debug logging

    if (req.session && req.session.userId) {
        req.userId = req.session.userId; // CRITICAL: Attach userId to req for use in routes
        next();
    } else {
        // console.log('Authentication failed - no valid session'); // Debug logging
        res.status(401).json({ error: "Authentication required" });
    }
};

// Declare `storage` and `rawPool` (for connect-pg-simple) here, they will be assigned inside registerRoutes
let storage: DatabaseStorage;
let rawPoolForSessionStore: any; // Type should be Pool or Client from 'pg' or 'postgres'

export async function registerRoutes(app: Express): Promise<Server> {
    try {
        // --- CRITICAL FIX: Get initialized DB clients and instantiate storage ---
        const drizzleDb = getDb(); // Get the Drizzle instance
        rawPoolForSessionStore = getPool(); // Get the raw client for connect-pg-simple and direct queries

        // Instantiate DatabaseStorage with the ready clients
        storage = new DatabaseStorage(drizzleDb, rawPoolForSessionStore); // <--- Instantiate DatabaseStorage!
        // -------------------------------------------------------------------

        log('🔗 Setting up session management...');

        const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

        if (!process.env.SESSION_SECRET) {
            log('⚠️ SESSION_SECRET not set, using default (not secure for production)', 'warn');
        }

        let sessionStore: any;
        try {
            if (process.env.DATABASE_URL) {
                const pgStore = connectPg(session);
                sessionStore = new pgStore({
                    conString: process.env.DATABASE_URL,
                    createTableIfMissing: false,
                    ttl: sessionTtl,
                    tableName: "sessions",
                    pool: rawPoolForSessionStore // <--- Pass the raw pool here
                });
                log('✅ PostgreSQL session store initialized successfully');
            } else {
                log('❌ DATABASE_URL not available for session store, falling back to memory store.', 'error');
                sessionStore = new session.MemoryStore();
            }
        } catch (error) {
            log(`🔄 PostgreSQL session store failed, using memory store: ${(error as Error).message}`, 'error');
            sessionStore = new session.MemoryStore();
        }

        app.use(session({
            store: sessionStore,
            secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a strong secret!
            resave: false,
            saveUninitialized: false,
            name: 'sessionId',
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: sessionTtl,
                sameSite: 'lax',
                path: '/',
            },
        }));

        log('✅ Session middleware configured successfully');

        // --- CUSTOM AUTHENTICATION ROUTES ---
        app.post('/api/auth/register', async (req, res) => {
            try {
                const { hackerName, email, password } = req.body;
                // console.log('Registration request:', { hackerName, email, password: password ? '***' : 'missing' }); // Debug log

                if (!hackerName || !email || !password) {
                    return res.status(400).json({ error: "All fields are required" });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                // console.log('Password hashed successfully'); // Debug log

                const userId = uuidv4();
                // console.log('About to create user with:', { userId, hackerName, email, hashedPassword: hashedPassword.substring(0, 10) + '...' }); // Debug log

                const user = await storage.createUser({
                    id: userId,
                    hackerName,
                    email,
                    password: hashedPassword
                });

                (req.session as any).userId = userId;
                (req.session as any).hackerName = hackerName;

                res.json({
                    user: {
                        id: user.id,
                        hackerName: user.hackerName,
                        email: user.email,
                        profileImageUrl: user.profileImageUrl
                    }
                });
            } catch (error) {
                console.error("Registration error:", error);
                // More specific error handling
                if ((error as Error).message && (error as Error).message.includes('duplicate key value violates unique constraint "users_email_unique"')) {
                    return res.status(409).json({ error: "Email already registered" });
                }
                if ((error as Error).message && (error as Error).message.includes('duplicate key value violates unique constraint "users_hacker_name_unique"')) {
                    return res.status(409).json({ error: "Hacker name already taken" });
                }
                res.status(500).json({ error: "Registration failed" });
            }
        });

        app.post('/api/auth/verify', async (req, res) => {
            try {
                const { email, code } = req.body;

                const verification = await storage.getVerificationCode(email, code);
                if (!verification || verification.used || new Date() > verification.expiresAt) {
                    return res.status(400).json({ error: "Invalid or expired verification code" });
                }

                await storage.markVerificationCodeUsed(verification.id);

                const unverifiedUser = await storage.getUnverifiedUser(email);
                if (!unverifiedUser) {
                    return res.status(400).json({ error: "User data not found" });
                }

                const user = await storage.createUser(unverifiedUser);

                await storage.deleteUnverifiedUser(email);

                await EmailService.sendWelcomeEmail(email, unverifiedUser.hackerName);

                (req.session as any).userId = user.id;
                (req.session as any).hackerName = user.hackerName;

                res.json({
                    user: {
                        id: user.id,
                        hackerName: user.hackerName,
                        email: user.email,
                        profileImageUrl: user.profileImageUrl
                    }
                });
            } catch (error) {
                console.error("Verification error:", error);
                res.status(500).json({ error: "Verification failed" });
            }
        });

        app.post('/api/auth/login', async (req, res) => {
            let email: string | undefined;

            try {
                const requestData = req.body;
                email = requestData?.email;
                const password = requestData?.password;

                if (!email || !password) {
                    logAuthEvent('login_error', email || 'missing_credentials', false);
                    return res.status(400).json({ error: "Username/email and password are required" });
                }

                // Use storage method for login
                const user = await storage.getUserByEmail(email); // Use storage.getUserByEmail

                if (!user) {
                    logAuthEvent('login_failed', email, false);
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                if (!user.password || user.password.length === 0) {
                    console.log('No password found for user:', user.email);
                    logAuthEvent('login_failed', user.email || email, false);
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    // authLogger.warn(`Password validation failed for user: ${user.email}`); // Ensure authLogger is defined
                    logAuthEvent('login_failed', user.email || email, false);
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                (req.session as any).userId = user.id;
                (req.session as any).hackerName = user.hackerName;

                // sessionLogger.info(`Session created successfully for user: ${user.id.substring(0, 8)}...`); // Ensure sessionLogger is defined

                logAuthEvent('login_success', user.email || email, true);
                logUserAction(user.id, 'user_login', { email: user.email || email });

                res.json({
                    user: {
                        id: user.id,
                        hackerName: user.hackerName,
                        email: user.email,
                        profileImageUrl: user.profileImageUrl,
                        authenticated: true
                    },
                    sessionId: req.sessionID
                });
            } catch (error) {
                const safeEmail = email && typeof email === 'string' ? email.substring(0, 3) + '***' : 'unknown';
                // authLogger.error("Login error occurred", {
                //     error: error instanceof Error ? error.message : 'Unknown error',
                //     email: safeEmail
                // });
                logAuthEvent('login_error', email || 'unknown', false);
                res.status(500).json({ error: "Login failed due to server error" });
            }
        });

        app.post('/api/auth/logout', (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ error: "Logout failed" });
                }
                res.json({ message: "Logged out successfully" });
            });
        });

        // Set username for first-time users
        app.post("/api/user/set-username", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId; // Use req.userId from isAuthenticated
                const { username } = req.body;

                if (!userId) { // Safety check
                    return res.status(401).json({ error: "User not authenticated" });
                }

                if (!username || typeof username !== 'string') {
                    return res.status(400).json({ error: "Username is required" });
                }

                const trimmedUsername = username.trim();

                if (trimmedUsername.length < 3) {
                    return res.status(400).json({ error: "Username must be at least 3 characters long" });
                }

                if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
                    return res.status(400).json({ error: "Username can only contain letters, numbers, underscores, and hyphens" });
                }

                const existingUser = await storage.getUserByHackerName(trimmedUsername);
                if (existingUser && existingUser.id !== userId) {
                    return res.status(409).json({ error: "Username is already taken" });
                }

                const updatedUser = await storage.updateHackerName(userId, trimmedUsername);

                res.json({
                    user: {
                        id: updatedUser.id,
                        hackerName: updatedUser.hackerName,
                        email: updatedUser.email
                    }
                });
            } catch (error) {
                console.error("Username setting error:", error);
                res.status(500).json({ error: "Failed to set username" });
            }
        });

        app.get("/api/auth/user", async (req: any, res) => { // Removed isAuthenticated here if user profile is public
            try {
                // console.log('Auth check - Session exists:', !!req.session); // Debug log
                // console.log('Auth check - User ID in session:', req.session?.userId); // Debug log
                // console.log('Auth check - Session data:', req.session); // Debug log

                if (!req.session || !req.session.userId) {
                    return res.status(401).json({ error: "Authentication required" });
                }

                const userId = req.session.userId;
                const user = await storage.getUser(userId); // Use storage.getUser
                if (user) {
                    res.json({
                        id: user.id,
                        hackerName: user.hackerName,
                        email: user.email,
                        profileImageUrl: user.profileImageUrl
                    });
                } else {
                    res.status(404).json({ error: "User not found" });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                res.status(500).json({ error: "Failed to fetch user" });
            }
        });

        // Game state routes
        app.post("/api/game/save", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const gameState = insertGameSaveSchema.parse(req.body);
                const savedState = await storage.saveGameState({ ...gameState, userId, sessionId: req.sessionID }); // Ensure sessionId is passed from req.sessionID
                res.json(savedState);
            } catch (error) {
                console.error("Error saving game state:", error);
                if (error && typeof error === 'object' && 'issues' in error) {
                    return res.status(400).json({ error: "Invalid game state data", details: error.issues });
                }
                res.status(500).json({ error: "Failed to save game state" });
            }
        });

        app.get("/api/game/load/:gameMode?", isAuthenticated, async (req: any, res) => { // Changed :sessionId to :gameMode
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const gameMode = req.params.gameMode || 'single'; // Default game mode
                const gameState = await storage.getUserGameSave(userId, gameMode); // Use storage.getUserGameSave

                if (gameState) {
                    res.json(gameState);
                } else {
                    res.status(404).json({ error: "Game state not found for user in this mode" });
                }
            } catch (error) {
                console.error("Error loading game state:", error);
                res.status(500).json({ error: "Failed to load game state" });
            }
        });

        // Mission history routes
        app.post("/api/missions/save", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const mission = insertMissionHistorySchema.parse(req.body);
                const savedMission = await storage.saveMissionHistory({ ...mission, userId }); // Ensure userId is passed
                res.json(savedMission);
            } catch (error) {
                console.error("Error saving mission:", error);
                if (error && typeof error === 'object' && 'issues' in error) {
                    return res.status(400).json({ error: "Invalid mission data", details: error.issues });
                }
                res.status(500).json({ error: "Failed to save mission" });
            }
        });

        app.get("/api/missions/history/:gameMode?", isAuthenticated, async (req: any, res) => { // Changed :sessionId to :gameMode
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const gameMode = req.params.gameMode || 'single'; // Default game mode
                const missions = await storage.getMissionHistory(userId); // Get all missions for user

                res.json(missions);
            } catch (error) {
                console.error("Error getting mission history:", error);
                res.status(500).json({ error: "Failed to get mission history" });
            }
        });

        // Command logging routes
        app.post("/api/commands/log", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const commandLog = insertCommandLogSchema.parse(req.body);
                const savedLog = await storage.logCommand({ ...commandLog, userId }); // Ensure userId is passed
                res.json(savedLog);
            } catch (error) {
                console.error("Error logging command:", error);
                if (error && typeof error === 'object' && 'issues' in error) {
                    return res.status(400).json({ error: "Invalid command log data", details: error.issues });
                }
                res.status(500).json({ error: "Failed to log command" });
            }
        });

        app.get("/api/commands/history/:gameMode?", isAuthenticated, async (req: any, res) => { // Changed :sessionId to :gameMode
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const gameMode = req.params.gameMode || 'single'; // Default game mode
                const commands = await storage.getCommandHistory(userId); // Get all commands for user

                res.json(commands);
            } catch (error) {
                console.error("Error getting command history:", error);
                res.status(500).json({ error: "Failed to get command history" });
            }
        });

        // Multiplayer room routes
        app.post("/api/rooms/create", isAuthenticated, async (req: any, res) => { // Changed to require auth
            try {
                const userId = req.userId; // Use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const { name, gameMode, maxPlayers } = req.body;

                if (!name || !gameMode || !maxPlayers) {
                    return res.status(400).json({ error: "Name, game mode, and max players are required" });
                }

                const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

                const room = await storage.createRoom({
                    name,
                    roomCode,
                    hostUserId: userId,
                    gameMode: gameMode || 'cooperative',
                    maxPlayers: maxPlayers || 4,
                    currentPlayers: 0,
                    isActive: true
                });

                await storage.joinRoom({
                    roomId: room.id,
                    userId,
                    role: 'host',
                    isActive: true
                });

                res.json(room);
            } catch (error) {
                console.error("Error creating room:", error);
                res.status(500).json({ error: "Failed to create room" });
            }
        });

        app.post("/api/rooms/join/:roomCode", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId; // Corrected: use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const { roomCode } = req.params;

                const room = await storage.getRoomByCode(roomCode);
                if (!room) {
                    return res.status(404).json({ error: "Room not found" });
                }

                if (!room.isActive) {
                    return res.status(400).json({ error: "Room is no longer active" });
                }

                if (room.currentPlayers >= room.maxPlayers) {
                    return res.status(400).json({ error: "Room is full" });
                }

                const member = await storage.joinRoom({
                    roomId: room.id,
                    userId,
                    role: 'member',
                    isActive: true
                });

                res.json({ room, member });
            } catch (error) {
                console.error("Error joining room:", error);
                res.status(500).json({ error: "Failed to join room" });
            }
        });

        app.get("/api/rooms/:roomId/members", isAuthenticated, async (req, res) => {
            try {
                const { roomId } = req.params;
                const members = await storage.getRoomMembers(parseInt(roomId));
                res.json(members);
            } catch (error) {
                console.error("Error getting room members:", error);
                res.status(500).json({ error: "Failed to get room members" });
            }
        });

        app.post("/api/rooms/:roomId/leave", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId; // Corrected: use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const { roomId } = req.params;

                await storage.leaveRoom(parseInt(roomId), userId);
                res.json({ success: true });
            } catch (error) {
                console.error("Error leaving room:", error);
                res.status(500).json({ error: "Failed to leave room" });
            }
        });

        // Player stats routes
        app.get("/api/player/stats", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId; // Corrected: use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                let stats = await storage.getPlayerStats(userId);

                if (!stats) {
                    stats = await storage.updatePlayerStats(userId, {
                        userId,
                        totalMissions: 0,
                        successfulMissions: 0,
                        totalCredits: 1000,
                        reputation: 'UNKNOWN',
                        currentStreak: 0,
                        longestStreak: 0,
                        totalPlayTime: 0
                    });
                }

                res.json(stats);
            } catch (error) {
                console.error("Error getting player stats:", error);
                res.status(500).json({ error: "Failed to get player stats" });
            }
        });

        // Leaderboard endpoint
        app.get("/api/leaderboards", async (req, res) => {
            try {
                const gameSaves = await storage.getAllGameSaves();

                const leaderboards = {
                    missions: gameSaves
                        .map((save: any, index: number) => ({
                            rank: index + 1,
                            userId: save.userId || save.sessionId,
                            hackerName: save.hackerName || `Player_${(save.userId || save.sessionId).slice(-4)}`,
                            score: save.gameState?.completedMissions?.length || 0,
                            category: 'missions',
                            details: `${save.gameState?.completedMissions?.length || 0} missions`,
                            timestamp: save.updatedAt || new Date().toISOString()
                        }))
                        .sort((a: any, b: any) => b.score - a.score)
                        .slice(0, 10),

                    credits: gameSaves
                        .map((save: any, index: number) => ({
                            rank: index + 1,
                            userId: save.userId || save.sessionId,
                            hackerName: save.hackerName || `Player_${(save.userId || save.sessionId).slice(-4)}`,
                            score: save.gameState?.credits || 0,
                            category: 'credits',
                            details: `${save.gameState?.credits || 0}₡`,
                            timestamp: save.updatedAt || new Date().toISOString()
                        }))
                        .sort((a: any, b: any) => b.score - a.score)
                        .slice(0, 10),

                    speed: [],
                    multiplayer: []
                };

                res.json(leaderboards);
            } catch (error) {
                console.error("Error getting leaderboards:", error);
                res.json({
                    missions: [],
                    speed: [],
                    multiplayer: [],
                    credits: []
                });
            }
        });

        // AI Mission Generation endpoints
        app.post("/api/missions/generate", isAuthenticated, async (req: any, res) => {
            try {
                const { aiMissionGenerator } = await import('./aiMissionGenerator');
                const userId = req.userId; // Corrected: use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const { playerLevel, completedMissions, reputation } = req.body;

                const mission = await aiMissionGenerator.generateMission(
                    userId, // Pass userId for context
                    playerLevel || 1,
                    completedMissions || [],
                    reputation || 'Novice'
                );

                res.json(mission);
            } catch (error) {
                console.error("Error generating AI mission:", error);
                res.status(500).json({ error: "Failed to generate mission" });
            }
        });

        app.post("/api/missions/generate-batch", isAuthenticated, async (req: any, res) => {
            try {
                const { aiMissionGenerator } = await import('./aiMissionGenerator');
                const userId = req.userId; // Corrected: use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const { playerLevel, completedMissions, reputation, count } = req.body;

                const missions = await aiMissionGenerator.generateMissionBatch(
                    userId, // Pass userId for context
                    playerLevel || 1,
                    completedMissions || [],
                    reputation || 'Novice',
                    count || 3
                );

                res.json(missions);
            } catch (error) {
                console.error("Error generating AI mission batch:", error);
                res.status(500).json({ error: "Failed to generate missions" });
            }
        });

        // User Profile Management endpoints
        app.post("/api/user/profile", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId; // Corrected: use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const profileData = {
                    ...req.body,
                    userId,
                    id: userId
                };

                const profile = await storage.createUserProfile(profileData);
                res.json(profile);
            } catch (error) {
                console.error("Error creating user profile:", error);
                res.status(500).json({ error: "Failed to create user profile" });
            }
        });

        app.get("/api/user/profile", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId; // Corrected: use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const profile = await storage.getUserProfile(userId);
                res.json(profile);
            } catch (error) {
                console.error("Error loading user profile:", error);
                res.status(500).json({ error: "Failed to load user profile" });
            }
        });

        app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId; // Corrected: use req.userId
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const updates = req.body;
                const profile = await storage.updateUserProfile(userId, updates);
                res.json(profile);
            } catch (error) {
                console.error("Error updating user profile:", error);
                res.status(500).json({ error: "Failed to update user profile" });
            }
        });

        const httpServer = createServer(app);

        // WebSocket server will be initialized later to avoid conflicts
        // const wsServer = new MultiplayerWebSocketServer(httpServer);

        return httpServer;
    } catch (error) {
        console.error("Error setting up routes:", error);
        throw error;
    }
}