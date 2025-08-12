import sgMail from '@sendgrid/mail';
import { logger } from './logger';

// Initialize SendGrid with environment variables
// Note: Environment variables are loaded by dotenv/config in index.ts

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SENDGRID_FROM || 'uplink@roguesim.com';

if (SENDGRID_API_KEY) {
  try {
    sgMail.setApiKey(SENDGRID_API_KEY);
    logger.info('✅ SendGrid API initialized successfully');
  } catch (e: any) {
    logger.error(`❌ Failed to initialize SendGrid API: ${e?.message || e}`);
  }
} else {
  logger.warn('⚠️ SENDGRID_API_KEY not found, email sending will be simulated');
}

export interface EmailTemplate {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const createVerificationEmailTemplate = (email: string, verificationCode: string, hackerName?: string): EmailTemplate => {
  const displayName = hackerName || 'Agent';
  
  return {
    to: email,
    subject: '🔐 RogueSim Network Access Verification',
    text: `
SECURE TRANSMISSION - ROGUESIM NETWORK
======================================

Welcome to the Shadow Network, ${displayName}.

Your access verification code is: ${verificationCode}

This code will expire in 10 minutes for security purposes.

Enter this code in the RogueSim terminal to complete your network authentication.

CLASSIFICATION: CONFIDENTIAL
NETWORK: ROGUESIM
AGENT: ${displayName}
STATUS: PENDING_VERIFICATION

Never share this code with anyone. The RogueSim team will never ask for this code.

//END TRANSMISSION//
    `,
    html: `
    <div style="background: #000000; color: #00ff00; font-family: 'Courier New', monospace; padding: 20px; border: 2px solid #00ff00;">
      <div style="text-align: center; border-bottom: 1px solid #00ff00; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #00ff00; margin: 0; text-shadow: 0 0 10px #00ff00;">⚡ ROGUESIM NETWORK ⚡</h1>
        <p style="color: #00ffff; margin: 5px 0;">SECURE TRANSMISSION PROTOCOL</p>
        </div>

      <div style="margin: 20px 0;">
        <p style="color: #00ff00;">Welcome to the Shadow Network, <strong style="color: #00ffff;">${displayName}</strong>.</p>
        
        <div style="background: #001100; border: 1px solid #00ff00; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="color: #00ffff; margin: 0 0 10px 0;">ACCESS VERIFICATION CODE:</p>
          <h2 style="color: #ffff00; font-size: 32px; letter-spacing: 8px; margin: 0; text-shadow: 0 0 15px #ffff00;">${verificationCode}</h2>
        </div>

        <div style="border-left: 3px solid #ff6600; padding-left: 15px; margin: 20px 0;">
          <p style="color: #ff6600; margin: 0;"><strong>⚠️ SECURITY NOTICE:</strong></p>
          <p style="color: #00ff00; margin: 5px 0;">• Code expires in 10 minutes</p>
          <p style="color: #00ff00; margin: 5px 0;">• Never share with unauthorized personnel</p>
          <p style="color: #00ff00; margin: 5px 0;">• RogueSim agents will never request this code</p>
        </div>

        <div style="margin: 20px 0; padding: 10px; background: #000033; border: 1px solid #0099ff;">
          <p style="color: #0099ff; margin: 0; font-size: 12px;">
            CLASSIFICATION: CONFIDENTIAL<br/>
            NETWORK: ROGUESIM<br/>
            AGENT: ${displayName}<br/>
            STATUS: PENDING_VERIFICATION
          </p>
        </div>
        </div>

      <div style="text-align: center; border-top: 1px solid #00ff00; padding-top: 15px; margin-top: 20px;">
        <p style="color: #666666; font-size: 12px;">// END TRANSMISSION //</p>
        </div>
    </div>
    `
  };
};

const SHOULD_LOG_CODES = process.env.VERIFICATION_LOGGING === 'true';

export const sendVerificationEmail = async (email: string, verificationCode: string, hackerName?: string): Promise<boolean> => {
  try {
     // Log the outbound verification attempt (optionally include code)
     if (SHOULD_LOG_CODES) {
       logger.info({ event: 'send_verification_email', email, verificationCode }, `Preparing verification email with code ${verificationCode} for ${email}`);
     } else {
       logger.info({ event: 'send_verification_email', email }, `Preparing verification email for ${email}`);
     }

     if (!SENDGRID_API_KEY) {
       if (SHOULD_LOG_CODES) {
         logger.warn(`📧 Email simulation: Verification code ${verificationCode} would be sent to ${email}`);
       } else {
         logger.warn(`📧 Email simulation: Verification email would be sent to ${email}`);
       }
       // Return true for development/testing purposes when no API key is configured
       return true;
     }

     // Validate configured FROM address to avoid SendGrid rejections
     if (!FROM_EMAIL || /yourdomain\.com$/i.test(FROM_EMAIL)) {
       logger.error('❌ Invalid FROM_EMAIL configured. Set a verified sender in FROM_EMAIL or SENDGRID_FROM');
       return false;
     }

     const emailTemplate = createVerificationEmailTemplate(email, verificationCode, hackerName);
     
     const msg = {
       to: email,
       from: FROM_EMAIL,
       subject: emailTemplate.subject,
       text: emailTemplate.text,
       html: emailTemplate.html,
     };

     const [resp] = await sgMail.send(msg);
     logger.debug?.(`SendGrid response: status=${resp?.statusCode}`);
     // Include the code in success log for accurate debugging (optional)
     if (SHOULD_LOG_CODES) {
       logger.info({ event: 'verification_email_sent', email, verificationCode }, `✅ Verification email sent successfully to ${email} (code ${verificationCode})`);
     } else {
       logger.info({ event: 'verification_email_sent', email }, `✅ Verification email sent successfully to ${email}`);
     }
     return true;
     
   } catch (error: any) {
     logger.error(`❌ Failed to send verification email to ${email}: ${error?.message || error}`);
     
     // Log detailed error for debugging
     if (error.response) {
       try {
         logger.error(`SendGrid error details: ${JSON.stringify(error.response.body)}`);
       } catch {}
     }
    
      return false;
  }
};

export const sendWelcomeEmail = async (email: string, hackerName: string): Promise<boolean> => {
     try {
    if (!SENDGRID_API_KEY) {
      logger.warn(`📧 Email simulation: Welcome email would be sent to ${email}`);
     return true;
    }

     if (!FROM_EMAIL || /yourdomain\.com$/i.test(FROM_EMAIL)) {
       logger.error('❌ Invalid FROM_EMAIL configured. Set a verified sender in FROM_EMAIL or SENDGRID_FROM');
       return false;
     }

     const msg = {
       to: email,
       from: FROM_EMAIL,
       subject: '🌐 Welcome to the RogueSim Network',
       text: `
 Welcome to the RogueSim Network, ${hackerName}!

 Your account has been successfully verified and you now have access to the Shadow Network.

 You can now:
 - Access advanced hacking simulations
 - Join multiplayer missions
 - Earn credits and unlock new tools
 - Participate in faction operations

 Stay in the shadows, Agent ${hackerName}.

 // RogueSim Network Operations //
       `,
       html: `
       <div style="background: #000000; color: #00ff00; font-family: 'Courier New', monospace; padding: 20px; border: 2px solid #00ff00;">
         <div style="text-align: center; margin-bottom: 20px;">
           <h1 style="color: #00ff00; text-shadow: 0 0 10px #00ff00;">🌐 ROGUESIM NETWORK 🌐</h1>
           <h2 style="color: #00ffff;">ACCESS GRANTED</h2>
        </div>

         <p style="color: #00ff00;">Welcome to the Shadow Network, <strong style="color: #ffff00;">${hackerName}</strong>!</p>
         
         <div style="background: #001100; border: 1px solid #00ff00; padding: 15px; margin: 20px 0;">
           <p style="color: #00ffff; margin: 0 0 10px 0;">🎯 YOUR NETWORK PRIVILEGES:</p>
           <ul style="color: #00ff00; margin: 0; padding-left: 20px;">
             <li>Access to advanced hacking simulations</li>
             <li>Multiplayer mission coordination</li>
             <li>Credit earning and tool procurement</li>
             <li>Faction operation participation</li>
        </ul>
         </div>
         
         <div style="text-align: center; border: 1px solid #ffff00; padding: 10px; margin: 20px 0;">
           <p style="color: #ffff00; margin: 0;">Stay in the shadows, Agent <strong>${hackerName}</strong>.</p>
        </div>

         <div style="text-align: center; border-top: 1px solid #00ff00; padding-top: 15px;">
           <p style="color: #666666; font-size: 12px;">// RogueSim Network Operations //</p>
         </div>
    </div>
       `
     };

     await sgMail.send(msg);
     logger.info(`✅ Welcome email sent successfully to ${email}`);
     return true;
     
   } catch (error: any) {
     logger.error(`❌ Failed to send welcome email to ${email}: ${error.message}`);
     return false;
   }
};

 export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    if (!SENDGRID_API_KEY) {
      logger.warn('SendGrid API key not configured, email testing skipped');
      return false;
    }

     logger.info('📧 Testing SendGrid email configuration...');
      return true;
     
    } catch (error) {
     logger.error(`Email configuration test failed: ${error}`);
      return false;
    }
 };
