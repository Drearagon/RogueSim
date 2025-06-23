// Debug script to check what's being passed to DatabaseStorage
const { getDb, getPool } = require('./server/db');

async function debugStorage() {
    console.log('=== STORAGE DEBUG ===');
    
    try {
        const db = getDb();
        const pool = getPool();
        
        console.log('db type:', typeof db);
        console.log('db defined:', !!db);
        console.log('db constructor:', db?.constructor?.name);
        
        console.log('pool type:', typeof pool);
        console.log('pool defined:', !!pool);
        console.log('pool constructor:', pool?.constructor?.name);
        console.log('pool.query type:', typeof pool?.query);
        console.log('pool has query method:', 'query' in (pool || {}));
        
        // Test if it's a postgres.js client (supports template literals)
        console.log('pool is postgres.js client:', typeof pool === 'function');
        
        // Test if it's a Neon Pool
        console.log('pool appears to be Neon Pool:', typeof pool?.query === 'function');
        
        console.log('Environment variables:');
        console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
        console.log('DATABASE_URL includes neon:', process.env.DATABASE_URL?.includes('neon') || false);
        
    } catch (error) {
        console.error('Error in debug:', error);
    }
}

debugStorage(); 