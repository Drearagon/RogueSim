// server/db.ts (Refactored for proper async initialization)
import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import postgres from 'postgres'; // For regular PostgreSQL connection
import ws from "ws"; // For Neon
import * as schema from "@shared/schema"; // Your Drizzle schema
import { log } from "./vite"; // Your logger

// Private module-level variables
let initializedDb: any;
let initializedPool: any;

// Export getter functions to access the initialized instances
export function getDb(): any {
    if (!initializedDb) {
        throw new Error("Database not initialized. Call initDatabase() first.");
    }
    return initializedDb;
}

export function getPool(): any {
    if (!initializedPool) {
        throw new Error("Database pool not initialized. Call initDatabase() first.");
    }
    return initializedPool;
}

export async function initDatabase(): Promise<void> {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL environment variable is required");
        }

        log('🔗 Initializing database connection...');

        neonConfig.webSocketConstructor = ws;

        const isNeon = process.env.DATABASE_URL.includes('neon.tech') ||
                       process.env.DATABASE_URL.includes('neon.database.azure.com');

        if (isNeon) {
            // Use Neon serverless configuration
            const neonPool = new Pool({ connectionString: process.env.DATABASE_URL });
            initializedDb = drizzleNeon({ client: neonPool, schema });
            initializedPool = neonPool; // Assign to initializedPool
            log('🔗 Connected to Neon PostgreSQL (Serverless)');
        } else {
            // Use regular PostgreSQL configuration (postgres.js client)
            const pgClient = postgres(process.env.DATABASE_URL, {
                max: 10,
                idle_timeout: 20,
                connect_timeout: 10,
            });
            initializedDb = drizzle(pgClient, { schema });
            initializedPool = pgClient; // Assign to initializedPool
            log('🔗 Connected to PostgreSQL (Regular)');
        }

        // Test the connection with a simple query using the appropriate client method
        if (initializedPool.query) { // For node-postgres Pool
            await initializedPool.query('SELECT NOW()');
        } else if (initializedPool) { // For postgres.js client (which uses template literals)
            await initializedPool`SELECT NOW()`;
        }

        log('✅ Database connection test successful');
    } catch (error) {
        log(`❌ Database connection failed during init: ${(error as Error).message}`, 'error');
        throw error; // Re-throw to prevent server startup without DB
    }
}