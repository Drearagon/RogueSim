import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Enhanced security middleware collection
export class SecurityMiddleware {
    private static rateLimitStore = new Map<string, { count: number; firstAttempt: number; blocked: boolean }>();
    private static suspiciousIPs = new Set<string>();
    private static honeypotTokens = new Set<string>();

    // Advanced rate limiting with progressive delays
    static advancedRateLimit(options: {
        windowMs: number;
        maxAttempts: number;
        blockDuration?: number;
        progressiveDelay?: boolean;
    }) {
        return (req: Request, res: Response, next: NextFunction) => {
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const key = `${ip}-${req.path}`;
            const now = Date.now();

            if (!SecurityMiddleware.rateLimitStore.has(key)) {
                SecurityMiddleware.rateLimitStore.set(key, { 
                    count: 1, 
                    firstAttempt: now,
                    blocked: false 
                });
                return next();
            }

            const record = SecurityMiddleware.rateLimitStore.get(key)!;
            
            // Reset window if expired
            if (now - record.firstAttempt > options.windowMs) {
                SecurityMiddleware.rateLimitStore.set(key, { 
                    count: 1, 
                    firstAttempt: now,
                    blocked: false 
                });
                return next();
            }

            // Check if blocked
            if (record.blocked && options.blockDuration) {
                const blockExpiry = record.firstAttempt + options.blockDuration;
                if (now < blockExpiry) {
                    return res.status(429).json({
                        error: 'IP temporarily blocked',
                        retryAfter: Math.ceil((blockExpiry - now) / 1000)
                    });
                } else {
                    record.blocked = false;
                    record.count = 1;
                    record.firstAttempt = now;
                }
            }

            // Apply progressive delay
            if (options.progressiveDelay && record.count > 3) {
                const delay = Math.min(record.count * 1000, 10000);
                setTimeout(() => next(), delay);
            } else if (record.count >= options.maxAttempts) {
                record.blocked = true;
                SecurityMiddleware.suspiciousIPs.add(ip);
                return res.status(429).json({
                    error: 'Too many attempts',
                    retryAfter: Math.ceil((options.windowMs - (now - record.firstAttempt)) / 1000)
                });
            } else {
                record.count++;
                next();
            }
        };
    }

    // Input sanitization and validation
    static sanitizeInput() {
        return (req: Request, res: Response, next: NextFunction) => {
            const sanitize = (obj: any) => {
                if (typeof obj === 'string') {
                    return obj
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/javascript:/gi, '')
                        .replace(/on\w+\s*=/gi, '')
                        .trim();
                }
                if (typeof obj === 'object' && obj !== null) {
                    for (const key in obj) {
                        obj[key] = sanitize(obj[key]);
                    }
                }
                return obj;
            };

            if (req.body) req.body = sanitize(req.body);
            if (req.query) req.query = sanitize(req.query);
            if (req.params) req.params = sanitize(req.params);
            
            next();
        };
    }

    // Honeypot detection
    static honeypotProtection() {
        return (req: Request, res: Response, next: NextFunction) => {
            const body = req.body || {};
            
            // Check for honeypot fields
            if (body.website || body.url || body.homepage) {
                const ip = req.ip || req.connection.remoteAddress || 'unknown';
                SecurityMiddleware.suspiciousIPs.add(ip);
                return res.status(400).json({ error: 'Invalid request' });
            }

            // Check for suspicious patterns
            const userAgent = req.get('User-Agent') || '';
            const suspiciousPatterns = [
                /bot/i, /crawler/i, /spider/i, /scraper/i,
                /curl/i, /wget/i, /python/i, /java/i
            ];

            if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
                const ip = req.ip || req.connection.remoteAddress || 'unknown';
                SecurityMiddleware.suspiciousIPs.add(ip);
            }

            next();
        };
    }

    // Session security enhancement
    static enhanceSessionSecurity() {
        return (req: Request, res: Response, next: NextFunction) => {
            const session = (req as any).session;
            if (session) {
                // Regenerate session ID periodically
                const now = Date.now();
                if (!session.lastRegenerated || now - session.lastRegenerated > 15 * 60 * 1000) {
                    session.regenerate((err: any) => {
                        if (err) console.error('Session regeneration error:', err);
                        session.lastRegenerated = now;
                        next();
                    });
                } else {
                    next();
                }
            } else {
                next();
            }
        };
    }

    // Get security stats
    static getSecurityStats() {
        return {
            suspiciousIPs: Array.from(SecurityMiddleware.suspiciousIPs),
            rateLimitEntries: SecurityMiddleware.rateLimitStore.size,
            honeypotHits: SecurityMiddleware.honeypotTokens.size
        };
    }

    // Clear security data (for maintenance)
    static clearSecurityData() {
        SecurityMiddleware.rateLimitStore.clear();
        SecurityMiddleware.suspiciousIPs.clear();
        SecurityMiddleware.honeypotTokens.clear();
    }
}

// Password strength validator
export class PasswordValidator {
    static validate(password: string): { valid: boolean; score: number; feedback: string[] } {
        const feedback: string[] = [];
        let score = 0;

        if (password.length < 8) {
            feedback.push('Password must be at least 8 characters long');
        } else if (password.length >= 12) {
            score += 2;
        } else {
            score += 1;
        }

        if (!/[a-z]/.test(password)) {
            feedback.push('Password must contain lowercase letters');
        } else {
            score += 1;
        }

        if (!/[A-Z]/.test(password)) {
            feedback.push('Password must contain uppercase letters');
        } else {
            score += 1;
        }

        if (!/[0-9]/.test(password)) {
            feedback.push('Password must contain numbers');
        } else {
            score += 1;
        }

        if (!/[^a-zA-Z0-9]/.test(password)) {
            feedback.push('Password must contain special characters');
        } else {
            score += 1;
        }

        // Check for common patterns
        const commonPatterns = [
            /123456/, /password/, /qwerty/, /abc123/, /admin/,
            /letmein/, /welcome/, /monkey/, /dragon/
        ];

        if (commonPatterns.some(pattern => pattern.test(password.toLowerCase()))) {
            feedback.push('Password contains common patterns');
            score -= 2;
        }

        return {
            valid: feedback.length === 0 && score >= 4,
            score: Math.max(0, score),
            feedback
        };
    }
}

// Audit logging system
export class SecurityAuditLogger {
    private static logs: Array<{
        timestamp: Date;
        ip: string;
        action: string;
        userId?: string;
        details: any;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }> = [];

    static log(event: {
        ip: string;
        action: string;
        userId?: string;
        details?: any;
        severity?: 'low' | 'medium' | 'high' | 'critical';
    }) {
        SecurityAuditLogger.logs.push({
            timestamp: new Date(),
            ip: event.ip,
            action: event.action,
            userId: event.userId,
            details: event.details || {},
            severity: event.severity || 'low'
        });

        // Keep only last 1000 logs
        if (SecurityAuditLogger.logs.length > 1000) {
            SecurityAuditLogger.logs = SecurityAuditLogger.logs.slice(-1000);
        }

        // Log high severity events
        if (event.severity === 'high' || event.severity === 'critical') {
            console.warn(`[SECURITY] ${event.severity.toUpperCase()}: ${event.action}`, {
                ip: event.ip,
                userId: event.userId,
                details: event.details
            });
        }
    }

    static getLogs(limit: number = 100) {
        return SecurityAuditLogger.logs.slice(-limit);
    }

    static getLogsByIP(ip: string) {
        return SecurityAuditLogger.logs.filter(log => log.ip === ip);
    }

    static getLogsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical') {
        return SecurityAuditLogger.logs.filter(log => log.severity === severity);
    }
}