import nodemailer from "nodemailer";

export async function sendWelcomeEmail(to: string, username: string, tempPassword: string, role: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  let transporter;

  if (!smtpUser || !smtpPass) {
    // Generate test SMTP service account from ethereal.email for dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  const frontendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3000';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aegis Biometrics - Credentials</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0F1B2B; color: #EDE7D9; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0F1B2B; padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Card -->
            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #16233A; border: 1px solid rgba(198, 154, 76, 0.2); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding: 40px 40px 30px; border-bottom: 1px solid rgba(198, 154, 76, 0.1);">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #EDE7D9; text-transform: uppercase;">
                    AEGIS<span style="color: #C69A4C;">BIOMETRICS</span>
                  </h1>
                  <p style="margin: 8px 0 0; font-size: 11px; letter-spacing: 4px; color: #C9C2AE; text-transform: uppercase; font-family: monospace;">Secure Access Portal</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 600; color: #EDE7D9;">Welcome to the Aegis Network.</h2>
                  <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.6; color: #C9C2AE;">Hello,</p>
                  <p style="margin: 0 0 30px; font-size: 15px; line-height: 1.6; color: #C9C2AE;">An official administrative account has been provisioned for you on the Aegis Biometrics Banking platform. Your secure access credentials are listed below.</p>
                  
                  <!-- Credentials Box -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B121E; border: 1px solid rgba(237, 231, 217, 0.1); border-radius: 8px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 24px;">
                        <p style="margin: 0 0 16px; font-size: 12px; letter-spacing: 2px; color: #C69A4C; text-transform: uppercase; font-family: monospace; font-weight: bold;">[ SYSTEM CREDENTIALS ]</p>
                        
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="35%" style="padding: 12px 0; color: #C9C2AE; font-size: 13px; font-family: monospace; letter-spacing: 1px; border-bottom: 1px solid rgba(237, 231, 217, 0.05);">ROLE</td>
                            <td width="65%" style="padding: 12px 0; color: #EDE7D9; font-size: 14px; font-weight: 600; border-bottom: 1px solid rgba(237, 231, 217, 0.05);">${role}</td>
                          </tr>
                          <tr>
                            <td width="35%" style="padding: 12px 0; color: #C9C2AE; font-size: 13px; font-family: monospace; letter-spacing: 1px; border-bottom: 1px solid rgba(237, 231, 217, 0.05);">USERNAME</td>
                            <td width="65%" style="padding: 12px 0; color: #EDE7D9; font-size: 14px; font-weight: 600; border-bottom: 1px solid rgba(237, 231, 217, 0.05);">${username}</td>
                          </tr>
                          <tr>
                            <td width="35%" style="padding: 12px 0; color: #C9C2AE; font-size: 13px; font-family: monospace; letter-spacing: 1px;">PASSCODE</td>
                            <td width="65%" style="padding: 12px 0;">
                              <span style="display: inline-block; background-color: rgba(198, 154, 76, 0.15); color: #C69A4C; padding: 6px 12px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: 700; letter-spacing: 2px;">${tempPassword}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 30px; font-size: 14px; line-height: 1.6; color: #C9C2AE; font-style: italic;">
                    <strong style="color: #C69A4C;">Action Required:</strong> For security compliance, you must authenticate and change your temporary passcode immediately upon your first login.
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${frontendUrl}/login" style="display: inline-block; background-color: #C69A4C; color: #0F1B2B; font-size: 14px; font-weight: bold; text-decoration: none; padding: 16px 40px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Initialize Session</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 24px; background-color: #0B121E; border-top: 1px solid rgba(237, 231, 217, 0.05);">
                  <p style="margin: 0; font-size: 11px; color: #64748b; font-family: monospace; letter-spacing: 1px; text-transform: uppercase;">
                    This is an automated encrypted transmission.<br>Aegis System Administrator
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: '"Aegis System" <e0868843@gmail.com>',
    to,
    subject: "Your Aegis Bank Credentials",
    html: htmlContent,
    text: `Welcome to the team!\n\nAn official account has been provisioned for you on the Aegis Biometrics Banking platform.\n\nYour Credentials:\nRole: ${role}\nUsername: ${username}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.`,
  });

  if (!smtpUser || !smtpPass) {
    console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}
