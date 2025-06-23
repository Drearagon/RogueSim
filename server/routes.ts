// server/routes.ts (CLEANED VERSION)

import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { getDb, getPool, isUsingLocalFallback } from "./db";
import { DatabaseStorage } from "./storage";
import { insertGameSaveSchema, insertMissionHistorySchema, insertCommandLogSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { sendVerificationEmail, sendWelcomeEmail } from "./emailService";
import { logger, authLogger, sessionLogger, logAuthEvent, logUserAction } from "./logger";
import { log } from "./vite";
import crypto from "crypto";

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

        // Simple rate limiting middleware
        const authLimiter = (req: any, res: any, next: any) => {
            next();
        };

        // CSRF token endpoint
        app.get('/api/csrf', (req, res) => {
            res.json({ csrfToken: 'disabled' });
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

                // Store unverified user
                await storage.storeUnverifiedUser({
                    email,
                    hackerName,
                    password: hashedPassword,
                    verificationCode: verificationCode,
                    expiresAt,
                });

                // Send verification email
                const emailSent = await sendVerificationEmail(email, verificationCode, hackerName);

                if (!emailSent) {
                    return res.status(500).json({ error: 'Failed to send verification email' });
                }

                res.json({ message: 'Registration initiated. Please check your email for verification code.' });
                logAuthEvent('registration_initiated', email, true);

            } catch (error) {
                console.error('Registration error:', error);
                res.status(500).json({ error: 'Internal server error during registration' });
                logAuthEvent('registration_failed', req.body.email, false);
            }
        });

        app.post('/api/auth/verify', authLimiter, async (req: any, res) => {
            try {
                const { email, verificationCode } = req.body;

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
                    return res.status(400).json({ error: 'Invalid verification code' });
                }

                if (new Date() > new Date(unverifiedUser.expiresAt)) {
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
                await sendWelcomeEmail(newUser.email, newUser.hackerName);

                res.json({ 
                    message: 'Email verified successfully. Account created!', 
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        hackerName: newUser.hackerName,
                    }
                });

                logAuthEvent('verification_success', email, true);

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
                const user = await storage.getUserById(req.session.userId);
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
                    lastSaved: new Date(),
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

        // Create HTTP server
        const server = createServer(app);

        log('✅ HTTP Server created successfully');
        
        return server;

    } catch (error) {
        console.error('Failed to register routes:', error);
        throw error;
    }
}