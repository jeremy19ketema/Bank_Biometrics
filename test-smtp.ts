import nodemailer from "nodemailer";

async function test() {
  console.log("Testing SMTP connection on port 465...");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "e0868843@gmail.com",
      pass: "hkgcgkwrumlgoxua",
    },
    logger: true,
    debug: true
  });

  try {
    const info = await transporter.sendMail({
      from: '"Aegis System" <e0868843@gmail.com>',
      to: "e0868843@gmail.com", // send to self
      subject: "SMTP Test",
      text: "This is a test from the backend.",
    });
    console.log("Success! Message sent:", info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err.message);
  }
}

test();
