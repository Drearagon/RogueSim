import type { Request, Response, NextFunction } from 'express';
import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const PROD_ORIGINS = [
  'https://roguesim.com',
  'https://www.roguesim.com',
];

// Denylist of exact or glob-like paths frequently probed by scanners
// We match case-insensitively and normalize. Keep list tight to avoid false positives.
const SENSITIVE_PATHS = [
  // phpinfo and symfony profiler
  '/phpinfo',
  '/phpinfo.php',
  '/phpinfo.php3',
  '/phpinfo.php5',
  '/_profiler/phpinfo',
  '/symfony/_profiler/phpinfo',
  '/app_dev.php/_profiler/phpinfo',
  '/index.php/phpinfo',
  // common JS/JSON/YAML/TOML config names
  '/config.js',
  '/config.json',
  '/config/config.json',
  '/config/default.json',
  '/config/development.json',
  '/config/production.json',
  '/config/prod.json',
  '/config/staging.json',
  '/config/dev.json',
  '/config/local.json',
  '/config/test.json',
  '/config/settings.json',
  '/config/environment.json',
  '/config/env.json',
  '/config/aws.json',
  '/config/aws.yml',
  '/aws.yml',
  '/sftp.json',
  '/sftp-config.json',
  '/settings.json',
  '/env.json',
  '/private/env.json',
  '/private/config.json',
  '/src/config/config.json',
  '/src/settings.json',
  '/src/config/environment.json',
  '/conf/application.json',
  '/application/config/constants.php/',
  '/meteor.settings.json',
  '/hosting.json',
  '/launchsettings.json',
  '/bundleconfig.json',
  '/angular.json',
  '/tsconfig.json',
  '/tsconfig.app.json',
  '/tsconfig.spec.json',
  '/properties/launchsettings.json',
  '/appsettings.json',
  '/appsettings.test.json',
  '/appsettings.development.json',
  '/appsettings.staging.json',
  '/appsettings.local.json',
  '/appsettings.qa.json',
  '/appsettings.production.json',
  // misc lures
  '/live_env',
  '/?pp=env',
  '/?pp=enable&pp=env',
  '/login?pp=enable&pp=env',
];

// Lightweight UA and path heuristics. We do NOT blanket-block unknown clients; we rate-limit and 404.
function looksLikeScanner(req: Request): boolean {
  const ua = String(req.headers['user-agent'] || '').toLowerCase();
  const p = req.path.toLowerCase();

  // Very specific noisy UA seen in logs; treat as suspicious but don't hard-block legitimate reverse proxies.
  const badUA =
    ua.includes('go-http-client') ||
    (ua.includes('curl/') && !p.startsWith('/health'));

  // suspicious query toggles
  const q = (req.url || '').toLowerCase();
  const badQuery = q.includes('pp=env') || q.includes('pp=enable');

  return badUA || badQuery;
}

// Normalize incoming path (strip trailing slash)
function normalizedPath(path: string): string {
  if (!path) return '/';
  try {
    const u = new URL('http://localhost' + path);
    return u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return path.replace(/\/+$/, '') || '/';
  }
}

// Middleware: deny sensitive paths with 404 (or 410) BEFORE static/SPAs
export function denySensitivePaths() {
  const setNoIndex = (res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const raw = (req.originalUrl || req.url || '').toLowerCase();
    const p = normalizedPath(req.path).toLowerCase();
    if (SENSITIVE_PATHS.includes(raw) || SENSITIVE_PATHS.includes(p)) {
      setNoIndex(res);
      // 404 keeps scanners guessing; 410 can also be used to dissuade re-crawls. Use 404 here.
      return res.status(404).send('Not found');
    }
    next();
  };
}

// Helmet with a tight-but-compatible CSP for SPA + API. Adjust sources as needed for your front-end.
export function applyHelmet() {
  return helmet({
    xPoweredBy: false,
    frameguard: { action: 'sameorigin' },
    referrerPolicy: { policy: 'no-referrer' },
    // When behind Cloudflare, HSTS is ideally set at CF; keeping it here is fine but harmless if duplicated.
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: false },
    // Customize CSP to your asset pipeline
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", 'https://roguesim.com', 'https://www.roguesim.com'],
        'frame-ancestors': ["'self'"],
        'upgrade-insecure-requests': [],
      },
    },
    // Modern Permissions-Policy (was Feature-Policy)
    permissionsPolicy: {
      features: {
        accelerometer: ["'none'"],
        camera: ["'none'"],
        geolocation: ["'none'"],
        gyroscope: ["'none'"],
        microphone: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"],
      },
    },
  } as any);
}

// CORS: allow only prod origins; allow health from localhost
export function applyCors() {
  return cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow same-origin/no-origin (curl, health checks)
      if (process.env.NODE_ENV !== 'production' && /localhost|127\.0\.0\.1/.test(origin)) {
        return cb(null, true);
      }
      if (PROD_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
}

// Rate limits
export const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login/signup attempts',
});

export const scannerLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Slow down',
});

// Attach a request id for tracing
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  (req as any).requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

// Soft handling for obvious scanners: tighten rate-limit and never fall back to SPA for their probes
export function scannerGuard(req: Request, res: Response, next: NextFunction) {
  if (looksLikeScanner(req)) {
    // If it's also a sensitive path, denySensitivePaths already caught it.
    // Otherwise, apply extra headers and pass through a tighter limit (handled at route level).
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
}

// Ensure Express knows it's behind a proxy (Cloudflare), for secure cookies and IPs
export function applyTrustProxy(app: Express) {
  app.set('trust proxy', 1);
}
