import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import postgres from 'postgres'; // For regular PostgreSQL connection
import ws from "ws"; // For Neon
import * as schema from "@shared/schema"; // Your Drizzle schema
import { log } from "./vite"; // Your logger
import { initLocalDatabase, LocalDatabaseStorage, isLocalDbAvailable, getLocalDbStats } from './localDB';

// Private module-level variables that will hold the initialized database clients
let initializedDb: any;
let initializedPool: any; // This will hold the raw client (postgres.js client or Neon Pool)
let localStorage: LocalDatabaseStorage | null = null;
let usingLocalFallback = false;

// Export getter functions to access the initialized instances
export function getDb(): any {
    log(`DEBUG: getDb() called. initializedDb defined=${!!initializedDb}`, 'db');
    if (!initializedDb) {
        throw new Error("Database not initialized. Call initDatabase() first.");
    }
    return initializedDb;
}

export function getPool(): any {
    log(`DEBUG: getPool() called. initializedPool defined=${!!initializedPool}`, 'db');
    if (!initializedPool) {
        throw new Error("Database pool not initialized. Call initDatabase() first.");
    }
    return initializedPool;
}

export async function initDatabase(): Promise<void> {
    try {
        log('DEBUG: initDatabase() started.', 'db');

        // Always initialize local database as backup
        await initLocalDatabase();
        localStorage = new LocalDatabaseStorage();
        log('✅ Local backup database initialized', 'db');

        if (!process.env.DATABASE_URL) {
            log('⚠️ DATABASE_URL environment variable is not set. Using local database only.', 'db');
            usingLocalFallback = true;
            log('🔄 Running in LOCAL DATABASE MODE - all data will be stored locally', 'db');
            return; // Continue without main database
        }

        log('🔗 Attempting to initialize database connection...');

        // Configure for Neon if using serverless
        if (typeof ws !== 'undefined') { // Check if ws is defined (only in Node.js env)
             neonConfig.webSocketConstructor = ws;
        } else {
             log('WARN: WebSocket constructor (ws) not available for Neon. Skipping Neon WebSocket config.', 'db');
        }


        const isNeon = process.env.DATABASE_URL.includes('neon.tech') ||
                       process.env.DATABASE_URL.includes('neon.database.azure.com');

        if (isNeon) {
            log('DEBUG: Using Neon serverless configuration.', 'db');
            // Ensure pool is only created once to prevent multiple connections
            if (!initializedPool) {
                initializedPool = new Pool({ connectionString: process.env.DATABASE_URL });
            }
            initializedDb = drizzleNeon({ client: initializedPool, schema });
            log('🔗 Connected to Neon PostgreSQL (Serverless)');
        } else {
            log('DEBUG: Using regular PostgreSQL configuration (postgres.js client).', 'db');
            // Ensure client is only created once
            if (!initializedPool) {
                initializedPool = postgres(process.env.DATABASE_URL, {
                    max: 10,
                    idle_timeout: 20,
                    connect_timeout: 10,
                });
            }
            initializedDb = drizzle(initializedPool, { schema }); // Drizzle expects the client itself
            log('🔗 Connected to PostgreSQL (Regular)');
        }

        // Test the connection with a simple query using the appropriate client method
        // This is where the actual connection is established and tested.
        if (initializedPool && typeof initializedPool.query === 'function') { // For node-postgres Pool or drizzle-orm raw client
            await initializedPool.query('SELECT NOW()');
        } else if (initializedPool) { // For postgres.js client (which uses template literals for queries)
            await initializedPool`SELECT NOW()`;
        } else {
            throw new Error("Database client (pool) not successfully initialized.");
        }

        log('✅ Database connection test successful', 'db');
        log(`DEBUG: Initialized DB and Pool values: db defined=${!!initializedDb}, pool defined=${!!initializedPool}`, 'db');

    } catch (error) {
        log(`❌ Main database connection failed: ${(error as Error).message}`, 'error');
        
        // Fall back to local database if main database fails
        if (isLocalDbAvailable()) {
            log('🔄 Falling back to local database due to main database failure', 'db');
            usingLocalFallback = true;
            
            // Clear main DB references on failure
            initializedDb = undefined;
            initializedPool = undefined;
            
            // Log local database status
            const stats = await getLocalDbStats();
            log(`📊 Local database stats: ${JSON.stringify(stats)}`, 'db');
            
            return; // Continue with local database
        } else {
            log('❌ Both main and local databases failed to initialize', 'error');
            throw error; // Re-throw only if both fail
        }
    }
}

// Get storage instance (main or local fallback)
export function getStorage(): any {
    if (usingLocalFallback && localStorage) {
        return localStorage;
    }
    
    if (!initializedDb) {
        if (localStorage) {
            log('⚠️ Main DB not available, using local storage', 'db');
            usingLocalFallback = true;
            return localStorage;
        }
        throw new Error("No database available. Both main and local databases failed.");
    }
    
    return initializedDb;
}

// Check if we're using local fallback
export function isUsingLocalFallback(): boolean {
    return usingLocalFallback;
}

// Get local storage instance
export function getLocalStorage(): LocalDatabaseStorage | null {
    return localStorage;
}

// Test main database connection and switch back if available
export async function testMainDatabaseConnection(): Promise<boolean> {
    if (!process.env.DATABASE_URL || !initializedPool) {
        return false;
    }
    
    try {
        if (initializedPool && typeof initializedPool.query === 'function') {
            await initializedPool.query('SELECT NOW()');
        } else if (initializedPool) {
            await initializedPool`SELECT NOW()`;
        }
        
        if (usingLocalFallback) {
            log('✅ Main database connection restored! Switching back from local fallback', 'db');
            usingLocalFallback = false;
        }
        
        return true;
    } catch (error) {
        if (!usingLocalFallback) {
            log('⚠️ Main database connection lost, switching to local fallback', 'db');
            usingLocalFallback = true;
        }
        return false;
    }
}