import { tokenHash, fail } from "./admin-security.js";
export async function limitSubmissions(db, headers) {
  const h = new Headers(headers);
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const minute = Math.floor(Date.now() / 60_000);
  const limits = db.collection("submission_limits");
  await limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  for (const [key, max] of [[tokenHash(ip), 5], ["site", 100]]) {
    const record = await limits.findOneAndUpdate({ _id: `${key}:${minute}` }, { $inc: { count: 1 }, $set: { expiresAt: new Date(Date.now() + 120_000) } }, { upsert: true, returnDocument: "after" });
    if (record.count > max) fail("Too many submissions. Please try again in a minute.", 429);
  }
}
