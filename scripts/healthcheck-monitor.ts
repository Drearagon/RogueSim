import { execSync } from "child_process";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sgMail from "@sendgrid/mail";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const containerName = "roguesim";
const checkInterval = 60000; // every 60s

async function checkHealth() {
  try {
    const output = execSync(`docker inspect --format='{{json .State.Health.Status}}' ${containerName}`)
      .toString()
      .trim()
      .replace(/^"|"$/g, ""); // remove quotes

    if (output !== "healthy") {
      console.error(`[!] Container is ${output}`);
      await sendAlertEmail(output);
    } else {
      console.log(`[✔] Container is healthy`);
    }
  } catch (err: any) {
    console.error("Error checking container health:", err.message);
  }
}

async function sendAlertEmail(status: string) {
  const msg = {
    to: "uplink@roguesim.com",
    from: "alerts@roguesim.com",
    subject: `🚨 RogueSim container health check failed`,
    text: `The RogueSim Docker container reported as '${status}' at ${new Date().toISOString()}`,
    html: `<strong>The RogueSim Docker container is <span style="color:red">${status}</span></strong><br><br><code>${new Date().toISOString()}</code>`,
  };

  try {
    await sgMail.send(msg);
    console.log("[✉️] Alert email sent.");
  } catch (error: any) {
    console.error("[✖] Failed to send alert email:", error.message || error);
  }
}

// Start loop
setInterval(checkHealth, checkInterval);
checkHealth(); // immediate first run
