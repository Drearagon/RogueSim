import 'dotenv/config';
import { initDatabase, getDb, getPool } from './server/db.ts';

async function debugVerificationIssue() {
    console.log('=== Debugging Current Verification Issues ===');
    
    try {
        await initDatabase();
        const pool = getPool();
        
        // 1. Check current system time vs database time
        console.log('1. Time Synchronization Check:');
        const timeResult = await pool.query(`
            SELECT 
                NOW() as db_time,
                CURRENT_TIMESTAMP as current_ts,
                EXTRACT(timezone_hour FROM NOW()) as tz_offset
        `);
        
        const dbTime = new Date(timeResult.rows[0].db_time);
        const localTime = new Date();
        const timeDiff = Math.abs(dbTime.getTime() - localTime.getTime()) / 1000; // seconds
        
        console.log(`   Database time: ${dbTime}`);
        console.log(`   Local time: ${localTime}`);
        console.log(`   Time difference: ${timeDiff} seconds`);
        console.log(`   Timezone offset: ${timeResult.rows[0].tz_offset} hours`);
        
        if (timeDiff > 60) {
            console.log('   ⚠️ WARNING: Significant time difference detected!');
        }
        
        // 2. Check all verification codes status
        console.log('\n2. Current Verification Codes Status:');
        const allCodes = await pool.query(`
            SELECT 
                code, 
                used, 
                expires_at,
                created_at,
                CASE 
                    WHEN used = true THEN 'USED'
                    WHEN expires_at <= NOW() THEN 'EXPIRED'
                    ELSE 'VALID'
                END as status,
                EXTRACT(EPOCH FROM (expires_at - NOW())) / 60 as minutes_remaining
            FROM verification_codes 
            WHERE email = 'donavinrediron@gmail.com'
            ORDER BY created_at DESC
        `);
        
        console.log(`   Found ${allCodes.rows.length} verification codes:`);
        allCodes.rows.forEach((code, index) => {
            const remaining = Math.round(code.minutes_remaining);
            console.log(`     ${index + 1}. Code: ${code.code} - Status: ${code.status} - Minutes remaining: ${remaining}`);
            console.log(`        Created: ${code.created_at}`);
            console.log(`        Expires: ${code.expires_at}`);
        });
        
        // 3. Test verification logic manually
        console.log('\n3. Testing Verification Logic:');
        const validCodes = allCodes.rows.filter(c => c.status === 'VALID');
        
        if (validCodes.length > 0) {
            const testCode = validCodes[0];
            console.log(`   Testing with code: ${testCode.code}`);
            
            // Simulate the exact verification query from the app
            const verificationResult = await pool.query(
                'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND used = false ORDER BY created_at DESC LIMIT 1',
                ['donavinrediron@gmail.com', testCode.code]
            );
            
            if (verificationResult.rows.length > 0) {
                const verification = verificationResult.rows[0];
                const isExpired = new Date() > new Date(verification.expires_at);
                console.log(`   ✅ Code found in database`);
                console.log(`   Used status: ${verification.used}`);
                console.log(`   Expires at: ${verification.expires_at}`);
                console.log(`   Is expired: ${isExpired}`);
                console.log(`   Current time: ${new Date()}`);
                
                if (!isExpired && !verification.used) {
                    console.log('   ✅ Code should be VALID for verification');
                } else {
                    console.log('   ❌ Code would FAIL verification');
                }
            } else {
                console.log('   ❌ Code not found or already used');
            }
        }
        
        // 4. Check for potential race conditions or duplicate processing
        console.log('\n4. Checking for duplicate or race condition issues:');
        const duplicates = await pool.query(`
            SELECT code, COUNT(*) as count
            FROM verification_codes 
            WHERE email = 'donavinrediron@gmail.com'
            GROUP BY code
            HAVING COUNT(*) > 1
        `);
        
        if (duplicates.rows.length > 0) {
            console.log('   ⚠️ Found duplicate verification codes:');
            duplicates.rows.forEach(dup => {
                console.log(`     Code ${dup.code} appears ${dup.count} times`);
            });
        } else {
            console.log('   ✅ No duplicate codes found');
        }
        
        // 5. Check session table and session issues
        console.log('\n5. Session Management Check:');
        try {
            const sessionCheck = await pool.query(`
                SELECT COUNT(*) as session_count 
                FROM sessions 
                WHERE sess->>'userId' IS NOT NULL
            `);
            console.log(`   Active sessions with userId: ${sessionCheck.rows[0].session_count}`);
        } catch (error) {
            console.log('   ⚠️ Could not check sessions table:', error.message);
        }
        
        // 6. Create fresh verification codes with debugging
        console.log('\n6. Creating Fresh Test Verification Codes:');
        await pool.query('DELETE FROM verification_codes WHERE email = $1', ['donavinrediron@gmail.com']);
        
        const newCodes = [];
        for (let i = 0; i < 3; i++) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const insertResult = await pool.query(`
                INSERT INTO verification_codes (email, hacker_name, code, expires_at, used, created_at)
                VALUES ($1, $2, $3, NOW() + INTERVAL '4 hours', false, NOW())
                RETURNING code, expires_at, 
                    EXTRACT(EPOCH FROM (expires_at - NOW())) / 60 as minutes_valid
            `, ['donavinrediron@gmail.com', 'Blank', code]);
            
            newCodes.push(insertResult.rows[0]);
        }
        
        console.log('   ✅ Created fresh verification codes (4-hour expiration):');
        newCodes.forEach((code, index) => {
            console.log(`     ${index + 1}. Code: ${code.code} - Valid for: ${Math.round(code.minutes_valid)} minutes`);
            console.log(`        Expires: ${code.expires_at}`);
        });
        
        console.log('\n=== RECOMMENDATIONS ===');
        console.log('1. Use any of the fresh codes created above');
        console.log('2. Make sure to copy the EXACT code (no extra spaces)');
        console.log('3. Submit the verification immediately after copying');
        console.log('4. Check browser console for any JavaScript errors');
        console.log('5. Ensure you\'re on the correct URL (http://localhost:3000)');
        
        console.log('\n=== SESSION ISSUE FIX ===');
        console.log('The tab-out refresh issue is likely due to session cookie settings.');
        console.log('This should be fixed by ensuring SESSION_SECRET is set properly.');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugVerificationIssue(); 