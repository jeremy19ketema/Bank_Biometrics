import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const masterKeyBase64 = process.env.MASTER_KEY;
  if (!masterKeyBase64) {
    throw new Error("MASTER_KEY is missing from environment");
  }
  
  const key = Buffer.from(masterKeyBase64, "base64");
  if (key.length !== 32) {
    throw new Error(`Invalid MASTER_KEY length: expected 32 bytes, got ${key.length} bytes`);
  }
  
  return key;
}

export function encryptSecret(plainText: string) {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedKey: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    version: 1 // Default version, can be incremented on rotation if needed
  };
}

export function decryptSecret(encryptedHex: string, ivHex: string, authTagHex: string): string {
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
