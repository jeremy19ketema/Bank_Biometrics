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

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f1728; color: #f8fafc; padding: 20px; border-radius: 8px;">
      <h2 style="color: #d7ab5c;">Welcome to Aegis Biometrics Banking</h2>
      <p>Hello,</p>
      <p>An account has been provisioned for you.</p>
      <ul>
        <li><strong>Role/Department:</strong> ${role}</li>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Temporary Password:</strong> <code style="background: #1e293b; padding: 4px 8px; border-radius: 4px; color: #d7ab5c;">${tempPassword}</code></li>
      </ul>
      <p>Please log in using these credentials. You will be required to change your password upon your first login.</p>
      <p>Best Regards,<br/>System Administrator</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: '"Aegis System" <no-reply@aegisbank.com>',
    to,
    subject: "Your Aegis Bank Credentials",
    html: htmlContent,
  });

  if (!smtpUser || !smtpPass) {
    console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}
