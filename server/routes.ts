// server/routes.ts (CLEANED VERSION)

import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { getDb, getPool, isUsingLocalFallback } from "./db";
import { DatabaseStorage } from "./storage";
import { insertGameSaveSchema, insertMissionHistorySchema, insertCommandLogSchema, insertBattlePassSchema, insertUserBattlePassSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { sendVerificationEmail, sendWelcomeEmail } from "./emailService";
import { logger, authLogger, sessionLogger, logAuthEvent, logUserAction } from "./logger";
import { log } from "./utils";
import crypto from "crypto";
import { SecurityMiddleware, PasswordValidator, SecurityAuditLogger } from "./security";
import Stripe from "stripe";
import { env } from './config';

// Authentication middleware
const isAuthenticated: RequestHandler = (req: any, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

// Utility functions
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateSecureVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
}

let storage: DatabaseStorage;

// Initialize Stripe
if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
    try {
        // Initialize database storage
        const db = getDb();
        const pool = getPool();
        storage = new DatabaseStorage(db, pool);

        log('✅ Database storage initialized');

        // Session configuration
        const PgSession = connectPg(session);
        const sessionStore = new PgSession({
            pool: pool as any,
            tableName: 'sessions',
            createTableIfMissing: true,
        });

        app.use(session({
            store: sessionStore,
            secret: process.env.SESSION_SECRET || 'your-secret-key',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            },
        }));

        log('✅ Session middleware configured successfully');

        // Enhanced security middleware
        app.use(SecurityMiddleware.sanitizeInput());
        app.use(SecurityMiddleware.honeypotProtection());
        app.use(SecurityMiddleware.enhanceSessionSecurity());

        // Advanced rate limiting for authentication routes
        const authLimiter = SecurityMiddleware.advancedRateLimit({
            windowMs: 15 * 60 * 1000,
            maxAttempts: 5,
            blockDuration: 30 * 60 * 1000,
            progressiveDelay: true
        });

        // General rate limiting for API routes
        const apiLimiter = SecurityMiddleware.advancedRateLimit({
            windowMs: 1 * 60 * 1000,
            maxAttempts: 30,
            blockDuration: 5 * 60 * 1000,
            progressiveDelay: false
        });

        // CSRF token endpoint
        app.get('/api/csrf', (req, res) => {
            res.json({ csrfToken: 'disabled' });
        });

        // Basic health check endpoint for Docker (without database dependency)
        app.get('/api/health', (req, res) => {
            res.status(200).json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                uptime: process.uptime(),
                version: '1.0.0',
                services: {
                    api: 'healthy',
                    server: 'running'
                }
            });
        });
        
        // Advanced health check endpoint with database testing
        app.get('/api/health/full', async (req, res) => {
            try {
                // Test database connectivity
                await storage.testConnection();
                
                res.status(200).json({ 
                    status: 'healthy', 
                    timestamp: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development',
                    uptime: process.uptime(),
                    version: '1.0.0',
                    database: 'connected',
                    services: {
                        api: 'healthy',
                        database: 'healthy',
                        storage: 'healthy'
                    }
                });
            } catch (error) {
                console.error('Full health check failed:', error);
                res.status(503).json({ 
                    status: 'unhealthy', 
                    timestamp: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development',
                    uptime: process.uptime(),
                    version: '1.0.0',
                    database: 'disconnected',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    services: {
                        api: 'healthy',
                        database: 'unhealthy',
                        storage: 'unhealthy'
                    }
                });
            }
        });

        // Debug test endpoint
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

        // Auth routes
        app.post('/api/auth/register', authLimiter, async (req: any, res) => {
            try {
                const { email, hackerName, password } = req.body;

                if (!email || !hackerName || !password) {
                    return res.status(400).json({ error: 'Email, hacker name, and password are required' });
                }

                if (!isValidEmail(email)) {
                    return res.status(400).json({ error: 'Invalid email format' });
                }

                // Check if user already exists
                const existingUser = await storage.getUserByEmail(email);
                if (existingUser) {
                    return res.status(400).json({ error: 'User already exists' });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Generate verification code
                const verificationCode = generateSecureVerificationCode();
                const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

                // Log code generation for debugging
                authLogger.info({
                    event: 'verification_code_generated',
                    email,
                    verificationCode,
                    expiresAt: expiresAt.toISOString()
                }, `Generated verification code ${verificationCode} for ${email}`);

                // Store unverified user
                await storage.storeUnverifiedUser({
                    email,
                    hackerName,
                    password: hashedPassword,
                    verificationCode: verificationCode,
                    expiresAt,
                });

                // Send verification email
                const emailSent = await sendVerificationEmail(email, verificationCode, hackerName || 'Agent');

                if (!emailSent) {
                    return res.status(500).json({ error: 'Failed to send verification email' });
                }

                res.json({ message: 'Registration initiated. Please check your email for verification code.' });
                logAuthEvent('registration_initiated', email, true);
                authLogger.info({
                    event: 'registration_initiated',
                    email,
                    verificationCode
                }, `Registration initiated for ${email}, code ${verificationCode} sent`);

            } catch (error) {
                console.error('Registration error:', error);
                res.status(500).json({ error: 'Internal server error during registration' });
                logAuthEvent('registration_failed', req.body.email, false);
            }
        });

        app.post('/api/auth/verify', authLimiter, async (req: any, res) => {
            try {
                const { email, verificationCode } = req.body;

                // Log attempt with provided code for debugging
                authLogger.info({
                    event: 'verification_attempt',
                    email,
                    verificationCode
                }, `Verification attempt for ${email} with code ${verificationCode}`);

                if (!email || !verificationCode) {
                    return res.status(400).json({ error: 'Email and verification code are required' });
                }

                if (!isValidEmail(email)) {
                    return res.status(400).json({ error: 'Invalid email format' });
                }

                // Get unverified user
                const unverifiedUser = await storage.getUnverifiedUser(email);
                if (!unverifiedUser) {
                    return res.status(400).json({ error: 'No pending registration found for this email' });
                }

                // Check if verification code matches and hasn't expired
                if (unverifiedUser.verificationCode !== verificationCode) {
                    authLogger.warn({
                        event: 'verification_code_mismatch',
                        email,
                        providedCode: verificationCode
                    }, `Verification failed for ${email}: code mismatch`);
                    return res.status(400).json({ error: 'Invalid verification code' });
                }

                if (new Date() > new Date(unverifiedUser.expiresAt)) {
                    authLogger.warn({
                        event: 'verification_code_expired',
                        email,
                        providedCode: verificationCode,
                        expiresAt: new Date(unverifiedUser.expiresAt).toISOString()
                    }, `Verification failed for ${email}: code expired`);
                    return res.status(400).json({ error: 'Verification code has expired' });
                }

                // Create the actual user
                const newUser = await storage.createUser({
                    id: uuidv4(),
                    email: unverifiedUser.email,
                    hackerName: unverifiedUser.hackerName,
                    password: unverifiedUser.password,
                    isVerified: true,
                });

                // Clean up unverified user
                await storage.deleteUnverifiedUser(email);

                // Set up session
                req.session.userId = newUser.id;
                req.session.hackerName = newUser.hackerName;

                // Send welcome email
                if (newUser.email && newUser.hackerName) {
                    await sendWelcomeEmail(newUser.email, newUser.hackerName);
                }

                res.json({ 
                    message: 'Email verified successfully. Account created!', 
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        hackerName: newUser.hackerName,
                    }
                });

                logAuthEvent('verification_success', email, true);
                authLogger.info({
                    event: 'verification_success',
                    email
                }, `Verification success for ${email}`);

            } catch (error) {
                console.error('Verification error:', error);
                res.status(500).json({ error: 'Internal server error during verification' });
                logAuthEvent('verification_failed', req.body.email, false);
            }
        });

        app.post('/api/auth/login', authLimiter, async (req: any, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }

                const user = await storage.getUserByEmail(email);
                if (!user || !user.isVerified) {
                    return res.status(401).json({ error: 'Invalid credentials or unverified account' });
                }

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                req.session.userId = user.id;
                req.session.hackerName = user.hackerName;

                res.json({ 
                    message: 'Login successful', 
                    user: {
                        id: user.id,
                        email: user.email,
                        hackerName: user.hackerName,
                    }
                });

                logAuthEvent('login_success', email, true);

            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ error: 'Internal server error during login' });
                logAuthEvent('login_failed', req.body.email, false);
            }
        });

        app.post('/api/auth/logout', (req: any, res) => {
            req.session.destroy((err: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Could not log out' });
                }
                res.json({ message: 'Logged out successfully' });
            });
        });

        // Protected routes
        app.get('/api/auth/me', isAuthenticated, async (req: any, res) => {
            try {
                const user = await storage.getUser(req.session.userId);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({
                    id: user.id,
                    email: user.email,
                    hackerName: user.hackerName,
                });
            } catch (error) {
                console.error('Get user error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Frontend expects this endpoint for authentication checks
        app.get('/api/auth/user', async (req: any, res) => {
            try {
                if (!req.session?.userId) {
                    return res.status(401).json({ error: 'Not authenticated', code: 'NO_SESSION' });
                }

                const user = await storage.getUser(req.session.userId);
                if (!user) {
                    req.session.destroy((err: any) => {
                        if (err) console.error('Session destroy error:', err);
                    });
                    return res.status(401).json({ error: 'User not found', code: 'INVALID_USER' });
                }

                // Return secure user data
                const safeUser = {
                    id: user.id,
                    email: user.email,
                    hackerName: user.hackerName,
                    profileImageUrl: user.profileImageUrl,
                    createdAt: user.createdAt,
                };

                res.json(safeUser);
            } catch (error) {
                console.error('Get user error:', error);
                res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
            }
        });

        // Game routes
        app.post('/api/game/save', isAuthenticated, async (req: any, res) => {
            try {
                const gameData = req.body;
                const userId = req.session.userId;
                
                const gameSave = await storage.saveGameState({
                    userId,
                    sessionId: gameData.sessionId || uuidv4(),
                    gameMode: gameData.gameMode || 'single',
                    gameData: gameData,
                });

                res.json({ message: 'Game saved successfully', gameSave });
            } catch (error) {
                console.error('Save game error:', error);
                res.status(500).json({ error: 'Failed to save game' });
            }
        });

        app.get('/api/game/load/:sessionId', isAuthenticated, async (req: any, res) => {
            try {
                const { sessionId } = req.params;
                const gameSave = await storage.loadGameState(sessionId);
                
                if (!gameSave) {
                    return res.status(404).json({ error: 'Game save not found' });
                }

                res.json(gameSave);
            } catch (error) {
                console.error('Load game error:', error);
                res.status(500).json({ error: 'Failed to load game' });
            }
        });

        // Admin dashboard for security monitoring
        app.get('/api/admin/security-stats', isAuthenticated, async (req: any, res) => {
            try {
                // Check if user has admin privileges (implement based on your requirements)
                const user = await storage.getUser(req.session.userId);
                if (!user || !user.email?.includes('admin')) {
                    return res.status(403).json({ error: 'Admin access required' });
                }

                const stats = SecurityMiddleware.getSecurityStats();
                const auditLogs = SecurityAuditLogger.getLogs(50);
                
                res.json({
                    security: stats,
                    recentLogs: auditLogs,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Security stats error:', error);
                res.status(500).json({ error: 'Failed to fetch security stats' });
            }
        });

        // Enhanced game analytics endpoint
        app.get('/api/admin/game-analytics', isAuthenticated, async (req: any, res) => {
            try {
                const user = await storage.getUser(req.session.userId);
                if (!user || !user.email?.includes('admin')) {
                    return res.status(403).json({ error: 'Admin access required' });
                }

                // Get game analytics (implement based on your data structure)
                const analytics = {
                    totalUsers: 0, // Implement with actual query
                    activeUsers: 0,
                    completedMissions: 0,
                    averageSessionTime: 0,
                    popularCommands: [],
                    missionCompletionRates: {},
                    timestamp: new Date().toISOString()
                };

                res.json(analytics);
            } catch (error) {
                console.error('Game analytics error:', error);
                res.status(500).json({ error: 'Failed to fetch game analytics' });
            }
        });

        // Password strength validation endpoint
        app.post('/api/auth/validate-password', (req, res) => {
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({ error: 'Password is required' });
            }

            const validation = PasswordValidator.validate(password);
            res.json(validation);
        });

        // ============= BATTLE PASS API ROUTES =============

        // Get active battle pass
        app.get('/api/battlepass/active', async (req, res) => {
            try {
                const activeBattlePass = await storage.getActiveBattlePass();
                if (!activeBattlePass) {
                    return res.status(404).json({ error: 'No active battle pass found' });
                }
                res.json(activeBattlePass);
            } catch (error) {
                console.error('Error fetching active battle pass:', error);
                res.status(500).json({ error: 'Failed to fetch active battle pass' });
            }
        });

        // Get user's battle pass progress
        app.get('/api/battlepass/progress', isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.session.userId;
                const battlePassId = req.query.battlePassId as string;
                
                if (!battlePassId) {
                    return res.status(400).json({ error: 'Battle pass ID required' });
                }

                const userBattlePass = await storage.getUserBattlePass(userId, parseInt(battlePassId));
                const battlePassCommands = await storage.getBattlePassCommands(parseInt(battlePassId));
                const userCosmetics = await storage.getUserCosmetics(userId);
                const userPremiumCommands = await storage.getUserPremiumCommands(userId);

                res.json({
                    battlePass: userBattlePass,
                    commands: battlePassCommands,
                    cosmetics: userCosmetics,
                    premiumCommands: userPremiumCommands
                });
            } catch (error) {
                console.error('Error fetching battle pass progress:', error);
                res.status(500).json({ error: 'Failed to fetch battle pass progress' });
            }
        });

        // Create payment intent for battle pass purchase
        app.post('/api/battlepass/create-payment-intent', isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.session.userId;
                const { battlePassId } = req.body;

                if (!battlePassId) {
                    return res.status(400).json({ error: 'Battle pass ID required' });
                }

                // Get battle pass details
                const battlePass = await storage.getActiveBattlePass();
                if (!battlePass || battlePass.id !== battlePassId) {
                    return res.status(404).json({ error: 'Battle pass not found' });
                }

                // Check if user already has premium
                const userBattlePass = await storage.getUserBattlePass(userId, battlePassId);
                if (userBattlePass?.hasPremium) {
                    return res.status(400).json({ error: 'User already has premium battle pass' });
                }
                // Create payment intent
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: battlePass.premiumPrice, // Amount in cents
                    currency: 'usd',
                    metadata: {
                        userId,
                        battlePassId: battlePassId.toString(),
                        type: 'battle_pass_premium'
                    }
                });

                res.json({ 
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id 
                });
            } catch (error) {
                console.error('Error creating payment intent:', error);
                res.status(500).json({ error: 'Failed to create payment intent' });
            }
        });

        // ============= MISSION GENERATION ROUTES =============

        // Generate single mission
        app.post("/api/missions/generate", isAuthenticated, async (req: any, res) => {
            try {
                const { missionGenerator } = await import('./missionGenerator');
                const userId = req.session.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const { playerLevel, completedMissions, reputation } = req.body;

                const mission = await missionGenerator.generateMission(
                    playerLevel || 1,
                    completedMissions || [],
                    reputation || 'Novice'
                );

                res.json(mission);
            } catch (error) {
                console.error("Error generating mission:", error);
                res.status(500).json({ error: "Failed to generate mission" });
            }
        });

        // Generate batch of missions
        app.post("/api/missions/generate-batch", isAuthenticated, async (req: any, res) => {
            try {
                const { missionGenerator } = await import('./missionGenerator');
                const userId = req.session.userId;
                if (!userId) return res.status(401).json({ error: "Authentication required" });

                const { playerLevel, completedMissions, reputation, count } = req.body;

                const missions = await missionGenerator.generateMissionBatch(
                    playerLevel || 1,
                    completedMissions || [],
                    reputation || 'Novice',
                    count || 3
                );

                res.json(missions);
            } catch (error) {
                console.error("Error generating mission batch:", error);
                res.status(500).json({ error: "Failed to generate missions" });
            }
        });

        // Confirm battle pass purchase
        app.post('/api/battlepass/confirm-purchase', isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.session.userId;
                const { paymentIntentId, battlePassId } = req.body;

                if (!paymentIntentId || !battlePassId) {
                    return res.status(400).json({ error: 'Payment intent ID and battle pass ID required' });
                }
                // Verify payment with Stripe
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                
                if (paymentIntent.status !== 'succeeded') {
                    return res.status(400).json({ error: 'Payment not completed' });
                }

                if (paymentIntent.metadata.userId !== userId) {
                    return res.status(403).json({ error: 'Payment belongs to different user' });
                }

                // Check if user battle pass exists, create if not
                let userBattlePass = await storage.getUserBattlePass(userId, battlePassId);
                
                if (!userBattlePass) {
                    userBattlePass = await storage.createUserBattlePass({
                        userId,
                        battlePassId,
                        currentLevel: 1,
                        experience: 0,
                        hasPremium: true,
                        purchaseDate: new Date(),
                        stripePaymentIntentId: paymentIntentId,
                        claimedRewards: []
                    });
                } else {
                    userBattlePass = await storage.updateUserBattlePass(userId, battlePassId, {
                        hasPremium: true,
                        purchaseDate: new Date(),
                        stripePaymentIntentId: paymentIntentId
                    });
                }

                res.json({ success: true, userBattlePass });
            } catch (error) {
                console.error('Error confirming battle pass purchase:', error);
                res.status(500).json({ error: 'Failed to confirm purchase' });
            }
        });

        // Add battle pass experience (called when user completes missions/commands)
        app.post('/api/battlepass/add-experience', isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.session.userId;
                const { battlePassId, experience } = req.body;

                if (!battlePassId || !experience) {
                    return res.status(400).json({ error: 'Battle pass ID and experience amount required' });
                }

                // Check if user has battle pass access
                let userBattlePass = await storage.getUserBattlePass(userId, battlePassId);
                
                if (!userBattlePass) {
                    // Create free tier battle pass
                    userBattlePass = await storage.createUserBattlePass({
                        userId,
                        battlePassId,
                        currentLevel: 1,
                        experience: 0,
                        hasPremium: false,
                        claimedRewards: []
                    });
                }

                // Add experience
                const updatedBattlePass = await storage.addBattlePassExperience(userId, battlePassId, experience);

                res.json({ success: true, battlePass: updatedBattlePass });
            } catch (error) {
                console.error('Error adding battle pass experience:', error);
                res.status(500).json({ error: 'Failed to add experience' });
            }
        });

        // Unlock cosmetic
        app.post('/api/battlepass/unlock-cosmetic', isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.session.userId;
                const { cosmeticId } = req.body;

                if (!cosmeticId) {
                    return res.status(400).json({ error: 'Cosmetic ID required' });
                }

                const unlockedCosmetic = await storage.unlockCosmetic(userId, cosmeticId);
                res.json({ success: true, cosmetic: unlockedCosmetic });
            } catch (error) {
                console.error('Error unlocking cosmetic:', error);
                res.status(500).json({ error: 'Failed to unlock cosmetic' });
            }
        });

        // Equip/unequip cosmetic
        app.post('/api/battlepass/equip-cosmetic', isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.session.userId;
                const { cosmeticId, equip } = req.body;

                if (!cosmeticId) {
                    return res.status(400).json({ error: 'Cosmetic ID required' });
                }

                if (equip) {
                    const equippedCosmetic = await storage.equipCosmetic(userId, cosmeticId);
                    res.json({ success: true, cosmetic: equippedCosmetic });
                } else {
                    await storage.unequipCosmetic(userId, cosmeticId);
                    res.json({ success: true });
                }
            } catch (error) {
                console.error('Error equipping/unequipping cosmetic:', error);
                res.status(500).json({ error: 'Failed to update cosmetic' });
            }
        });

        // Check premium command access
        app.get('/api/battlepass/command-access/:commandName', isAuthenticated, async (req: any, res) => {
            try {
                const userId = req.session.userId;
                const { commandName } = req.params;

                const hasAccess = await storage.hasAccessToPremiumCommand(userId, commandName);
                res.json({ hasAccess });
            } catch (error) {
                console.error('Error checking command access:', error);
                res.status(500).json({ error: 'Failed to check command access' });
            }
        });

        // Create HTTP server
        const server = createServer(app);

        log('✅ HTTP Server created successfully');
        
        return server;

    } catch (error) {
        console.error('Failed to register routes:', error);
        throw error;
    }
}
