import 'dotenv/config';
import { initDatabase, getDb, getPool } from './server/db.ts';

async function addFreshVerificationCodes() {
    console.log('=== Adding Fresh Verification Codes ===');
    
    try {
        await initDatabase();
        const pool = getPool();
        
        // Clear any existing verification codes for the user
        console.log('1. Clearing old verification codes...');
        await pool.query('DELETE FROM verification_codes WHERE email = $1', ['donavinrediron@gmail.com']);
        console.log('   ✅ Old codes cleared');
        
        // Create 5 fresh verification codes with 6-hour expiration
        console.log('\n2. Creating fresh verification codes...');
        const newCodes = [];
        
        for (let i = 0; i < 5; i++) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const insertResult = await pool.query(`
                INSERT INTO verification_codes (email, hacker_name, code, expires_at, used, created_at)
                VALUES ($1, $2, $3, NOW() + INTERVAL '6 hours', false, NOW())
                RETURNING code, expires_at
            `, ['donavinrediron@gmail.com', 'Blank', code]);
            
            newCodes.push(insertResult.rows[0]);
        }
        
        // Display the codes
        console.log('   ✅ Created 5 fresh verification codes (6-hour expiration):');
        newCodes.forEach((codeData, index) => {
            console.log(`     ${index + 1}. Code: ${codeData.code}`);
            console.log(`        Expires: ${codeData.expires_at}`);
        });
        
        // Verify they're working
        console.log('\n3. Verifying codes are valid...');
        const verifyResult = await pool.query(`
            SELECT COUNT(*) as valid_count
            FROM verification_codes 
            WHERE email = $1 AND used = false AND expires_at > NOW()
        `, ['donavinrediron@gmail.com']);
        
        console.log(`   ✅ ${verifyResult.rows[0].valid_count} valid codes ready for use`);
        
        // Show current database time for reference
        const timeResult = await pool.query('SELECT NOW() as current_time');
        console.log(`   Database time: ${timeResult.rows[0].current_time}`);
        
        console.log('\n=== SUCCESS ===');
        console.log('🎯 Fresh verification codes are ready!');
        console.log('📧 Use email: donavinrediron@gmail.com');
        console.log('🔢 Use any of the codes shown above');
        console.log('⏰ Codes valid for 6 hours');
        
        console.log('\n=== TESTING INSTRUCTIONS ===');
        console.log('1. Go to your website verification page');
        console.log('2. Enter email: donavinrediron@gmail.com');
        console.log('3. Enter any of the codes above');
        console.log('4. Should work immediately!');
        
    } catch (error) {
        console.error('❌ Failed to add verification codes:', error);
    }
}

addFreshVerificationCodes(); 