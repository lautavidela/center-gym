import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:64:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, keylenStr, salt, expectedHash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !expectedHash) return false;
  const keylen = parseInt(keylenStr ?? "64", 10);
  if (Number.isNaN(keylen)) return false;
  const hash = scryptSync(password, salt, keylen);
  const expected = Buffer.from(expectedHash, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function generateEmailCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}