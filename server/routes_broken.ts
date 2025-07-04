// server/routes.ts (FINAL REFACTORED VERSION)

import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
// Remove: import { storage } from "./storage"; // <--- REMOVE THIS LINE!
// Remove: import { pool } from "./db"; // <--- REMOVE THIS LINE!

// NEW IMPORTS matching refactored db.ts and storage.ts
import { getDb, getPool, isUsingLocalFallback } from "./db"; // <--- Import the getter functions
import { DatabaseStorage } from "./storage"; // <--- Import the DatabaseStorage CLASS

import { insertGameSaveSchema, insertMissionHistorySchema, insertCommandLogSchema } from "@shared/schema";
// import { MultiplayerWebSocketServer } from "./websocket"; // (Keep commented if not used)
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import connectPg from "connect-pg-simple";
// import csurf from "csurf";
import { sendVerificationEmail, sendWelcomeEmail } from "./emailService";
import { logger, authLogger, sessionLogger, logAuthEvent, logUserAction } from "./logger"; // Make sure these are defined/imported correctly
import { log } from "./vite"; // Your custom logger
import crypto from "crypto"; // Add crypto import for secure random generation
// import rateLimit from "express-rate-limit";

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
        // --- NEON MIGRATION: Proper DatabaseStorage instantiation ---
        let db: any;
        let pool: any;
        if (isUsingLocalFallback()) {
            const { getLocalDb } = await import('./localDB');
            db = getLocalDb();
            pool = getLocalDb();
            log('📊 DatabaseStorage instantiated with local fallback', 'db');
        } else {
            db = getDb();
            pool = getPool();
            log('📊 DatabaseStorage instantiated with Neon/PostgreSQL clients', 'db');
        }
        storage = new DatabaseStorage(db, pool);
        
        // COMMENTED OUT OLD APPROACH:
        // storage = getStorage(); // Get storage instance (handles main/local fallback automatically)
        
        // For session store, try to get raw pool, fallback to memory store if local DB
        try {
            if (!isUsingLocalFallback()) {
                rawPoolForSessionStore = getPool(); // Get the raw client for connect-pg-simple
                log('📊 Using main database for sessions and storage', 'db');
            } else {
                rawPoolForSessionStore = null; // Will use memory store for sessions
                log('📊 Using local database for storage, memory store for sessions', 'db');
            }
        } catch (error) {
            rawPoolForSessionStore = null;
            log('⚠️ Could not get database pool, will use memory session store', 'db');
        }
        // ------------------------------------------------------------------------

        log('🔗 Setting up session management...');

        const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

        if (!process.env.SESSION_SECRET) {
            log('⚠️ SESSION_SECRET not set, using default (not secure for production)', 'warn');
        }

        let sessionStore: any;
        try {
            if (rawPoolForSessionStore && !isUsingLocalFallback()) {
                const pgStore = connectPg(session);
                sessionStore = new pgStore({
                    conString: process.env.DATABASE_URL,
                    createTableIfMissing: false,
                    ttl: sessionTtl,
                    tableName: "sessions",
                    pool: rawPoolForSessionStore
                });
                log('✅ PostgreSQL session store initialized successfully');
            } else {
                log('🔄 Using memory session store (local database mode)', 'db');
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

        // Rate limiting for auth routes (disabled for now)
        const authLimiter = (req: any, res: any, next: any) => {
            // Simple rate limiting - could be enhanced with Redis
            next();
        };

        // --- CSRF PROTECTION MIDDLEWARE ---
        // const csrfProtection = csurf();
        // app.use(csrfProtection);

        // Endpoint to retrieve CSRF token
        app.get('/api/csrf', (req, res) => {
            res.json({ csrfToken: 'disabled' });
        });

        // --- DEBUG TEST ENDPOINT ---
        app.get('/api/test', (req, res) => {
            log('DEBUG: /api/test route HIT!', 'debug');
            res.json({ 
                message: 'API routes are working!', 
                timestamp: new Date().toISOString(),
                headers: req.headers,
                method: req.method,
                url: req.url
            });
        });

        // --- DATABASE STATUS ENDPOINT ---
        app.get('/api/status', async (req, res) => {
            try {
                const status: any = {
                    database: isUsingLocalFallback() ? 'LOCAL_BACKUP' : 'MAIN_DATABASE',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                };

                if (isUsingLocalFallback()) {
                    const { getLocalDbStats } = await import('./localDB');
                    const localStats = await getLocalDbStats();
                    status.localDatabase = localStats;
                }

                res.json(status);
            } catch (error) {
                res.status(500).json({ error: 'Failed to get status' });
            }
        });

        // --- CUSTOM AUTHENTICATION ROUTES ---
        app.post('/api/auth/register', authLimiter, async (req, res) => {
            log('DEBUG: /api/auth/register route HIT!', 'auth'); // NEW LOG
            try {
                const { hackerName, email, password } = req.body;
                log(`DEBUG: Registration request for email: ${email}, hackerName: ${hackerName}`, 'auth'); // NEW LOG

                if (!hackerName || !email || !password) {
                    return res.status(400).json({ error: "All fields are required" });
                }

                // Validate email format
                if (!isValidEmail(email)) {
                    return res.status(400).json({ error: "Invalid email format" });
                }

                // Normalize email
                const normalizedEmail = email.toLowerCase().trim();

                // Check if user already exists in either table
                const existingUser = await storage.getUserByEmail(normalizedEmail);
                const existingHackerName = await storage.getUserByHackerName(hackerName);
                const existingUnverifiedUser = await storage.getUnverifiedUser(normalizedEmail);

                if (existingUser) {
                    return res.status(409).json({ error: "Email already registered" });
                }
                if (existingHackerName) {
                    return res.status(409).json({ error: "Hacker name already taken" });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const userId = uuidv4();

                log(`DEBUG: Creating unverified user record`, 'auth'); // NEW LOG

                // Store user data temporarily in unverified_users table
                await storage.storeUnverifiedUser({
                    id: userId,
                    hackerName,
                    email: normalizedEmail,
                    password: hashedPassword,
                    profileImageUrl: null
                });

                log(`DEBUG: Unverified user stored, now sending verification email`, 'auth'); // NEW LOG

                // Generate and send verification code
                const code = generateSecureVerificationCode();
                const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

                await storage.storeVerificationCode({
                    email: normalizedEmail,
                    hackerName: hackerName,
                    code,
                    expiresAt
                });

                // Send verification email
                const emailSent = await sendVerificationEmail(normalizedEmail, code, hackerName);

                if (emailSent) {
                    log(`DEBUG: Verification email sent successfully`, 'auth'); // NEW LOG
                    res.json({ 
                        message: "Registration successful! Please check your email for verification code.",
                        success: true,
                        requiresVerification: true
                    });
                } else {
                    log(`DEBUG: Verification email failed, but registration completed`, 'auth'); // NEW LOG
                    console.log(`📧 Fallback: Verification code for ${normalizedEmail}: ${code}`);
                    res.json({ 
                        message: "Registration successful! Verification code generated (email service temporarily unavailable)",
                        success: true,
                        requiresVerification: true
                    });
                }
            } catch (error) {
                console.error("Registration error:", error);
                res.status(500).json({ error: "Registration failed" });
            }
        });

        app.post('/api/auth/verify', authLimiter, async (req, res) => {
            log('DEBUG: /api/auth/verify route HIT!', 'auth'); // NEW LOG
            try {
                const { email, code } = req.body;
                log(`DEBUG: Verify request for email: ${email}, code: ${code}`, 'auth'); // NEW LOG

                // Input validation
                if (!email || typeof email !== 'string' || !isValidEmail(email)) {
                    return res.status(400).json({ error: "Valid email is required" });
                }

                if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
                    return res.status(400).json({ error: "Valid 6-digit verification code is required" });
                }

                // Normalize email
                const normalizedEmail = email.toLowerCase().trim();
                log(`DEBUG: Normalized email: ${normalizedEmail}`, 'auth'); // NEW LOG

                // First check: getVerificationCode call
                const verification = await storage.getVerificationCode(normalizedEmail, code);
                log(`DEBUG: Verification record found: ${JSON.stringify(verification)}`, 'auth'); // NEW LOG

                if (!verification) {
                    log(`DEBUG: Verification failed - No record found for email/code.`, 'auth'); // NEW LOG
                    logAuthEvent('verification_failed', normalizedEmail, false); // More specific logging
                    return res.status(400).json({ error: "Invalid or expired verification code" });
                }

                // Check if already used
                if (verification.used) {
                    log(`DEBUG: Verification failed - Code already used.`, 'auth'); // NEW LOG
                    logAuthEvent('verification_failed', normalizedEmail, false); // More specific logging
                    return res.status(400).json({ error: "Invalid or expired verification code" });
                }

                // Check for expiration
                const now = new Date();
                const expiresAt = new Date(verification.expires_at || verification.expiresAt); // Handle both column names
                log(`DEBUG: Current time: ${now.toISOString()}, Code expires: ${expiresAt.toISOString()}`, 'auth'); // NEW LOG

                if (now > expiresAt) {
                    log(`DEBUG: Verification failed - Code expired.`, 'auth'); // NEW LOG
                    logAuthEvent('verification_failed', normalizedEmail, false); // More specific logging
                    return res.status(400).json({ error: "Invalid or expired verification code" });
                }

                // If all checks pass:
                log(`DEBUG: Verification successful for email: ${normalizedEmail}`, 'auth'); // NEW LOG

                // Get unverified user first before marking code as used
                const unverifiedUser = await storage.getUnverifiedUser(normalizedEmail);
                if (!unverifiedUser) {
                    log(`DEBUG: Verification failed - Unverified user not found in database`, 'auth');
                    return res.status(400).json({ error: "User registration data not found. Please register again." });
                }

                const hackerName = unverifiedUser.hackerName || (verification as any).hackerName;

                // Mark code as used only after confirming user exists
                await storage.markVerificationCodeUsed(verification.id);

                // Create the verified user account
                const userCreationData = {
                    ...unverifiedUser,
                    hackerName
                };
                const user = await storage.createUser(userCreationData);

                // Clean up unverified user data
                await storage.deleteUnverifiedUser(normalizedEmail);

                // Send welcome email (non-blocking)
                sendWelcomeEmail(normalizedEmail, hackerName).catch(err => {
                    console.warn("Welcome email failed to send:", err);
                });

                // Log successful verification
                logAuthEvent('verification_success', normalizedEmail, true);

                // Create authenticated session
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

        app.post('/api/auth/login', authLimiter, async (req, res) => {
            let identifier: string | undefined;

            try {
                const requestData = req.body;
                identifier = requestData?.email; // Can be email or hackername
                const password = requestData?.password;

                if (!identifier || !password) {
                    logAuthEvent('login_error', identifier || 'missing_credentials', false);
                    return res.status(400).json({ error: "Username/email and password are required" });
                }

                // Try to find user by email first, then by hackername
                let user = await storage.getUserByEmail(identifier);
                if (!user) {
                    user = await storage.getUserByHackerName(identifier);
                }

                if (!user) {
                    logAuthEvent('login_failed', identifier, false);
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                if (!user.password || user.password.length === 0) {
                    console.log('No password found for user:', user.email);
                    logAuthEvent('login_failed', user.email || identifier, false);
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    logAuthEvent('login_failed', user.email || identifier, false);
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                logAuthEvent('login_success', user.email || identifier, true);

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
                console.error("Login error:", error);
                logAuthEvent('login_error', identifier || 'system_error', false);
                res.status(500).json({ error: "Login failed" });
            }
        });

        app.post('/api/auth/logout', async (req, res) => {
            try {
                if (req.session) {
                    const userId = (req.session as any).userId;
                    if (userId) {
                        logUserAction(userId, 'logout');
                    }

                    req.session.destroy((err: any) => {
                        if (err) {
                            console.error('Session destruction error:', err);
                            return res.status(500).json({ error: "Failed to logout" });
                        }
                        res.clearCookie('sessionId');
                        res.json({ message: "Logged out successfully" });
                    });
                } else {
                    res.json({ message: "Already logged out" });
                }
            } catch (error) {
                console.error("Logout error:", error);
                res.status(500).json({ error: "Logout failed" });
            }
        });

        // GET current authenticated user
        app.get('/api/auth/user', async (req: any, res) => {
            log('DEBUG: /api/auth/user route HIT!', 'auth'); // NEW LOG
            try {
                if (!req.session || !req.session.userId) {
                    log('DEBUG: /api/auth/user - Auth required.', 'auth'); // NEW LOG
                    return res.status(401).json({ error: "Authentication required" });
                }
                const userId = req.session.userId;
                log(`DEBUG: /api/auth/user - Fetching user ${userId}`, 'auth'); // NEW LOG
                const user = await storage.getUser(userId);
                if (user) {
                    log(`DEBUG: /api/auth/user - Found user ${user.email}`, 'auth'); // NEW LOG
                    res.json({
                        id: user.id, 
                        hackerName: user.hackerName, 
                        email: user.email, 
                        profileImageUrl: user.profileImageUrl
                    });
                } else {
                    log('DEBUG: /api/auth/user - User not found in DB.', 'auth'); // NEW LOG
                    res.status(404).json({ error: "User not found" });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                res.status(500).json({ error: "Failed to fetch user" });
            }
        });

        // Generate cryptographically secure verification code
        const generateSecureVerificationCode = (): string => {
            // Generate 6-digit code using crypto.randomInt for security
            return crypto.randomInt(100000, 999999).toString();
        };

        // Validate email format
        const isValidEmail = (email: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email) && email.length <= 254;
        };

        // Send verification code endpoint - EXACT COPY of /api/auth/register
        // This endpoint does exactly the same thing as register for compatibility
        app.post('/api/auth/send-verification', authLimiter, async (req, res) => {
            log('DEBUG: /api/auth/send-verification route HIT! (IDENTICAL TO REGISTER)', 'auth');
            try {
                const { hackerName, email, password } = req.body;
                log(`DEBUG: Send-verification request for email: ${email}, hackerName: ${hackerName}`, 'auth');

                if (!hackerName || !email || !password) {
                    return res.status(400).json({ error: "All fields are required" });
                }

                // Validate email format
                if (!isValidEmail(email)) {
                    return res.status(400).json({ error: "Invalid email format" });
                }

                // Normalize email
                const normalizedEmail = email.toLowerCase().trim();

                // Check if user already exists in either table
                const existingUser = await storage.getUserByEmail(normalizedEmail);
                const existingHackerName = await storage.getUserByHackerName(hackerName);
                const existingUnverifiedUser = await storage.getUnverifiedUser(normalizedEmail);

                if (existingUser) {
                    return res.status(409).json({ error: "Email already registered" });
                }
                if (existingHackerName) {
                    return res.status(409).json({ error: "Hacker name already taken" });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const userId = uuidv4();

                log(`DEBUG: Send-verification creating unverified user record`, 'auth');

                // Store user data temporarily in unverified_users table
                await storage.storeUnverifiedUser({
                    id: userId,
                    hackerName,
                    email: normalizedEmail,
                    password: hashedPassword,
                    profileImageUrl: null
                });

                log(`DEBUG: Send-verification unverified user stored, now sending verification email`, 'auth');

                // Generate and send verification code
                const code = generateSecureVerificationCode();
                const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

                await storage.storeVerificationCode({
                    email: normalizedEmail,
                    hackerName: hackerName,
                    code,
                    expiresAt
                });

                // Send verification email
                const emailSent = await sendVerificationEmail(normalizedEmail, code, hackerName);

                if (emailSent) {
                    log(`DEBUG: Send-verification email sent successfully`, 'auth');
                    res.json({ 
                        message: "Registration successful! Please check your email for verification code.",
                        success: true,
                        requiresVerification: true
                    });
                } else {
                    log(`DEBUG: Send-verification email failed, but registration completed`, 'auth');
                    console.log(`📧 Fallback: Verification code for ${normalizedEmail}: ${code}`);
                    res.json({ 
                        message: "Registration successful! Verification code generated (email service temporarily unavailable)",
                        success: true,
                        requiresVerification: true
                    });
                }
            } catch (error) {
                console.error("Send-verification error:", error);
                res.status(500).json({ error: "Registration failed" });
            }
        });

        // Game state routes
        app.post("/api/game/save", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                // Extract gameState from request body and prepare data for schema validation
                const { gameState, gameMode = 'single', sessionId: clientSessionId } = req.body;
                
                // Prepare the full game save data with all required fields
                const gameSaveData = {
                    userId,
                    sessionId: req.sessionID,
                    gameMode,
                    // Extract individual fields from gameState for schema validation
                    currentMission: gameState?.currentMission || 0,
                    credits: gameState?.credits || 1000,
                    reputation: gameState?.reputation || 'ROOKIE',
                    completedMissions: gameState?.completedMissions || 0,
                    unlockedCommands: gameState?.unlockedCommands || ['help', 'scan', 'connect', 'status', 'clear', 'shop', 'hackide'],
                    missionProgress: gameState?.missionProgress || 0,
                    networkStatus: gameState?.networkStatus || 'DISCONNECTED',
                    soundEnabled: gameState?.soundEnabled ?? true,
                    isBootComplete: gameState?.isBootComplete ?? false,
                    currentNetwork: gameState?.currentNetwork || null,
                    inventory: gameState?.inventory ? 
                        (Array.isArray(gameState.inventory) ? gameState.inventory : 
                         [JSON.stringify(gameState.inventory)]) : [],
                    skillTree: gameState?.skillTree || {},
                    gameData: gameState || {}
                };

                const validatedGameSave = insertGameSaveSchema.parse(gameSaveData);
                const savedState = await storage.saveGameState(validatedGameSave);
                res.json(savedState);
            } catch (error) {
                console.error("Error saving game state:", error);
                if (error && typeof error === 'object' && 'issues' in error) {
                    return res.status(400).json({ error: "Invalid game state data", details: error.issues });
                }
                res.status(500).json({ error: "Failed to save game state" });
            }
        });

        app.get("/api/game/load/:gameMode?", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const gameMode = req.params.gameMode || 'single';
                const gameState = await storage.getUserGameSave(userId, gameMode);

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

                const { command, args = [], success = true } = req.body;
                
                // Prepare command log data with all required fields
                const commandLogData = {
                    userId,
                    sessionId: req.sessionID,
                    command,
                    args,
                    success,
                    output: [`Command '${command}' executed ${success ? 'successfully' : 'with errors'}`]
                };

                const validatedCommandLog = insertCommandLogSchema.parse(commandLogData);
                const savedLog = await storage.logCommand(validatedCommandLog);
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
                        totalPlayTime: 0,
                        multiplayerWins: 0,
                        multiplayerLosses: 0,
                        bestCompletionTime: null,
                        achievementsUnlocked: [],
                        favoriteCommands: []
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

        // Add the update-profile route that the frontend expects
        app.post("/api/user/update-profile", isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const updates = req.body;
                
                // If hackername change is requested, validate password
                if (updates.hackerName && updates.currentPassword) {
                    try {
                        // Get user from database to verify password
                        const user = await storage.getUser(userId);
                        if (!user) {
                            return res.status(404).json({ error: "User not found" });
                        }
                        
                        // Verify password using bcryptjs (using existing import)
                        const isPasswordValid = await bcrypt.compare(updates.currentPassword, user.password);
                        if (!isPasswordValid) {
                            return res.status(401).json({ error: "Invalid password" });
                        }
                    } catch (passwordError) {
                        console.error("Password verification failed:", passwordError);
                        return res.status(401).json({ error: "Password verification failed" });
                    }
                }

                // Remove currentPassword from updates before saving
                const { currentPassword, ...profileUpdates } = updates;
                
                const profile = await storage.updateUserProfile(userId, profileUpdates);
                res.json(profile);
            } catch (error) {
                console.error("Error updating user profile:", error);
                res.status(500).json({ error: "Failed to update user profile" });
            }
        });


        // Create HTTP server for the application  
        const server = createServer(app);

        log('✅ HTTP Server created successfully');
        
        return server;
        // WebSocket connection handling
        wss.on('connection', (ws, req) => {
            console.log('New WebSocket connection established');

            const sock = ws as any;
            let userId: string | null = null;
            let username: string | null = null;

            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    const { type, payload } = message;

                    switch (type) {
                        case 'authenticate':
                            if (payload.userId) {
                                userId = String(payload.userId);
                                userConnections.set(userId, ws);
                            }
                            if (payload.hackerName) {
                                username = String(payload.hackerName);
                            }
                            break;

                        case 'join_global_chat':
                            if (payload.userId && payload.username) {
                                userId = String(payload.userId);
                                username = String(payload.username);
                            }
                            globalChatConnections.add(ws);
                            if (userId) {
                                onlinePlayers.set(userId, username || userId);
                            }
                            ws.send(JSON.stringify({
                                type: 'user_joined',
                                payload: { username, timestamp: new Date().toISOString() }
                            }));
                            const playerList = Array.from(onlinePlayers, ([id, name]) => ({ id, username: name }));
                            const listMsg = { type: 'player_list_update', payload: { players: playerList } };
                            globalChatConnections.forEach(client => {
                                if (client.readyState === ws.OPEN) {
                                    client.send(JSON.stringify(listMsg));
                                }
                            });
                            break;

                        case 'join_room':
                            if (typeof payload.roomId === 'number') {
                                roomConnections.set(payload.roomId, roomConnections.get(payload.roomId) || new Set());
                                roomConnections.get(payload.roomId)!.add(ws);
                                sock.roomId = payload.roomId;
                                if (username) {
                                    roomConnections.get(payload.roomId)!.forEach(client => {
                                        if (client !== ws && client.readyState === ws.OPEN) {
                                            client.send(JSON.stringify({
                                                type: 'player_joined',
                                                payload: { hackerName: username, userId, timestamp: new Date().toISOString() }
                                            }));
                                        }
                                    });
                                }
                                try {
                                    const members = await storage.getRoomMembers(payload.roomId);
                                    ws.send(JSON.stringify({ type: 'room_state', payload: { members, roomId: payload.roomId } }));
                                } catch (err) {
                                    console.error('Failed to get room members:', err);
                                }
                                const count = roomConnections.get(payload.roomId)!.size;
                                const syncMsg = { type: 'sync_status', payload: { memberCount: count } };
                                roomConnections.get(payload.roomId)!.forEach(client => {
                                    if (client.readyState === ws.OPEN) client.send(JSON.stringify(syncMsg));
                                });
                            }
                            break;

                        case 'leave_room':
                            if (sock.roomId !== undefined) {
                                const roomSet = roomConnections.get(sock.roomId);
                                if (roomSet) {
                                    roomSet.delete(ws);
                                    roomSet.forEach(client => {
                                        if (client.readyState === ws.OPEN) {
                                            client.send(JSON.stringify({
                                                type: 'player_left',
                                                payload: { hackerName: username, userId, timestamp: new Date().toISOString() }
                                            }));
                                        }
                                    });
                                    const count = roomSet.size;
                                    const syncMsg = { type: 'sync_status', payload: { memberCount: count } };
                                    roomSet.forEach(client => {
                                        if (client.readyState === ws.OPEN) client.send(JSON.stringify(syncMsg));
                                    });
                                }
                                sock.roomId = undefined;
                            }
                            break;

                        case 'send_message':
                            const msgPayload = {
                                type: 'chat_message',
                                payload: {
                                    id: Date.now(),
                                    userId: payload.userId || userId,
                                    username: payload.username || username,
                                    message: payload.message,
                                    timestamp: new Date().toISOString(),
                                    messageType: payload.channel === 'team' ? 'team' : 'chat'
                                }
                            };
                            if (payload.channel === 'room' && sock.roomId !== undefined) {
                                const roomSet = roomConnections.get(sock.roomId);
                                roomSet?.forEach(client => {
                                    if (client.readyState === ws.OPEN) {
                                        client.send(JSON.stringify(msgPayload));
                                    }
                                });
                            } else if (globalChatConnections.has(ws)) {
                                globalChatConnections.forEach(client => {
                                    if (client.readyState === ws.OPEN) {
                                        client.send(JSON.stringify(msgPayload));
                                    }
                                });
                            }
                            break;

                        case 'send_private_message':
                            const targetWs = userConnections.get(String(payload.targetUserId));
                            if (targetWs && targetWs.readyState === ws.OPEN) {
                                const privateMsg = {
                                    type: 'private_message',
                                    payload: {
                                        id: Date.now(),
                                        fromUserId: userId,
                                        toUserId: String(payload.targetUserId),
                                        username: username,
                                        message: payload.message,
                                        timestamp: new Date().toISOString()
                                    }
                                };
                                targetWs.send(JSON.stringify(privateMsg));
                            }
                            break;

                        case 'ping':
                            ws.send(JSON.stringify({ type: 'pong' }));
                            if (sock.roomId !== undefined) {
                                const roomSet = roomConnections.get(sock.roomId);
                                const count = roomSet ? roomSet.size : 0;
                                ws.send(JSON.stringify({ type: 'sync_status', payload: { memberCount: count } }));
                            }
                            break;

                        default:
                            console.log('Unknown message type:', type);
                    }
                } catch (error) {
                    console.error('Error handling WebSocket message:', error);
                    ws.send(JSON.stringify({ 
                        type: 'error', 
                        payload: { message: 'Invalid message format' }
                    }));
                }
            });

            ws.on('close', () => {
                console.log('WebSocket connection closed');

                globalChatConnections.delete(ws);

                if (sock.roomId !== undefined) {
                    const roomSet = roomConnections.get(sock.roomId);
                    if (roomSet) {
                        roomSet.delete(ws);
                        roomSet.forEach(client => {
                            if (client.readyState === ws.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'player_left',
                                    payload: { hackerName: username, userId, timestamp: new Date().toISOString() }
                                }));
                            }
                        });
                        const count = roomSet.size;
                        const syncMsg = { type: 'sync_status', payload: { memberCount: count } };
                        roomSet.forEach(client => {
                            if (client.readyState === ws.OPEN) client.send(JSON.stringify(syncMsg));
                        });
                    }
                }


                if (userId) {
                    onlinePlayers.set(userId, username || userId);
                }
                socket.join('global');
                socket.emit('user_joined', { username, timestamp: new Date().toISOString() });
                const playerList = Array.from(onlinePlayers, ([id, name]) => ({ id, username: name }));

                io.to('global').emit('player_list_update', { players: playerList });
            });

            // End of WebSocket connection handler
        });

            socket.on('join_room', async ({ roomId }) => {
                if (typeof roomId === 'number') {
                    roomConnections.set(roomId, roomConnections.get(roomId) || new Set());
                    roomConnections.get(roomId)!.add(socket);
                    socket.data.roomId = roomId;
                    socket.join(`room_${roomId}`);
                    if (username) {
                        socket.to(`room_${roomId}`).emit('player_joined', { hackerName: username, userId, timestamp: new Date().toISOString() });
                    }
                    try {
                        const members = await storage.getRoomMembers(roomId);
                        socket.emit('room_state', { members, roomId });
                    } catch (err) {
                        console.error('Failed to get room members:', err);
                    }
                    const count = roomConnections.get(roomId)!.size;
                    io.to(`room_${roomId}`).emit('sync_status', { memberCount: count });
                }
            });

            socket.on('leave_room', () => {
                const rid = socket.data.roomId;
                if (rid !== undefined) {
                    const roomSet = roomConnections.get(rid);
                    if (roomSet) {
                        roomSet.delete(socket);
                        socket.leave(`room_${rid}`);
                        socket.to(`room_${rid}`).emit('player_left', { hackerName: username, userId, timestamp: new Date().toISOString() });
                        const count = roomSet.size;
                        io.to(`room_${rid}`).emit('sync_status', { memberCount: count });
                    }
                    socket.data.roomId = undefined;
                }
            });

            socket.on('send_message', (payload) => {
                const msgPayload = {
                    id: Date.now(),
                    userId: payload.userId || userId,
                    username: payload.username || username,
                    message: payload.message,
                    timestamp: new Date().toISOString(),
                    messageType: payload.channel === 'team' ? 'team' : 'chat'
                };
                if (payload.channel === 'room' && socket.data.roomId !== undefined) {
                    io.to(`room_${socket.data.roomId}`).emit('chat_message', msgPayload);
                } else {
                    io.to('global').emit('chat_message', msgPayload);
                }
            });

            socket.on('send_private_message', (payload) => {
                const target = userConnections.get(String(payload.targetUserId));
                if (target) {
                    const privateMsg = {
                        id: Date.now(),
                        fromUserId: userId,
                        toUserId: String(payload.targetUserId),
                        username,
                        message: payload.message,
                        timestamp: new Date().toISOString()
                    };
                    target.emit('private_message', privateMsg);
                }
            });

            socket.on('ping', () => {
                socket.emit('pong');
                if (socket.data.roomId !== undefined) {
                    const roomSet = roomConnections.get(socket.data.roomId);
                    const count = roomSet ? roomSet.size : 0;
                    socket.emit('sync_status', { memberCount: count });
                }
            });

            socket.on('disconnect', () => {
                const rid = socket.data.roomId;
                if (rid !== undefined) {
                    const roomSet = roomConnections.get(rid);
                    if (roomSet) {
                        roomSet.delete(socket);
                        io.to(`room_${rid}`).emit('player_left', { hackerName: username, userId, timestamp: new Date().toISOString() });
                        const count = roomSet.size;
                        io.to(`room_${rid}`).emit('sync_status', { memberCount: count });
                    }
                }
                if (userId) {
                    userConnections.delete(userId);
                    onlinePlayers.delete(userId);
                    io.to('global').emit('user_left', { username, timestamp: new Date().toISOString() });
                    const playerList = Array.from(onlinePlayers, ([id, name]) => ({ id, username: name }));
                    io.to('global').emit('player_list_update', { players: playerList });
                }
            });
        });

        console.log('Socket.IO server initialized on /ws path');
        log('✅ FINAL: API routes registered successfully');
        return server;
    } catch (error) {
        console.error('Failed to register routes:', error);
        throw error;
    }
}
