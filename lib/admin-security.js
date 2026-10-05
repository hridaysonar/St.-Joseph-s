import { createHmac, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { connectToDatabase } from "./db.js";
import { localAdminSessions, storeAdminSession, findAdminSession, removeAdminSession, limitAdminLogin } from "./admin-session-store.js";
import { configuredAdminPassword, verifyAdminPassword } from "./admin-password.js";

export const ADMIN_EMAIL = "hridoy.dev.natore@gmail.com";
export const SESSION_COOKIE = "sl_admin_session";
export function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}
export async function adminDatabase() {
  const { db } = await connectToDatabase();
  if (!db) fail("Shared database unavailable. Existing content has been preserved.", 503);
  return db;
}
export function appOrigin() {
  const origin = process.env.APP_ORIGIN;
  if (!origin) fail("Admin setup required: APP_ORIGIN is missing.", 503);
  const url = new URL(origin);
  if (url.origin !== origin || (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname))) {
    fail("APP_ORIGIN must be an HTTPS origin (HTTP allowed on localhost).", 503);
  }
  return origin;
}
export function adminSetupStatus() {
  const missing = [];
  for (const key of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "APP_ORIGIN"]) {
    if (!process.env[key]?.trim()) missing.push(key);
  }
  if (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32) missing.push("ADMIN_SESSION_SECRET");
  let origin = null;
  let error = "";
  if (process.env.APP_ORIGIN) {
    try { origin = appOrigin(); }
    catch { error = "APP_ORIGIN must be an HTTPS origin without a trailing slash (HTTP allowed on localhost)."; }
  }
  return { ready: !missing.length && !error, missing, error, redirectUri: origin ? origin + "/api/admin/auth/callback" : null };
}
function headersOf(input) {
  return input instanceof Headers ? input : new Headers(input);
}
export function cookieValue(headers, name) {
  const cookies = headersOf(headers).get("cookie") || "";
  return cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="))?.slice(name.length + 1) || "";
}
export function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${appOrigin().startsWith("https:") ? "; Secure" : ""}`;
}
export function checkOrigin(headers) {
  if (headersOf(headers).get("origin") !== appOrigin()) fail("Request origin rejected.", 403);
}
export function signState(value) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) fail("Admin setup required: ADMIN_SESSION_SECRET must contain at least 32 characters.", 503);
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return payload + "." + createHmac("sha256", secret).update(payload).digest("base64url");
}
export function readState(token) {
  try {
    const [payload, signature] = token.split(".");
    const expected = signState(JSON.parse(Buffer.from(payload, "base64url").toString())).split(".")[1];
    const actual = Buffer.from(signature || "");
    if (actual.length !== expected.length || !timingSafeEqual(actual, Buffer.from(expected))) return null;
    const value = JSON.parse(Buffer.from(payload, "base64url").toString());
    return value.expires > Date.now() ? value : null;
  } catch { return null; }
}
export const tokenHash = (token) => createHash("sha256").update(token).digest("hex");
export async function requireAdminSession(headers) {
  const token = cookieValue(headers, SESSION_COOKIE);
  if (!/^[a-f0-9]{64}$/.test(token)) fail("Verified Admin sign-in required.", 401);
  const db = localAdminSessions() ? null : await adminDatabase();
  const session = await findAdminSession(db, tokenHash(token), ADMIN_EMAIL);
  if (!session) fail("Admin session expired. Sign in again.", 401);
  if (session.authMethod === "password" && session.credentialVersion !== tokenHash(process.env.ADMIN_PASSWORD_HASH || "")) fail("Admin password changed. Sign in again.", 401);
  return { db, session };
}
export async function createAdminSession(db, identity) {
  if (identity.email !== ADMIN_EMAIL || identity.email_verified !== true || !identity.sub) fail("This Google account is not the authorized Admin.", 403);
  const token = randomBytes(32).toString("hex");
  await storeAdminSession(db, { _id: tokenHash(token), email: ADMIN_EMAIL, googleId: identity.sub, expiresAt: new Date(Date.now() + 8 * 3600_000) });
  return token;
}
export async function passwordAdminLogin(headers, input) {
  checkOrigin(headers);
  if (!configuredAdminPassword()) fail("Admin password has not been configured on the server.", 503);
  const db = localAdminSessions() ? null : await adminDatabase();
  const source = headersOf(headers).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  await limitAdminLogin(db, tokenHash(source));
  const valid = await verifyAdminPassword(input.password);
  if (!valid || typeof input.email !== "string" || input.email.trim().toLowerCase() !== ADMIN_EMAIL) fail("Incorrect Admin email or password.", 401);
  const token = randomBytes(32).toString("hex");
  await storeAdminSession(db, { _id: tokenHash(token), email: ADMIN_EMAIL, authMethod: "password", credentialVersion: tokenHash(process.env.ADMIN_PASSWORD_HASH), expiresAt: new Date(Date.now() + 8 * 3600_000) });
  return token;
}
export async function revokeAdminSession(headers, db) {
  await removeAdminSession(db, tokenHash(cookieValue(headers, SESSION_COOKIE)));
}
