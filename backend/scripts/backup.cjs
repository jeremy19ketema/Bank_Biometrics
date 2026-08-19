const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const backupDir = "C:\\Backups\\BankBiometrics";
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `bank_biometrics_${timestamp}.backup`;
const filePath = path.join(backupDir, filename);
const encryptedFilePath = filePath + ".enc";

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Fallback to local default if env var is missing
let connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/bank_biometrics";
if (connectionString.includes("?schema=")) {
  connectionString = connectionString.split("?schema=")[0];
}
const encryptionKey = process.env.BACKUP_KEY || "0123456789abcdef0123456789abcdef"; // 32 chars for AES-256

console.log(`Starting backup of Bank Biometrics to ${filePath}...`);

const protocolSplit = connectionString.split("://")[1];
const atIndex = protocolSplit.lastIndexOf("@");
const credentials = protocolSplit.substring(0, atIndex);
const hostAndDb = protocolSplit.substring(atIndex + 1);
const userPasswordSplit = credentials.indexOf(":");
const dbUser = credentials.substring(0, userPasswordSplit);
const dbPassword = credentials.substring(userPasswordSplit + 1);
const [hostPort, dbName] = hostAndDb.split("/");
const [dbHost, dbPort] = hostPort.split(":");

exec(`pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -Fc -f "${filePath}"`, {
  env: { ...process.env, PGPASSWORD: dbPassword }
}, (error, stdout, stderr) => {
  if (error) {
    console.error("Backup failed!", error);
    process.exit(1);
  }
  
  // Encrypt the backup
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(encryptionKey), Buffer.alloc(16, 0));
  const input = fs.createReadStream(filePath);
  const output = fs.createWriteStream(encryptedFilePath);
  
  input.pipe(cipher).pipe(output).on("finish", () => {
    fs.unlinkSync(filePath); // Delete unencrypted file
    console.log(`Backup completed & encrypted successfully: ${encryptedFilePath}`);

    // Cleanup backups older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    fs.readdirSync(backupDir).forEach(file => {
      if (file.endsWith(".backup.enc")) {
        const fullPath = path.join(backupDir, file);
        const stats = fs.statSync(fullPath);
        if (stats.birthtimeMs < thirtyDaysAgo) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted old backup: ${file}`);
        }
      }
    });
  });
});
