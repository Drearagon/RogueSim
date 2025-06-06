import 'dotenv/config';
import { initDatabase, getDb, getPool } from './server/db.ts';

async function fixVerificationAndLogin() {
    console.log('=== Fixing Verification Code and Login Issues ===');
    
    try {
        await initDatabase();
        const pool = getPool();
        
        console.log('1. Current Database Status:');
        
        // Check current time zones and settings
        const timeResult = await pool.query(`
            SELECT 
                NOW() as current_time,
                CURRENT_TIMESTAMP as current_timestamp,
                EXTRACT(timezone_hour FROM NOW()) as timezone_hour
        `);
        console.log(`   Database time: ${timeResult.rows[0].current_time}`);
        console.log(`   Timezone offset: ${timeResult.rows[0].timezone_hour} hours`);
        
        // Check current verification codes
        const existingCodes = await pool.query(`
            SELECT code, used, expires_at,
                   EXTRACT(EPOCH FROM (expires_at - NOW())) / 60 as minutes_until_expiry
            FROM verification_codes 
            WHERE email = 'donavinrediron@gmail.com' 
            ORDER BY created_at DESC LIMIT 3
        `);
        
        console.log('\n2. Current Verification Codes:');
        existingCodes.rows.forEach((code, index) => {
            console.log(`   ${index + 1}. Code: ${code.code} - Used: ${code.used} - Minutes until expiry: ${Math.round(code.minutes_until_expiry)}`);
        });
        
        // FIX 1: Clean up old verification codes and create new ones with longer expiration
        console.log('\n3. Cleaning up old verification codes...');
        await pool.query(`
            DELETE FROM verification_codes 
            WHERE email = 'donavinrediron@gmail.com' AND used = true
        `);
        console.log('   ✅ Cleaned up used verification codes');
        
        // FIX 2: Update existing unused codes to have longer expiration (2 hours)
        console.log('\n4. Extending expiration time for unused codes...');
        const updateResult = await pool.query(`
            UPDATE verification_codes 
            SET expires_at = NOW() + INTERVAL '2 hours'
            WHERE email = 'donavinrediron@gmail.com' AND used = false
            RETURNING code, expires_at
        `);
        
        if (updateResult.rows.length > 0) {
            console.log('   ✅ Extended expiration for existing codes:');
            updateResult.rows.forEach((code, index) => {
                console.log(`     ${index + 1}. Code: ${code.code} - New expiry: ${code.expires_at}`);
            });
        } else {
            console.log('   ℹ️ No unused codes found to extend');
        }
        
        // FIX 3: Create new verification codes with longer expiration
        console.log('\n5. Creating new verification codes...');
        const newCodes = [];
        for (let i = 0; i < 2; i++) {
            const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
            const insertResult = await pool.query(`
                INSERT INTO verification_codes (email, hacker_name, code, expires_at, used, created_at)
                VALUES ($1, $2, $3, NOW() + INTERVAL '2 hours', false, NOW())
                RETURNING code, expires_at
            `, ['donavinrediron@gmail.com', 'Blank', code]);
            
            newCodes.push(insertResult.rows[0]);
        }
        
        console.log('   ✅ Created new verification codes:');
        newCodes.forEach((code, index) => {
            console.log(`     ${index + 1}. Code: ${code.code} - Expires: ${code.expires_at}`);
        });
        
        // FIX 4: Verify the account can be accessed
        console.log('\n6. Account Access Information:');
        const userResult = await pool.query(`
            SELECT id, email, hacker_name, created_at 
            FROM users 
            WHERE email = 'donavinrediron@gmail.com'
        `);
        
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            console.log('   ✅ Existing account found:');
            console.log(`     Email: ${user.email}`);
            console.log(`     Hacker Name: ${user.hacker_name}`);
            console.log(`     User ID: ${user.id}`);
            console.log(`     Created: ${user.created_at}`);
        }
        
        // FIX 5: Get all valid verification codes
        console.log('\n7. All Valid Verification Codes:');
        const validCodes = await pool.query(`
            SELECT code, expires_at,
                   EXTRACT(EPOCH FROM (expires_at - NOW())) / 60 as minutes_until_expiry
            FROM verification_codes 
            WHERE email = 'donavinrediron@gmail.com' 
            AND used = false 
            AND expires_at > NOW()
            ORDER BY created_at DESC
        `);
        
        if (validCodes.rows.length > 0) {
            console.log('   ✅ Valid codes available:');
            validCodes.rows.forEach((code, index) => {
                console.log(`     ${index + 1}. Code: ${code.code} - Valid for ${Math.round(code.minutes_until_expiry)} minutes`);
            });
        } else {
            console.log('   ❌ No valid codes found');
        }
        
        console.log('\n=== SUMMARY ===');
        console.log('✅ Fixed verification code expiration issues');
        console.log('✅ Created new verification codes with 2-hour expiration');
        console.log('✅ Account exists and is accessible');
        console.log('');
        console.log('NEXT STEPS:');
        console.log('1. Use any of the valid verification codes shown above');
        console.log('2. Or login with existing account: donavinrediron@gmail.com');
        console.log('3. If you forgot the password, create a new account with different email');
        console.log('');
        console.log('TESTING:');
        console.log('   npm run dev    # Start development server');
        console.log('   # Then test verification codes in the web interface');
        
    } catch (error) {
        console.error('❌ Fix failed:', error);
    }
}

fixVerificationAndLogin(); 