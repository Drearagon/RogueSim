import fs from 'fs';
import path from 'path';

console.log('=== RogueSim Development Database Setup ===');
console.log('');

console.log('ISSUE IDENTIFIED:');
console.log('Your local development environment is using SQLite database,');
console.log('but your production environment uses Neon PostgreSQL database.');
console.log('This means verification codes and user accounts created locally');
console.log('don\'t exist in production, and vice versa.');
console.log('');

console.log('SOLUTION:');
console.log('Set up your local development to use the same Neon database as production.');
console.log('');

// Check if .env file exists
const envPath = '.env';
const envExists = fs.existsSync(envPath);

console.log(`Current status: .env file ${envExists ? 'EXISTS' : 'DOES NOT EXIST'}`);

if (!envExists) {
    console.log('');
    console.log('TO FIX THIS ISSUE:');
    console.log('');
    console.log('1. Get your Neon database URL from your production environment');
    console.log('   - Check your Hetzner server environment variables');
    console.log('   - Or get it from your Neon dashboard at console.neon.tech');
    console.log('');
    console.log('2. Create a .env file in your project root with this content:');
    console.log('');
    console.log('   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require');
    console.log('   NODE_ENV=development');
    console.log('   PORT=5000');
    console.log('   SESSION_SECRET=your-session-secret');
    console.log('   SENDGRID_API_KEY=your-sendgrid-key');
    console.log('   FROM_EMAIL=your-email');
    console.log('');
    console.log('3. Then restart your development server');
    console.log('');
    
    // Create a template .env file
    const envTemplate = `# RogueSim Development Environment
# Replace DATABASE_URL with your actual Neon database URL

DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long

# Email Configuration (get from your production environment)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# Optional: OpenAI for AI missions
OPENAI_API_KEY=your-openai-api-key
`;

    fs.writeFileSync('.env.template', envTemplate);
    console.log('✅ Created .env.template file for you to customize');
    console.log('');
    console.log('QUICK COMMANDS TO GET YOUR PRODUCTION DATABASE URL:');
    console.log('');
    console.log('If using Docker on Hetzner:');
    console.log('   ssh your-server');
    console.log('   cd /path/to/your/app');
    console.log('   docker-compose exec app env | grep DATABASE_URL');
    console.log('');
} else {
    console.log('');
    console.log('You have a .env file. Let me check if DATABASE_URL is set...');
    
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const hasDatabaseUrl = envContent.includes('DATABASE_URL=') && 
                              !envContent.includes('DATABASE_URL=postgresql://username:password@localhost');
        
        if (hasDatabaseUrl) {
            console.log('✅ DATABASE_URL appears to be configured in your .env file');
            console.log('');
            console.log('If you\'re still having issues, run this test:');
            console.log('   npx tsx debug-database-setup.js');
        } else {
            console.log('❌ DATABASE_URL is not properly configured in your .env file');
            console.log('');
            console.log('Please update your .env file with your Neon database URL');
        }
    } catch (error) {
        console.log('❌ Could not read .env file:', error.message);
    }
}

console.log('');
console.log('VERIFICATION:');
console.log('After setting up DATABASE_URL, run these commands to verify:');
console.log('');
console.log('   npx tsx debug-database-setup.js     # Should show Neon connection');
console.log('   npx tsx test-existing-users.js      # Should show your production users');
console.log('   npm run dev                         # Start development server');
console.log('');
console.log('Once connected to Neon, your local development will use the same');
console.log('database as production, fixing the verification code and login issues.'); 