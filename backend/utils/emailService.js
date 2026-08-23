import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    const user = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
    const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").replace(/\s+/g, "");
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "465", 10);

    if (user && pass) {
      if (host) {
        return nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
      } else {
        return nodemailer.createTransport({
          service: "gmail",
          auth: { user, pass },
        });
      }
    }

    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  /**
   * Send Emergency SOS Email Broadcast to a Trusted Guardian Contact
   */
  async sendSOSEmergencyEmail({
    guardianEmail,
    guardianName = "Trusted Guardian",
    victimName = "A Shield User",
    victimPhone = "Not provided",
    victimEmail = "",
    address = "Location coordinates logged below",
    lat = 27.7172,
    lng = 85.324,
    alertType = "Emergency SOS Alert",
    duressActivated = false,
    timestamp = new Date().toLocaleString(),
  }) {
    if (!guardianEmail || !guardianEmail.includes("@")) {
      console.warn(`[EmailService] Invalid or missing guardian email: ${guardianEmail}`);
      return { success: false, message: "Invalid email" };
    }

    const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
    const sender = (process.env.EMAIL_USER || "").trim();
    const fromAddress = sender
      ? `"Shield Women Safety" <${sender}>`
      : process.env.EMAIL_FROM || '"Shield Women Safety Nepal" <emergency@shield.gov.np>';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EMERGENCY SOS ALERT - Shield Nepal</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f0e6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(158, 97, 51, 0.15); border: 2px solid #e53e3e; }
    .header { background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
    .badge { display: inline-block; background: #fff5f5; color: #c53030; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; letter-spacing: 1px; margin-bottom: 12px; }
    .content { padding: 32px 24px; color: #2d180c; line-height: 1.6; }
    .alert-box { background-color: #fff5f5; border-left: 5px solid #e53e3e; padding: 16px; border-radius: 12px; margin: 20px 0; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 12px; border-bottom: 1px solid #eee0ce; font-size: 14px; }
    .info-table td.label { font-weight: bold; color: #814a27; width: 35%; }
    .btn { display: block; width: 90%; margin: 24px auto 12px; background: #9e6133; color: #ffffff !important; text-align: center; padding: 16px; border-radius: 14px; font-weight: 800; text-decoration: none; font-size: 16px; box-shadow: 0 4px 15px rgba(158, 97, 51, 0.3); }
    .btn-emergency { background: #e53e3e; box-shadow: 0 4px 15px rgba(229, 62, 62, 0.4); }
    .helplines { background: #fdfbf7; border: 1px solid #eee0ce; border-radius: 16px; padding: 16px; margin-top: 24px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #814a27; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">🚨 Urgent Distress Signal</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">EMERGENCY SOS ALERT</h1>
      <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Shield Women Safety Automated Dispatch System</p>
    </div>

    <div class="content">
      <p style="font-size: 16px; font-weight: 700; margin-top: 0;">
        Dear ${guardianName},
      </p>
      <div class="alert-box">
        <strong style="color: #c53030; font-size: 15px;">⚠️ IMMEDIATE ASSISTANCE REQUIRED:</strong>
        <p style="margin: 6px 0 0; font-size: 14px;">
          <strong>${victimName}</strong> has triggered an emergency <strong>${alertType}</strong> on the Shield safety network and designated you as an emergency guardian contact.
        </p>
      </div>

      <table class="info-table">
        <tr>
          <td class="label">Victim Name</td>
          <td><strong>${victimName}</strong></td>
        </tr>
        <tr>
          <td class="label">Contact Phone</td>
          <td><a href="tel:${victimPhone}" style="color: #9e6133; font-weight: bold; text-decoration: none;">${victimPhone}</a></td>
        </tr>
        ${victimEmail ? `<tr><td class="label">User Email</td><td>${victimEmail}</td></tr>` : ''}
        <tr>
          <td class="label">Approx. Location</td>
          <td>${address || "GPS Position Logged Below"}</td>
        </tr>
        <tr>
          <td class="label">GPS Coordinates</td>
          <td><code>${lat.toFixed(5)}, ${lng.toFixed(5)}</code></td>
        </tr>
        <tr>
          <td class="label">Timestamp</td>
          <td>${timestamp}</td>
        </tr>
        ${duressActivated ? `<tr><td class="label" style="color: #e53e3e;">Stealth Duress</td><td style="color: #e53e3e; font-weight: bold;">ACTIVATED</td></tr>` : ''}
      </table>

      <a href="${mapLink}" target="_blank" class="btn btn-emergency">
        📍 Open Live GPS Map (Google Maps)
      </a>

      <a href="tel:${victimPhone}" class="btn">
        📞 Call ${victimName} Immediately
      </a>

      <div class="helplines">
        <h4 style="margin: 0 0 10px; color: #2d180c; font-size: 13px; text-transform: uppercase;">
          Direct Nepal Emergency Authorities
        </h4>
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <div>🚔 Nepal Police: <strong>100</strong></div>
          <div>👩 Women Helpline: <strong>1145</strong></div>
          <div>🚑 Ambulance: <strong>102</strong></div>
        </div>
      </div>
    </div>

    <div class="footer">
      This is an automated safety alert dispatched by Shield Women Safety Nepal.<br>
      © ${new Date().getFullYear()} Shield Safety Initiative. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: fromAddress,
        to: guardianEmail,
        subject: `🚨 URGENT SOS ALERT: ${victimName} needs immediate help! [Shield Safety]`,
        text: `EMERGENCY SOS ALERT!\n\n${victimName} (Phone: ${victimPhone}) has triggered an Emergency SOS.\nLocation: ${address}\nGPS: ${lat}, ${lng}\nLive Google Maps: ${mapLink}\n\nTime: ${timestamp}\n\nPlease take immediate action or contact Nepal Police (100).`,
        html: htmlContent,
      });

      console.log(`[EmailService] ✓ SOS email dispatched to ${guardianEmail}. MsgId: ${info.messageId || "logged"}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService] ✗ Failed sending SOS email to ${guardianEmail}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Send Guardian Welcome Confirmation Email
   */
  async sendGuardianWelcomeEmail({ guardianEmail, guardianName, userName, userPhone }) {
    if (!guardianEmail || !guardianEmail.includes("@")) return;

    const sender = (process.env.EMAIL_USER || "").trim();
    const fromAddress = sender
      ? `"Shield Women Safety" <${sender}>`
      : process.env.EMAIL_FROM || '"Shield Women Safety Nepal" <alerts@shield.gov.np>';

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #fdfbf7; padding: 20px; color: #2d180c;">
  <div style="max-width: 500px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 28px; border: 1px solid #eee0ce; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #9e6133; margin: 0;">🛡️ Shield Safety Network</h2>
      <p style="color: #814a27; font-size: 13px; margin-top: 4px;">Trusted Guardian Confirmation</p>
    </div>
    <p>Hi <strong>${guardianName}</strong>,</p>
    <p><strong>${userName}</strong> (${userPhone}) has designated you as an official trusted emergency contact on the <strong>Shield Women Safety</strong> platform.</p>
    <p style="background: #f7f0e6; padding: 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; color: #814a27;">
      ✓ If ${userName} ever presses the emergency SOS button, you will receive instantaneous GPS coordinates and live map links directly in your email.
    </p>
    <p style="font-size: 12px; color: #814a27; opacity: 0.8; text-align: center; margin-top: 24px;">
      Shield Nepal • 24/7 Citizen Protection Network
    </p>
  </div>
</body>
</html>
    `;

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: fromAddress,
        to: guardianEmail,
        subject: `🛡️ You've been added as an Emergency Guardian for ${userName} on Shield`,
        html: htmlContent,
      });
      console.log(`[EmailService] ✓ Welcome email sent to guardian: ${guardianEmail}`);
    } catch (e) {
      console.warn(`[EmailService] Failed to send welcome email: ${e.message}`);
    }
  }
}

export const emailService = new EmailService();
export default emailService;
