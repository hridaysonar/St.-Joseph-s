import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const derive = promisify(scrypt);
const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export const configuredAdminPassword = () => /^scrypt:32768:[a-f0-9]{32}:[a-f0-9]{128}$/.test(process.env.ADMIN_PASSWORD_HASH || "");
export async function hashAdminPassword(password) {
  if (typeof password !== "string" || password.length < 8 || password.length > 1024) throw new Error("Admin password must be between 8 and 1024 characters.");
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64, options);
  return `scrypt:32768:${salt}:${key.toString("hex")}`;
}
export async function verifyAdminPassword(password) {
  if (!configuredAdminPassword() || typeof password !== "string" || password.length > 1024) return false;
  const [, , salt, hash] = process.env.ADMIN_PASSWORD_HASH.split(":");
  const candidate = await derive(password, salt, 64, options);
  return timingSafeEqual(Buffer.from(hash, "hex"), candidate);
}
