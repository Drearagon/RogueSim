// server/routes.ts (CLEANED VERSION)

import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { getDb, getPool, isUsingLocalFallback } from "./db";
import { DatabaseStorage } from "./storage";
import { setStorageInstance } from "./storageInstance";
import type { FriendOverview } from "./storage";
import { insertGameSaveSchema, insertMissionHistorySchema, insertCommandLogSchema, insertBattlePassSchema, insertUserBattlePassSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail, sendWelcomeEmail } from "./emailService";
import { logger, authLogger, logAuthEvent, logUserAction } from "./logger";
import { log } from "./utils";
import crypto from "crypto";
import { SecurityMiddleware, PasswordValidator, SecurityAuditLogger } from "./security";
import Stripe from "stripe";
import { env } from './config';
import { authLimiter as standardAuthLimiter, scannerLimiter } from './middleware/security';
const SHOULD_LOG_CODES = process.env.VERIFICATION_LOGGING === 'true';

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

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

const adminAuth: RequestHandler = (req: any, res, next) => {
    if (!ADMIN_TOKEN) {
        return res.status(503).send('Admin token not configured');
    }

    const suppliedToken =
        (req.headers['x-admin-token'] as string) ||
        (typeof req.body?.token === 'string' ? req.body.token : undefined) ||
        (typeof req.query?.token === 'string' ? req.query.token : undefined);

    if (suppliedToken && suppliedToken === ADMIN_TOKEN) {
        (res.locals as any).adminToken = suppliedToken;
        return next();
    }

    return res.status(403).send('Forbidden');
};

const escapeHtml = (value: string | undefined | null): string => {
    if (!value) return '';
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const generateTemporaryPassword = (length = 12): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%&*!';
    let password = '';
    for (let i = 0; i < length; i += 1) {
        const idx = crypto.randomInt(0, chars.length);
        password += chars[idx];
    }
    return password;
};

export async function registerRoutes(app: Express): Promise<Server> {
    try {
        // Initialize database storage
        const db = getDb();
        const pool = getPool();
        storage = new DatabaseStorage(db, pool);
        setStorageInstance(storage);

        log('✅ Database storage initialized');

        // Session configuration
        // Enhanced security middleware
        app.use(SecurityMiddleware.sanitizeInput());
        app.use(SecurityMiddleware.honeypotProtection());
        app.use(SecurityMiddleware.enhanceSessionSecurity());

        // Advanced rate limiting for authentication routes
        const advancedAuthLimiter = SecurityMiddleware.advancedRateLimit({
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

        // Admin utilities
        app.get('/admin', adminAuth, async (req: any, res) => {
            try {
                const players = await storage.listUsers();
                const message = typeof req.query?.message === 'string' ? req.query.message : '';
                const token = (res.locals as any).adminToken || (typeof req.query?.token === 'string' ? req.query.token : '');

                const rows = players
                    .map((player) => {
                        const safeId = encodeURIComponent(player.id);
                        const safeToken = escapeHtml(token);
                        const banAction = player.isBanned ? 'unban' : 'ban';
                        const testAction = player.isTestUser ? 'remove' : 'mark';

                        return `
                        <tr>
                            <td>${escapeHtml(player.hackerName || player.email || player.id)}</td>
                            <td>${escapeHtml(player.email || '')}</td>
                            <td>${player.playerLevel ?? 0}</td>
                            <td>${player.totalMissionsCompleted ?? 0}</td>
                            <td>${player.totalCreditsEarned ?? 0}</td>
                            <td>${escapeHtml(player.reputation || 'ROOKIE')}</td>
                            <td>${player.isBanned ? 'Yes' : 'No'}</td>
                            <td>${player.isTestUser ? 'Yes' : 'No'}</td>
                            <td>${player.lastActive ? new Date(player.lastActive).toLocaleString() : '—'}</td>
                            <td>
                                <form method="POST" action="/admin/users/${safeId}/ban">
                                    <input type="hidden" name="token" value="${safeToken}" />
                                    <input type="hidden" name="action" value="${banAction}" />
                                    <button type="submit">${player.isBanned ? 'Unban' : 'Ban'}</button>
                                </form>
                                <form method="POST" action="/admin/users/${safeId}/test">
                                    <input type="hidden" name="token" value="${safeToken}" />
                                    <input type="hidden" name="action" value="${testAction}" />
                                    <button type="submit">${player.isTestUser ? 'Remove Tester' : 'Mark Tester'}</button>
                                </form>
                                <form method="POST" action="/admin/users/${safeId}/reset-password">
                                    <input type="hidden" name="token" value="${safeToken}" />
                                    <button type="submit">Reset Password</button>
                                </form>
                                <form method="POST" action="/admin/users/${safeId}/simulate">
                                    <input type="hidden" name="token" value="${safeToken}" />
                                    <button type="submit">Simulate Progression</button>
                                </form>
                            </td>
                        </tr>`;
                    })
                    .join('');

                const html = `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="utf-8" />
                        <title>RogueSim Admin Panel</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 2rem; background: #0f172a; color: #e2e8f0; }
                            h1 { margin-bottom: 1rem; }
                            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                            th, td { border: 1px solid #1e293b; padding: 0.5rem; text-align: left; }
                            th { background: #1e293b; }
                            tr:nth-child(even) { background: #111827; }
                            tr:nth-child(odd) { background: #0f172a; }
                            form { display: inline-block; margin: 0.25rem 0.25rem 0; }
                            button { background: #3b82f6; color: #fff; border: none; padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer; }
                            button:hover { background: #2563eb; }
                            .message { margin: 1rem 0; padding: 0.75rem; background: #1d4ed8; border-radius: 6px; }
                            .banner { background: #1f2937; padding: 1rem; border-radius: 6px; }
                            a { color: #60a5fa; }
                        </style>
                    </head>
                    <body>
                        <div class="banner">
                            <h1>RogueSim Admin Console</h1>
                            <p>Authenticated via query token or <code>x-admin-token</code> header.</p>
                            <p><a href="/api/dev/backup?token=${encodeURIComponent(token)}">Download JSON backup</a></p>
                        </div>
                        ${message ? `<div class="message">${escapeHtml(message)}</div>` : ''}
                        <table>
                            <thead>
                                <tr>
                                    <th>Hacker</th>
                                    <th>Email</th>
                                    <th>Level</th>
                                    <th>Missions</th>
                                    <th>Credits</th>
                                    <th>Reputation</th>
                                    <th>Banned</th>
                                    <th>Tester</th>
                                    <th>Last Active</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows || '<tr><td colspan="10">No players found.</td></tr>'}
                            </tbody>
                        </table>
                    </body>
                </html>`;

                res.type('html').send(html);
            } catch (error) {
                logger.error({ err: error }, 'Failed to render admin panel');
                res.status(500).send('Failed to load admin panel');
            }
        });

        app.post('/admin/users/:id/ban', adminAuth, async (req: any, res) => {
            const { id } = req.params;
            const action = req.body?.action === 'unban' ? 'unban' : 'ban';
            try {
                const updated = await storage.setUserBanStatus(id, action !== 'unban');
                logUserAction(id, action === 'unban' ? 'admin_unban_user' : 'admin_ban_user', { admin: true });
                const message = `${action === 'unban' ? 'Unbanned' : 'Banned'} ${updated.hackerName || updated.email || id}`;
                const token = encodeURIComponent((res.locals as any).adminToken || '');
                res.redirect(`/admin?token=${token}&message=${encodeURIComponent(message)}`);
            } catch (error) {
                logger.error({ err: error, userId: id }, 'Failed to update ban status');
                res.status(500).send('Failed to update user ban status');
            }
        });

        app.post('/admin/users/:id/test', adminAuth, async (req: any, res) => {
            const { id } = req.params;
            const action = req.body?.action === 'remove' ? 'remove' : 'mark';
            try {
                const updated = await storage.setUserTestStatus(id, action !== 'remove');
                logUserAction(id, action === 'remove' ? 'admin_remove_tester' : 'admin_mark_tester', { admin: true });
                const message = `${action === 'remove' ? 'Removed tester flag for' : 'Marked tester'} ${updated.hackerName || updated.email || id}`;
                const token = encodeURIComponent((res.locals as any).adminToken || '');
                res.redirect(`/admin?token=${token}&message=${encodeURIComponent(message)}`);
            } catch (error) {
                logger.error({ err: error, userId: id }, 'Failed to update tester flag');
                res.status(500).send('Failed to update tester flag');
            }
        });

        app.post('/admin/users/:id/reset-password', adminAuth, async (req: any, res) => {
            const { id } = req.params;
            try {
                const temporaryPassword = generateTemporaryPassword();
                const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
                const updated = await storage.updateUserPassword(id, hashedPassword);
                logUserAction(id, 'admin_reset_password', { admin: true });
                const message = `Temporary password for ${updated.hackerName || updated.email || id}: ${temporaryPassword}`;
                const token = encodeURIComponent((res.locals as any).adminToken || '');
                res.redirect(`/admin?token=${token}&message=${encodeURIComponent(message)}`);
            } catch (error) {
                logger.error({ err: error, userId: id }, 'Failed to reset password');
                res.status(500).send('Failed to reset password');
            }
        });

        app.post('/admin/users/:id/simulate', adminAuth, async (req: any, res) => {
            const { id } = req.params;
            try {
                const updated = await storage.simulateUserProgression(id);
                logUserAction(id, 'admin_simulate_progression', { admin: true });
                const message = `Simulated progression for ${updated.hackerName || updated.email || id}`;
                const token = encodeURIComponent((res.locals as any).adminToken || '');
                res.redirect(`/admin?token=${token}&message=${encodeURIComponent(message)}`);
            } catch (error) {
                logger.error({ err: error, userId: id }, 'Failed to simulate progression');
                res.status(500).send('Failed to simulate progression');
            }
        });

        app.get('/api/dev/backup', adminAuth, async (req: any, res) => {
            try {
                const snapshot = await storage.getAllUserStats();
                res.json({
                    generatedAt: new Date().toISOString(),
                    totalUsers: snapshot.length,
                    users: snapshot,
                });
            } catch (error) {
                logger.error({ err: error }, 'Failed to generate backup snapshot');
                res.status(500).json({ error: 'Failed to generate backup' });
            }
        });

        // Auth routes
        app.post('/api/auth/register', scannerLimiter, standardAuthLimiter, advancedAuthLimiter, async (req: any, res) => {
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

                // Log code generation for debugging (guarded by env flag)
                if (SHOULD_LOG_CODES) {
                    authLogger.info({
                        event: 'verification_code_generated',
                        email,
                        verificationCode,
                        expiresAt: expiresAt.toISOString()
                    }, `Generated verification code ${verificationCode} for ${email}`);
                    // Also emit a simple console line for easy grepping in docker logs
                    console.log(`[VERIFICATION] Code for ${email}: ${verificationCode}`);
                } else {
                    authLogger.info({ event: 'verification_code_generated', email }, `Generated verification code for ${email}`);
                }

                // Store unverified user
                await storage.storeUnverifiedUser({
                    email,
                    hackerName,
                    password: hashedPassword,
                    verificationCode: verificationCode,
                    expiresAt,
                });

                // Also store verification code in verification_codes table for robust checks
                try {
                    await storage.storeVerificationCode({ email, hackerName, code: verificationCode, expiresAt });
                } catch (e) {
                    authLogger.warn({ event: 'store_verification_code_failed', email, error: (e as Error).message }, 'Failed to store verification code in verification_codes table');
                }

                // Send verification email
                const emailSent = await sendVerificationEmail(email, verificationCode, hackerName || 'Agent');

                if (!emailSent) {
                    if (SHOULD_LOG_CODES) {
                        console.log(`[VERIFICATION] Email send failed; use code for ${email}: ${verificationCode}`);
                    }
                    return res.status(500).json({ error: 'Failed to send verification email' });
                }

                res.json({ message: 'Registration initiated. Please check your email for verification code.' });
                logAuthEvent('registration_initiated', email, true);
                if (SHOULD_LOG_CODES) {
                    authLogger.info({ event: 'registration_initiated', email, verificationCode }, `Registration initiated for ${email}, code ${verificationCode} sent`);
                    console.log(`[VERIFICATION] Registration initiated for ${email}; code: ${verificationCode}`);
                } else {
                    authLogger.info({ event: 'registration_initiated', email }, `Registration initiated for ${email}`);
                }

            } catch (error) {
                console.error('Registration error:', error);
                res.status(500).json({ error: 'Internal server error during registration' });
                logAuthEvent('registration_failed', req.body.email, false);
            }
        });

        app.post('/api/auth/verify', scannerLimiter, standardAuthLimiter, advancedAuthLimiter, async (req: any, res) => {
            try {
                const { email, verificationCode } = req.body;

                // Log attempt with provided code for debugging
                if (SHOULD_LOG_CODES) {
                    authLogger.info({ event: 'verification_attempt', email, verificationCode }, `Verification attempt for ${email} with code ${verificationCode}`);
                } else {
                    authLogger.info({ event: 'verification_attempt', email }, `Verification attempt for ${email}`);
                }

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

                // Robust code validation: use verification_codes table
                const verification = await storage.getVerificationCode(email, verificationCode);
                if (!verification) {
                    if (SHOULD_LOG_CODES) {
                        authLogger.warn({ event: 'verification_code_invalid', email, providedCode: verificationCode }, `Invalid or expired code for ${email}`);
                    } else {
                        authLogger.warn({ event: 'verification_code_invalid', email }, `Invalid or expired code for ${email}`);
                    }
                    return res.status(400).json({ error: 'Invalid or expired verification code' });
                }
                // expiry check
                if (verification.expires_at && new Date() > new Date(verification.expires_at)) {
                    if (SHOULD_LOG_CODES) {
                        authLogger.warn({ event: 'verification_code_expired', email, providedCode: verificationCode, expiresAt: new Date(verification.expires_at).toISOString() }, `Verification failed for ${email}: code expired`);
                    } else {
                        authLogger.warn({ event: 'verification_code_expired', email, expiresAt: new Date(verification.expires_at).toISOString() }, `Verification failed for ${email}: code expired`);
                    }
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

        app.post('/api/auth/login', scannerLimiter, standardAuthLimiter, advancedAuthLimiter, async (req: any, res) => {
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

        app.post('/api/user/profile', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const profileData = {
                    ...req.body,
                    userId,
                    id: userId,
                };
                const profile = await storage.createUserProfile(profileData);
                res.json(profile);
            } catch (error) {
                console.error('Error creating user profile:', error);
                res.status(500).json({ error: 'Failed to create user profile' });
            }
        });

        app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const profile = await storage.getUserProfile(userId);
                if (!profile) {
                    return res.status(404).json({ error: 'Profile not found' });
                }
                res.json(profile);
            } catch (error) {
                console.error('Error loading user profile:', error);
                res.status(500).json({ error: 'Failed to load user profile' });
            }
        });

        app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const updates = req.body;
                const profile = await storage.updateUserProfile(userId, updates);
                res.json(profile);
            } catch (error) {
                console.error('Error updating user profile:', error);
                res.status(500).json({ error: 'Failed to update user profile' });
            }
        });

        app.post('/api/user/log-activity', async (req: any, res) => {
            try {
                const sessionUserId = req.session?.userId;
                const body = req.body ?? {};
                const username = typeof body.username === 'string' ? body.username : sessionUserId ?? 'anonymous';
                const action = typeof body.action === 'string' ? body.action : 'unknown';
                const details = {
                    username,
                    timestamp: typeof body.timestamp === 'string' ? body.timestamp : new Date().toISOString(),
                    userAgent: typeof body.userAgent === 'string' ? body.userAgent : req.get('user-agent'),
                    ipAddress: req.ip,
                    metadata: typeof body.metadata === 'object' && body.metadata ? body.metadata : undefined,
                };
                logUserAction(sessionUserId ?? username, action, details);
                res.status(204).end();
            } catch (error) {
                console.error('Error logging user activity:', error);
                res.status(204).end();
            }
        });

        // Social graph endpoints
        app.get('/api/social/friends', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const overview: FriendOverview = await storage.getFriendOverview(userId);
                res.json(overview);
            } catch (error) {
                console.error('Failed to load friend overview:', error);
                res.status(500).json({ error: 'Failed to load friend data' });
            }
        });

        app.post('/api/social/friends/invite', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const { targetUserId, targetHackerName } = req.body ?? {};

                let targetId: string | undefined = typeof targetUserId === 'string' ? targetUserId : undefined;

                if (!targetId && typeof targetHackerName === 'string' && targetHackerName.trim().length > 0) {
                    const targetUser = await storage.getUserByHackerName(targetHackerName.trim());
                    if (!targetUser) {
                        return res.status(404).json({ error: 'Target user not found' });
                    }
                    targetId = targetUser.id;
                }

                if (!targetId) {
                    return res.status(400).json({ error: 'targetUserId or targetHackerName is required' });
                }

                if (targetId === userId) {
                    return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
                }

                await storage.sendFriendRequest(userId, targetId);
                const overview = await storage.getFriendOverview(userId);
                res.json({ message: 'Friend request sent', overview });
            } catch (error) {
                console.error('Friend invite error:', error);
                if (error instanceof Error) {
                    return res.status(400).json({ error: error.message });
                }
                res.status(500).json({ error: 'Failed to send friend request' });
            }
        });

        app.post('/api/social/friends/accept', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const { requesterId } = req.body ?? {};

                if (typeof requesterId !== 'string' || requesterId.length === 0) {
                    return res.status(400).json({ error: 'requesterId is required' });
                }

                await storage.acceptFriendRequest(requesterId, userId);
                const overview = await storage.getFriendOverview(userId);
                res.json({ message: 'Friend request accepted', overview });
            } catch (error) {
                console.error('Friend accept error:', error);
                if (error instanceof Error) {
                    return res.status(400).json({ error: error.message });
                }
                res.status(500).json({ error: 'Failed to accept friend request' });
            }
        });

        app.delete('/api/social/friends/:targetId', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const targetId = req.params.targetId;

                if (!targetId) {
                    return res.status(400).json({ error: 'targetId is required' });
                }

                await storage.removeFriendOrRequest(userId, targetId);
                const overview = await storage.getFriendOverview(userId);
                res.json({ message: 'Connection updated', overview });
            } catch (error) {
                console.error('Friend removal error:', error);
                res.status(500).json({ error: 'Failed to update friendship' });
            }
        });

        app.get('/api/social/blocks', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const blocked = await storage.listBlockedUsers(userId);
                res.json({ blocked });
            } catch (error) {
                console.error('Failed to list blocks:', error);
                res.status(500).json({ error: 'Failed to load block list' });
            }
        });

        app.post('/api/social/blocks', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const { targetUserId, targetHackerName } = req.body ?? {};

                let targetId: string | undefined = typeof targetUserId === 'string' ? targetUserId : undefined;

                if (!targetId && typeof targetHackerName === 'string' && targetHackerName.trim().length > 0) {
                    const targetUser = await storage.getUserByHackerName(targetHackerName.trim());
                    if (!targetUser) {
                        return res.status(404).json({ error: 'Target user not found' });
                    }
                    targetId = targetUser.id;
                }

                if (!targetId) {
                    return res.status(400).json({ error: 'targetUserId or targetHackerName is required' });
                }

                if (targetId === userId) {
                    return res.status(400).json({ error: 'You cannot block yourself' });
                }

                await storage.blockUser(userId, targetId);
                const overview = await storage.getFriendOverview(userId);
                res.json({ message: 'User blocked', overview });
            } catch (error) {
                console.error('Block user error:', error);
                if (error instanceof Error) {
                    return res.status(400).json({ error: error.message });
                }
                res.status(500).json({ error: 'Failed to block user' });
            }
        });

        app.post('/api/commands/log', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const { command, args = [], success = true } = req.body ?? {};

                if (typeof command !== 'string' || command.trim().length === 0) {
                    return res.status(400).json({ error: 'command is required' });
                }

                const commandLogData = {
                    userId,
                    sessionId: req.sessionID,
                    command: command.trim(),
                    args: Array.isArray(args) ? args : [],
                    success: Boolean(success),
                    output: [`Command '${command.trim()}' executed ${success ? 'successfully' : 'with errors'}`],
                };

                const validatedCommandLog = insertCommandLogSchema.parse(commandLogData);
                const savedLog = await storage.logCommand(validatedCommandLog);
                res.json(savedLog);
            } catch (error) {
                console.error('Error logging command:', error);
                if (error && typeof error === 'object' && 'issues' in error) {
                    return res.status(400).json({ error: 'Invalid command log data', details: (error as any).issues });
                }
                res.status(500).json({ error: 'Failed to log command' });
            }
        });

        app.delete('/api/social/blocks/:targetId', isAuthenticated, async (req: any, res) => {
            try {
                const userId: string = req.session.userId;
                const targetId = req.params.targetId;

                if (!targetId) {
                    return res.status(400).json({ error: 'targetId is required' });
                }

                await storage.unblockUser(userId, targetId);
                const overview = await storage.getFriendOverview(userId);
                res.json({ message: 'User unblocked', overview });
            } catch (error) {
                console.error('Unblock user error:', error);
                res.status(500).json({ error: 'Failed to unblock user' });
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
