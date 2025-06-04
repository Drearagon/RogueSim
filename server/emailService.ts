import { MailService } from '@sendgrid/mail';
import { log } from './vite';

// Export variables that will be initialized later
export let mailService: MailService;
export let isEmailEnabled: boolean = false;

export async function initEmailService(): Promise<void> {
  try {
    mailService = new MailService();
    isEmailEnabled = !!process.env.SENDGRID_API_KEY;

    if (isEmailEnabled) {
      mailService.setApiKey(process.env.SENDGRID_API_KEY!);
      log('📧 Email service enabled with SendGrid');
    } else {
      log('📧 Email service disabled (SENDGRID_API_KEY not set) - using dev mode');
    }
  } catch (error) {
    log(`❌ Email service initialization failed: ${error}`, 'error');
    // Don't throw error - email service is not critical for the app to function
    isEmailEnabled = false;
  }
}

export class EmailService {
  static generateVerificationCode(): string {
    // Generate a 6-digit hacker-style code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendVerificationEmail(email: string, hackerName: string, verificationCode: string): Promise<boolean> {
    if (!isEmailEnabled) {
      console.log(`📧 [DEV] Verification email for ${hackerName} (${email}): ${verificationCode}`);
      return true;
    }

    const hackerEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            background: #000000;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #0a0a0a;
            border: 2px solid #00ff00;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        .header {
            text-align: center;
            border-bottom: 1px solid #00ff00;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
        }
        .alert {
            background: #001100;
            border: 1px solid #00ff00;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #00ffff;
            text-align: center;
            background: #002200;
            padding: 20px;
            border: 2px dashed #00ff00;
            margin: 20px 0;
            letter-spacing: 8px;
            text-shadow: 0 0 15px #00ffff;
        }
        .terminal {
            background: #000;
            border: 1px solid #00ff00;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .prompt {
            color: #00ff00;
        }
        .command {
            color: #ffff00;
        }
        .warning {
            color: #ff0000;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .footer {
            border-top: 1px solid #00ff00;
            padding-top: 20px;
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #008800;
        }
        .glitch {
            animation: glitch 1s infinite;
        }
        @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo glitch">RogueSim</div>
            <div>ESP32 HACKER TERMINAL NETWORK</div>
        </div>

        <div class="alert">
            <strong>⚠ SECURITY PROTOCOL INITIATED ⚠</strong><br>
            New operative detected attempting network access...
        </div>

        <div class="terminal">
            <div><span class="prompt">root@roguesim:~#</span> <span class="command">verify_operative ${hackerName}</span></div>
            <div>Scanning neural patterns...</div>
            <div>Checking biometric data...</div>
            <div>Validating security clearance...</div>
            <div style="color: #ffff00;">WARNING: Manual verification required</div>
        </div>

        <p>Greetings, <strong style="color: #00ffff;">${hackerName}</strong>,</p>

        <p>Your request to join the RogueSim hacker collective has been received and is currently under review by our security protocols.</p>

        <p>To complete your initiation and gain access to our classified terminal network, you must provide the following verification code:</p>

        <div class="code">${verificationCode}</div>

        <div class="terminal">
            <div><span class="prompt">security@roguesim:~#</span> <span class="command">authenticate --code ${verificationCode}</span></div>
            <div style="color: #00ff00;">✓ Code verified successfully</div>
            <div style="color: #00ff00;">✓ Granting network access...</div>
            <div style="color: #00ff00;">✓ Welcome to the collective, ${hackerName}</div>
        </div>

        <p><strong>MISSION BRIEFING:</strong></p>
        <ul>
            <li>Enter this code in the terminal to activate your account</li>
            <li>Your hacker profile will be encrypted and stored securely</li>
            <li>You'll gain access to AI-generated missions and multiplayer operations</li>
            <li>Your reputation will start at "Novice" - prove yourself worthy</li>
        </ul>

        <div class="warning">
            ⚠ WARNING: This code expires in 10 minutes ⚠<br>
            Unauthorized access attempts will be logged and traced
        </div>

        <div class="alert">
            <strong>CLASSIFIED INFORMATION</strong><br>
            If you did not request access to RogueSim, ignore this message and report the incident immediately.
            Someone may be attempting to infiltrate our network using your identity.
        </div>

        <div class="footer">
            <div>RogueSim Security Division</div>
            <div>Cyberpunk Terminal Network</div>
            <div>Stay anonymous. Stay secure. Stay in the shadows.</div>
            <br>
            <div style="color: #ff0000; font-size: 10px;">
                This is an automated security message. Do not reply to this transmission.
            </div>
        </div>
    </div>
</body>
</html>`;

    try {
      await mailService.send({
        to: email,
        from: {
          email: 'security@roguesim.net',
          name: 'RogueSim Security Division'
        },
        subject: `🔒 [CLASSIFIED] Network Access Verification - Code: ${verificationCode}`,
        html: hackerEmailTemplate,
        text: `
RogueSim ESP32 Hacker Terminal Network
======================================

SECURITY PROTOCOL INITIATED
New operative: ${hackerName}

Your verification code: ${verificationCode}

Enter this code to complete your initiation and gain access to the hacker collective.

WARNING: Code expires in 10 minutes.

Stay anonymous. Stay secure. Stay in the shadows.
        `
      });
      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, hackerName: string): Promise<boolean> {
    if (!isEmailEnabled) {
      console.log(`📧 [DEV] Welcome email for ${hackerName} (${email}): Account activated successfully!`);
      return true;
    }

    const welcomeTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            background: #000000;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #0a0a0a;
            border: 2px solid #00ff00;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        .header {
            text-align: center;
            border-bottom: 1px solid #00ff00;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
        }
        .terminal {
            background: #000;
            border: 1px solid #00ff00;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .prompt {
            color: #00ff00;
        }
        .command {
            color: #ffff00;
        }
        .success {
            color: #00ff00;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ACCESS GRANTED</div>
            <div>Welcome to the RogueSim Network</div>
        </div>

        <div class="terminal">
            <div><span class="prompt">system@roguesim:~#</span> <span class="command">add_operative ${hackerName}</span></div>
            <div class="success">✓ Operative successfully added to collective</div>
            <div class="success">✓ Security clearance: NOVICE</div>
            <div class="success">✓ Terminal access: GRANTED</div>
            <div class="success">✓ Mission database: UNLOCKED</div>
        </div>

        <p>Congratulations, <strong style="color: #00ffff;">${hackerName}</strong>!</p>

        <p>You have successfully infiltrated the RogueSim hacker network. Your neural patterns have been verified and your digital identity has been encrypted within our secure database.</p>

        <h3 style="color: #ffff00;">AVAILABLE OPERATIONS:</h3>
        <ul>
            <li><strong>scan</strong> - Discover network vulnerabilities</li>
            <li><strong>connect</strong> - Establish connections to target systems</li>
            <li><strong>inject</strong> - Deploy malicious payloads</li>
            <li><strong>missions</strong> - Access available contracts</li>
            <li><strong>shop</strong> - Purchase advanced hacking tools</li>
            <li><strong>multiplayer</strong> - Join other operatives for team missions</li>
        </ul>

        <p><strong>REMEMBER:</strong> Your reputation within the collective depends on your performance. Complete missions successfully to advance from Novice to Elite status.</p>

        <div class="terminal">
            <div><span class="prompt">${hackerName}@roguesim:~#</span> <span class="command">help</span></div>
            <div>Use this command anytime to see available operations</div>
        </div>

        <p style="color: #ff0000; text-align: center;">
            Welcome to the shadows, ${hackerName}. Happy hacking.
        </p>
    </div>
</body>
</html>`;

    try {
      await mailService.send({
        to: email,
        from: {
          email: 'collective@roguesim.net',
          name: 'RogueSim Collective'
        },
        subject: `🎯 Welcome to the Collective, ${hackerName} - Network Access Granted`,
        html: welcomeTemplate
      });
      return true;
    } catch (error) {
      console.error('Welcome email error:', error);
      return false;
    }
  }
}