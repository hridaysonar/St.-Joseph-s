import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";

const state = (globalThis.__studentLifeDatabase ??= {
  client: null,
  db: null,
  pending: null,
  retryAfter: 0,
});
export async function connectToDatabase() {
  if (state.db) return { client: state.client, db: state.db };
  if (!process.env.MONGODB_URI || Date.now() < state.retryAfter)
    return { client: null, db: null };
  if (!state.pending)
    state.pending = (async () => {
      const client = new MongoClient(process.env.MONGODB_URI, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      try {
        await client.connect();
        state.client = client;
        state.db = client.db(process.env.MONGODB_DB_NAME || "student_life");
        return { client, db: state.db };
      } catch {
        await client.close().catch(() => {});
        state.retryAfter = Date.now() + 60000;
        console.warn(
          "[MongoDB] Connection unavailable; using persistent local storage.",
        );
        return { client: null, db: null };
      } finally {
        state.pending = null;
      }
    })();
  return state.pending;
}
export function getDatabase() {
  return state.db;
}
const storeFile = () =>
  path.resolve(process.env.DATA_DIR || "data", "store.json");
export function readLocalStore() {
  const file = storeFile();
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  return {
    students: [],
    feedbacks: [],
    products: [],
    orders: [],
    config: {
      adminContactEmail:
        process.env.ADMIN_CONTACT_EMAIL || "hridoy.dev.natore@gmail.com",
    },
  };
}
export function writeLocalStore(data) {
  const file = storeFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = file + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify(data, null, 2));
  fs.renameSync(temporary, file);
}
