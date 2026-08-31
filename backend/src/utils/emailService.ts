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
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 40px 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: left;">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f1728; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">AEGIS<span style="color: #d7ab5c;">BIOMETRICS</span></h1>
        </div>
        
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Welcome to the team!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">An official account has been provisioned for you on the Aegis Biometrics Banking platform.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 30px 0;">
          <h3 style="margin-top: 0; color: #0f1728; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Credentials</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-size: 14px; width: 40%;"><strong>Role / Department</strong></td>
              <td style="padding: 12px 0; color: #0f1728; font-size: 15px; font-weight: 500;">${role}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;"><strong>Username</strong></td>
              <td style="padding: 12px 0; color: #0f1728; font-size: 15px; font-weight: 500; border-top: 1px solid #e2e8f0;">${username}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;"><strong>Temporary Password</strong></td>
              <td style="padding: 12px 0; border-top: 1px solid #e2e8f0;">
                <code style="background-color: #0f1728; color: #d7ab5c; padding: 8px 12px; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">${tempPassword}</code>
              </td>
            </tr>
          </table>
        </div>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Please log in using these credentials. For security purposes, you will be required to change your password immediately upon your first login.</p>
        
        <a href="${frontendUrl}/login" style="display: block; width: 100%; text-align: center; background-color: #0f1728; color: #ffffff; text-decoration: none; padding: 16px 0; border-radius: 8px; font-weight: 600; font-size: 16px;">Sign In to Aegis</a>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0 20px 0;" />
        
        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
          Secure System Communication<br>
          Aegis System Administrator
        </p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: '"Aegis System" <e0868843@gmail.com>',
    to,
    subject: "Your Aegis Bank Credentials",
    html: htmlContent,
  });

  if (!smtpUser || !smtpPass) {
    console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}
