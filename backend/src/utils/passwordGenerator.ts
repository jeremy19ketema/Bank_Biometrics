import crypto from "crypto";

/**
 * Generates a secure random password of specified length.
 * By default, generates a 12-character alphanumeric password.
 */
export function generateSecurePassword(length: number = 12): string {
  // Generate random bytes and encode as base64, removing non-alphanumeric chars for simplicity
  return crypto.randomBytes(length).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, length) + "!";
}
