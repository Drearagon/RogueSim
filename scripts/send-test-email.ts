import 'dotenv/config';
import { sendVerificationEmail } from '../server/emailService';

async function main() {
  const emailArg = process.argv[2] || process.env.TEST_EMAIL;
  if (!emailArg) {
    console.error('Usage: tsx scripts/send-test-email.ts <email>');
    process.exit(2);
  }

  // Generate a simple 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Attempting to send verification email to ${emailArg} with code ${code}...`);

  const ok = await sendVerificationEmail(emailArg, code, 'SendGrid Test');
  if (!ok) {
    console.error('SendGrid test email failed. Check logs and SENDGRID_API_KEY/FROM_EMAIL.');
    process.exit(1);
  }

  console.log('SendGrid test email dispatched (or simulated if no API key).');
}

main().catch((e) => {
  console.error('Unexpected error sending test email:', e);
  process.exit(1);
});

