import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

export const localAdminSessions = () => process.env.ADMIN_SESSION_STORE === "local";
const location = () => path.resolve(process.env.DATA_DIR || "data", "admin-auth.json");
function read() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) throw Object.assign(new Error("Local sessions require a persistent server. Use MongoDB sessions on serverless hosts."), { status: 503 });
  const file = location();
  const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { sessions: [], limits: {} };
  data.sessions = data.sessions.filter((session) => new Date(session.expiresAt) > new Date());
  for (const [key, limit] of Object.entries(data.limits)) if (limit.expires <= Date.now()) delete data.limits[key];
  return data;
}
function write(data) {
  const file = location();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = file + "." + randomBytes(8).toString("hex") + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify(data), { mode: 0o600 });
  fs.renameSync(temporary, file);
}
export async function storeAdminSession(db, session) {
  if (localAdminSessions()) {
    const data = read(); data.sessions.push(session); write(data); return;
  }
  await db.collection("admin_sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("admin_sessions").insertOne(session);
}
export async function findAdminSession(db, hash, email) {
  return localAdminSessions()
    ? read().sessions.find((session) => session._id === hash && session.email === email)
    : db.collection("admin_sessions").findOne({ _id: hash, email, expiresAt: { $gt: new Date() } });
}
export async function removeAdminSession(db, hash) {
  if (localAdminSessions()) { const data = read(); data.sessions = data.sessions.filter((session) => session._id !== hash); write(data); }
  else await db.collection("admin_sessions").deleteOne({ _id: hash });
}
export async function limitAdminLogin(db, sourceHash) {
  const window = Math.floor(Date.now() / 600_000);
  for (const [key, max] of [[sourceHash, 10], ["site", 50]]) {
    const id = `${key}:${window}`;
    let count;
    if (localAdminSessions()) {
      const data = read();
      const limit = data.limits[id] || { count: 0, expires: (window + 1) * 600_000 };
      limit.count++; data.limits[id] = limit; write(data); count = limit.count;
    } else {
      const limits = db.collection("admin_login_limits");
      await limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      const limit = await limits.findOneAndUpdate({ _id: id }, { $inc: { count: 1 }, $set: { expiresAt: new Date((window + 1) * 600_000) } }, { upsert: true, returnDocument: "after" });
      count = limit.count;
    }
    if (count > max) throw Object.assign(new Error("Too many login attempts. Please try again in 10 minutes."), { status: 429 });
  }
}
