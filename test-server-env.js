// Mimic server/index.ts startup
import 'dotenv/config';

console.log('=== SERVER STARTUP ENV TEST ===');
console.log('SENDGRID_API_KEY available at startup:', !!process.env.SENDGRID_API_KEY);

// Now import the email service to see what happens
import('./server/emailService.js')
  .then(() => {
    console.log('Email service imported successfully');
  })
  .catch(err => {
    console.error('Error importing email service:', err);
  }); 