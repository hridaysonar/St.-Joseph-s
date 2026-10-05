import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import vm from "node:vm";
import { Readable, Writable } from "node:stream";

const root = path.resolve(import.meta.dirname, "..");
const matches = (record, query) => Object.entries(query).every(([key, value]) => {
  if (value?.$gt) return record[key] > value.$gt;
  if (value === null) return record[key] == null;
  return String(record[key]) === String(value);
});
function memoryDatabase() {
  const tables = new Map();
  const collection = (name) => {
    if (!tables.has(name)) tables.set(name, []);
    const rows = tables.get(name);
    const apply = (row, update) => {
      for (const [key, value] of Object.entries(update.$set || {})) {
        if (key.includes(".")) { const [parent, child] = key.split("."); row[parent] ||= {}; row[parent][child] = value; }
        else row[key] = value;
      }
      for (const [key, value] of Object.entries(update.$inc || {})) row[key] = (row[key] || 0) + value;
    };
    return {
      async createIndex() {},
      async findOne(query) { return structuredClone(rows.find((row) => matches(row, query)) || null); },
      find(query = {}) { let selected = rows.filter((row) => matches(row, query)); return { sort() { return this; }, async toArray() { return structuredClone(selected); } }; },
      async insertOne(record) { rows.push(structuredClone(record)); return { insertedId: record.id }; },
      async updateOne(query, update, options = {}) {
        let row = rows.find((row) => matches(row, query));
        const found = Boolean(row);
        if (!row && options.upsert) { row = { ...query }; rows.push(row); }
        if (row) apply(row, update);
        return { matchedCount: found ? 1 : 0 };
      },
      async findOneAndUpdate(query, update, options) { await this.updateOne(query, update, options); return this.findOne(query); },
      async deleteOne(query) { const index = rows.findIndex((row) => matches(row, query)); if (index >= 0) rows.splice(index, 1); },
    };
  };
  return { collection, tables };
}
async function environment() {
  const db = memoryDatabase();
  let available = true;
  let uploadFailure = false;
  let send = async () => new Response(JSON.stringify({ id: "email" }), { status: 200 });
  const context = vm.createContext({ Buffer, Headers, Request, Response, FormData, Blob, File, URL, URLSearchParams, AbortSignal, console, setTimeout, clearTimeout, structuredClone, process: { env: { APP_ORIGIN: "http://localhost:3000", ADMIN_SESSION_SECRET: "a".repeat(48) } }, fetch: (...args) => send(...args) });
  const modules = new Map();
  const pdfFiles = new Map();
  let sequence = 0;
  class Bucket {
    openDownloadStream(id) { return Readable.from(pdfFiles.get(String(id))); }
    openUploadStream(name) {
      const chunks = [];
      const id = String(++sequence);
      const stream = new Writable({ write(chunk, encoding, callback) { chunks.push(chunk); callback(); }, final(callback) { if (uploadFailure) { callback(new Error("Storage failed")); return; } pdfFiles.set(id, Buffer.concat(chunks)); db.collection("academic_pdfs.files").insertOne({ _id: id, length: Buffer.concat(chunks).length, filename: name }).then(() => callback()); } });
      stream.id = id;
      stream.abort = async () => { stream.destroy(); pdfFiles.delete(id); };
      return stream;
    }
    async delete(id) { pdfFiles.delete(String(id)); await db.collection("academic_pdfs.files").deleteOne({ _id: String(id) }); }
  }
  async function load(id) {
    if (modules.has(id)) return modules.get(id);
    let module;
    if (id === path.join(root, "lib", "db.js")) {
      module = new vm.SyntheticModule(["connectToDatabase"], function () { this.setExport("connectToDatabase", async () => ({ db: available ? db : null })); }, { context });
    } else if (id === "mongodb") {
      module = new vm.SyntheticModule(["GridFSBucket", "ObjectId"], function () { this.setExport("GridFSBucket", Bucket); this.setExport("ObjectId", class { constructor(id) { this.id = String(id); } toString() { return this.id; } }); }, { context });
    } else if (id.startsWith("node:")) {
      const native = await import(id);
      module = new vm.SyntheticModule(Object.keys(native), function () { for (const key of Object.keys(native)) this.setExport(key, native[key]); }, { context });
    } else if (id.endsWith(".json")) {
      const data = JSON.parse(await fs.readFile(id, "utf8"));
      module = new vm.SyntheticModule(["default"], function () { this.setExport("default", data); }, { context });
    } else module = new vm.SourceTextModule(await fs.readFile(id, "utf8"), { context, identifier: id });
    modules.set(id, module);
    return module;
  }
  async function exports(file) { const module = await load(path.join(root, file)); if (module.status === "unlinked") await module.link((specifier, parent) => load(specifier.startsWith(".") ? path.resolve(path.dirname(parent.identifier), specifier) : specifier)); if (module.status !== "evaluated") await module.evaluate(); return module.namespace; }
  return { db, context, pdfFiles, exports, unavailable: () => { available = false; }, failUploads: (value) => { uploadFailure = value; }, setFetch: (fn) => { send = fn; } };
}
const pdf = () => new File(["%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n"], "test.pdf", { type: "application/pdf" });
function form(kind, extra = {}) {
  const value = new FormData();
  for (const [key, item] of Object.entries({ kind, title: "Example", description: "", ...extra })) value.set(key, item);
  value.set("file", pdf());
  return value;
}

test("only the exact verified Google account receives an expiring, revocable server session", async () => {
  const env = await environment();
  const security = await env.exports("lib/admin-security.js");
  await assert.rejects(() => security.createAdminSession(env.db, { email: "student@gmail.com", email_verified: true, sub: "1" }), /authorized/);
  await assert.rejects(() => security.createAdminSession(env.db, { email: security.ADMIN_EMAIL, email_verified: false, sub: "1" }), /authorized/);
  const token = await security.createAdminSession(env.db, { email: security.ADMIN_EMAIL, email_verified: true, sub: "owner" });
  const headers = { cookie: `${security.SESSION_COOKIE}=${token}` };
  assert.equal((await security.requireAdminSession(headers)).session.email, security.ADMIN_EMAIL);
  await assert.rejects(() => security.requireAdminSession({ "x-admin-token": "admin123" }), /sign-in/);
  await assert.rejects(() => security.requireAdminSession({ cookie: `${security.SESSION_COOKIE}=${"0".repeat(64)}` }), /expired/);
  await env.db.collection("admin_sessions").updateOne({ _id: security.tokenHash(token) }, { $set: { expiresAt: new Date(0) } });
  await assert.rejects(() => security.requireAdminSession(headers), /expired/);
  assert.throws(() => security.checkOrigin({ origin: "https://attacker.example" }), /rejected/);
  const state = security.signState({ state: "abc", expires: Date.now() + 10000 });
  assert.equal(security.readState(state).state, "abc");
  assert.equal(security.readState(state + "x"), null);
  assert.equal(security.readState(security.signState({ expires: 0 })), null);
});

test("email/password login verifies only the owner, rejects incorrect credentials, and uses protected sessions", async () => {
  const env = await environment();
  const password = await env.exports("lib/admin-password.js");
  const security = await env.exports("lib/admin-security.js");
  env.context.process.env.ADMIN_PASSWORD_HASH = await password.hashAdminPassword("test-admin-password-strong");
  const headers = { origin: "http://localhost:3000" };
  await assert.rejects(() => security.passwordAdminLogin(headers, { email: security.ADMIN_EMAIL, password: "wrong" }), /Incorrect/);
  await assert.rejects(() => security.passwordAdminLogin(headers, { email: "student@gmail.com", password: "test-admin-password-strong" }), /Incorrect/);
  await assert.rejects(() => security.passwordAdminLogin({ origin: "https://attacker.example" }, { email: security.ADMIN_EMAIL, password: "test-admin-password-strong" }), /rejected/);
  const token = await security.passwordAdminLogin(headers, { email: security.ADMIN_EMAIL, password: "test-admin-password-strong" });
  const sessionHeaders = { cookie: `${security.SESSION_COOKIE}=${token}` };
  assert.equal((await security.requireAdminSession(sessionHeaders)).session.authMethod, "password");
  const records = await env.db.collection("admin_sessions").find().toArray();
  assert.equal(JSON.stringify(records).includes("test-admin-password-strong"), false);
  assert.equal(JSON.stringify(records).includes(token), false);
  await security.revokeAdminSession(sessionHeaders, env.db);
  await assert.rejects(() => security.requireAdminSession(sessionHeaders), /expired/);
  const second = await security.passwordAdminLogin(headers, { email: security.ADMIN_EMAIL, password: "test-admin-password-strong" });
  env.context.process.env.ADMIN_PASSWORD_HASH = await password.hashAdminPassword("new-admin-password-strong");
  await assert.rejects(() => security.requireAdminSession({ cookie: `${security.SESSION_COOKIE}=${second}` }), /password changed/);
});

test("local sessions persist on the server, work without MongoDB, expire and revoke; attempts are limited", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "student-life-admin-auth-test-"));
  assert.equal(path.dirname(directory), path.resolve(os.tmpdir()));
  try {
    const env = await environment();
    env.context.process.env.ADMIN_SESSION_STORE = "local";
    env.context.process.env.DATA_DIR = directory;
    env.unavailable();
    const password = await env.exports("lib/admin-password.js");
    env.context.process.env.ADMIN_PASSWORD_HASH = await password.hashAdminPassword("local-admin-password-strong");
    const security = await env.exports("lib/admin-security.js");
    const headers = { origin: "http://localhost:3000" };
    const token = await security.passwordAdminLogin(headers, { email: security.ADMIN_EMAIL, password: "local-admin-password-strong" });
    const sessionHeaders = { cookie: `${security.SESSION_COOKIE}=${token}` };
    assert.equal((await security.requireAdminSession(sessionHeaders)).session.email, security.ADMIN_EMAIL);
    const saved = JSON.parse(await fs.readFile(path.join(directory, "admin-auth.json"), "utf8"));
    assert.equal(saved.sessions.length, 1);
    assert.equal(JSON.stringify(saved).includes(token), false);
    await security.revokeAdminSession(sessionHeaders, null);
    await assert.rejects(() => security.requireAdminSession(sessionHeaders), /expired/);
    const store = await env.exports("lib/admin-session-store.js");
    for (let i = 0; i < 10; i++) await store.limitAdminLogin(null, "another-source");
    await assert.rejects(() => store.limitAdminLogin(null, "another-source"), /Too many/);
  } finally { await fs.rm(directory, { recursive: true }); }
});

test("PDF validation and failed upload preserve current routine; publishing is a single pointer", async () => {
  const env = await environment();
  const content = await env.exports("lib/admin-content.js");
  const first = await content.uploadContent(env.db, form("routine"));
  assert.equal(first.published, false);
  await content.updateContent(env.db, first.id, { action: "publish" });
  const pointer = () => env.db.collection("site_publication").findOne({ _id: "routine" });
  const invalid = form("routine"); invalid.set("file", new File(["not a PDF"], "bad.pdf", { type: "application/pdf" }));
  await assert.rejects(() => content.uploadContent(env.db, invalid), /PDF/);
  assert.equal((await pointer()).contentId, first.id);
  env.failUploads(true);
  await assert.rejects(() => content.uploadContent(env.db, form("routine")), /Storage failed/);
  assert.equal((await pointer()).contentId, first.id);
  assert.equal(env.pdfFiles.size, 1);
  env.failUploads(false);
  assert.throws(() => content.validatePdf({ name: "large.pdf", type: "application/pdf" }, Buffer.alloc(content.MAX_PDF_BYTES + 1)), /10 MB/);
  assert.throws(() => content.validatePdf({ name: "image.png", type: "image/png" }, Buffer.from("%PDF-1.7\n%%EOF")), /Only PDF/);
  const second = await content.uploadContent(env.db, form("routine"));
  assert.equal((await pointer()).contentId, first.id);
  await content.updateContent(env.db, second.id, { action: "publish" });
  assert.equal((await pointer()).contentId, second.id);
  assert.equal(env.pdfFiles.size, 2);
  await assert.rejects(() => content.updateContent(env.db, second.id, { action: "delete" }), /Unpublish/);
  await content.updateContent(env.db, first.id, { action: "delete" });
  assert.equal((await pointer()).contentId, second.id);
  await content.updateContent(env.db, second.id, { action: "unpublish" });
  assert.equal(await pointer(), null);
});

test("Google callback exchanges code with PKCE and creates a session only for the verified owner", async () => {
  const env = await environment();
  env.context.process.env.GOOGLE_CLIENT_ID = "test-client";
  env.context.process.env.GOOGLE_CLIENT_SECRET = "test-secret";
  const route = await env.exports("app/api/admin/[...path]/route.js");
  const params = (path) => ({ params: Promise.resolve({ path }) });
  const begin = await route.GET(new Request("http://localhost:3000/api/admin/auth/start"), params(["auth", "start"]));
  assert.equal(begin.status, 302);
  const url = new URL(begin.headers.get("location"));
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  const oauthCookie = begin.headers.get("set-cookie").split(";")[0];
  let identity = { email: "hridoy.dev.natore@gmail.com", email_verified: true, sub: "owner" };
  env.setFetch(async (endpoint, options) => {
    if (endpoint.endsWith("/token")) {
      assert.ok(options.body.get("code_verifier"));
      return Response.json({ access_token: "test-token" });
    }
    assert.equal(options.headers.Authorization, "Bearer test-token");
    return Response.json(identity);
  });
  const callback = () => route.GET(new Request(`http://localhost:3000/api/admin/auth/callback?code=test-code&state=${url.searchParams.get("state")}`, { headers: { cookie: oauthCookie } }), params(["auth", "callback"]));
  const success = await callback();
  assert.equal(success.headers.get("location"), "http://localhost:3000/admin");
  assert.match(success.headers.get("set-cookie"), /sl_admin_session=/);
  identity = { email: "student@gmail.com", email_verified: true, sub: "student" };
  const denied = await callback();
  assert.match(denied.headers.get("location"), /error=/);
  assert.doesNotMatch(denied.headers.get("set-cookie"), /sl_admin_session=/);
  assert.equal((await env.db.collection("admin_sessions").find().toArray()).length, 1);
});

test("missing Google credentials return to the sign-in page with setup guidance instead of JSON", async () => {
  const env = await environment();
  const security = await env.exports("lib/admin-security.js");
  assert.equal(security.adminSetupStatus().ready, false);
  assert.deepEqual(Array.from(security.adminSetupStatus().missing), ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]);
  const route = await env.exports("app/api/admin/[...path]/route.js");
  const response = await route.GET(new Request("http://localhost:3000/api/admin/auth/start"), { params: Promise.resolve({ path: ["auth", "start"] }) });
  assert.equal(response.status, 302);
  assert.match(response.headers.get("location"), /^\/admin\?error=/);
  assert.match(decodeURIComponent(response.headers.get("location")), /GOOGLE_CLIENT_ID/);
  assert.match(decodeURIComponent(response.headers.get("location")), /GOOGLE_CLIENT_SECRET/);
  assert.equal(response.headers.get("set-cookie"), null);
  env.context.process.env.GOOGLE_CLIENT_ID = "test-client";
  env.context.process.env.GOOGLE_CLIENT_SECRET = "test-secret";
  assert.equal(security.adminSetupStatus().ready, true);
  env.context.process.env.APP_ORIGIN = "https://example.com/";
  assert.equal(security.adminSetupStatus().ready, false);
  assert.match(security.adminSetupStatus().error, /trailing slash/);
});

test("notes enforce subject/paper/chapter IDs; editing, replacement and deletion affect only selected note", async () => {
  const env = await environment();
  const content = await env.exports("lib/admin-content.js");
  const catalog = await content.getCatalog(env.db);
  const physics = catalog.find((item) => item.id === "physics");
  const chemistry = catalog.find((item) => item.id === "chemistry");
  const selected = physics.chapters[0];
  const relation = { subjectId: physics.id, paperId: selected.paperId, chapterId: selected.id, contentType: "Chapter Note" };
  const note = await content.uploadContent(env.db, form("note", relation));
  const other = await content.uploadContent(env.db, form("note", { subjectId: chemistry.id, paperId: chemistry.chapters[0].paperId, chapterId: chemistry.chapters[0].id, contentType: "MCQ Note" }));
  await assert.rejects(() => content.uploadContent(env.db, form("note", { ...relation, subjectId: chemistry.id })), /subject|paper|Chapter/);
  await assert.rejects(() => content.uploadContent(env.db, form("note", { ...relation, chapterId: chemistry.chapters[0].id })), /Chapter/);
  await content.updateContent(env.db, note.id, { action: "publish" });
  assert.equal((await env.db.collection("site_content").findOne({ id: note.id })).published, true);
  const invalid = new FormData(); invalid.set("file", new File(["bad"], "bad.pdf", { type: "application/pdf" }));
  const before = await env.db.collection("site_content").findOne({ id: note.id });
  await assert.rejects(() => content.updateContent(env.db, note.id, {}, invalid), /PDF/);
  assert.equal((await env.db.collection("site_content").findOne({ id: note.id })).fileId, before.fileId);
  const replacement = new FormData(); replacement.set("file", pdf());
  await content.updateContent(env.db, note.id, { title: "New title", description: "Changed" }, replacement);
  const after = await env.db.collection("site_content").findOne({ id: note.id });
  assert.equal(after.title, "New title"); assert.equal(after.chapterId, selected.id); assert.notEqual(after.fileId, before.fileId);
  await content.updateContent(env.db, note.id, { action: "unpublish" });
  await content.updateContent(env.db, note.id, { action: "delete" });
  assert.equal(await env.db.collection("site_content").findOne({ id: note.id }), null);
  assert.equal((await env.db.collection("site_content").findOne({ id: other.id })).subjectId, chemistry.id);
  assert.equal(env.pdfFiles.size, 1);
});

test("reports and suggestions save separately even when secure email delivery fails", async () => {
  const env = await environment();
  env.context.process.env.RESEND_API_KEY = "test-only";
  env.context.process.env.EMAIL_FROM = "Student Life <test@example.com>";
  const calls = [];
  env.setFetch(async (url, options) => { calls.push({ url, options }); throw new Error("provider unavailable"); });
  const { submitFeedback } = await env.exports("lib/feedback.js");
  const request = (type) => ({ headers: { origin: "http://localhost:3000" }, body: { type, category: "PDF Problem", message: "PDF is not opening", studentName: "Test student" } });
  assert.equal((await submitFeedback(request("Problem Report"))).status, 200);
  assert.equal((await submitFeedback(request("Feature Request"))).status, 200);
  const reports = await env.db.collection("problem_reports").find().toArray();
  const suggestions = await env.db.collection("feature_suggestions").find().toArray();
  assert.equal(reports.length, 1); assert.equal(suggestions.length, 1);
  assert.equal(reports[0].emailStatus, "failed"); assert.equal(reports[0].status, "New");
  assert.equal(JSON.parse(calls[0].options.body).to[0], "hridoy.dev.natore@gmail.com");
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  await assert.rejects(() => submitFeedback({ ...request("Problem Report"), headers: { origin: "https://evil.example" } }), /rejected/);
  await submitFeedback(request("Feedback")); await submitFeedback(request("Feedback")); await submitFeedback(request("Feedback"));
  await assert.rejects(() => submitFeedback(request("Feedback")), /Too many/);
});

test("admin endpoints reject students/manual tokens and enforce CSRF; public content excludes drafts", async () => {
  const env = await environment();
  const route = await env.exports("app/api/admin/[...path]/route.js");
  const security = await env.exports("lib/admin-security.js");
  const get = (headers = {}) => route.GET(new Request("http://localhost:3000/api/admin/overview", { headers }), { params: Promise.resolve({ path: ["overview"] }) });
  assert.equal((await get()).status, 401);
  assert.equal((await get({ "x-admin-token": "admin123" })).status, 401);
  const token = await security.createAdminSession(env.db, { email: security.ADMIN_EMAIL, email_verified: true, sub: "owner" });
  const cookie = `${security.SESSION_COOKIE}=${token}`;
  assert.equal((await get({ cookie })).status, 200);
  const patch = (origin) => route.PATCH(new Request("http://localhost:3000/api/admin/reports/test", { method: "PATCH", headers: { cookie, origin, "Content-Type": "application/json" }, body: JSON.stringify({ status: "Resolved" }) }), { params: Promise.resolve({ path: ["reports", "test"] }) });
  assert.equal((await patch("https://attacker.example")).status, 403);
  await env.db.collection("problem_reports").insertOne({ id: "test", status: "New" });
  assert.equal((await patch("http://localhost:3000")).status, 200);
  assert.equal((await env.db.collection("problem_reports").findOne({ id: "test" })).status, "Resolved");
  await env.db.collection("site_content").insertOne({ id: "draft", kind: "note", published: false });
  await env.db.collection("site_content").insertOne({ id: "public", kind: "note", published: true });
  const publicRoute = await env.exports("app/api/content/route.js");
  const publicData = await (await publicRoute.GET()).json();
  assert.equal(publicData.notes.length, 1); assert.equal(publicData.notes[0].id, "public");
  env.unavailable();
  assert.equal((await publicRoute.GET()).status, 503);
});

test("private PDFs require a verified session; published PDFs are served with safe headers", async () => {
  const env = await environment();
  const content = await env.exports("lib/admin-content.js");
  const fileRoute = await env.exports("app/api/content/files/[id]/route.js");
  const record = await content.uploadContent(env.db, form("routine"));
  const request = new Request(`http://localhost:3000/api/content/files/${record.id}`);
  const params = { params: Promise.resolve({ id: record.id }) };
  assert.equal((await fileRoute.GET(request, params)).status, 401);
  await content.updateContent(env.db, record.id, { action: "publish" });
  const published = await fileRoute.GET(request, params);
  assert.equal(published.status, 200);
  assert.equal(published.headers.get("content-type"), "application/pdf");
  assert.match(published.headers.get("content-security-policy"), /sandbox/);
  assert.match(await published.text(), /^%PDF-/);
  await content.updateContent(env.db, record.id, { action: "unpublish" });
  assert.equal((await fileRoute.GET(request, params)).status, 401);
});

test("shared syllabus additions preserve imported names, deleted defaults, saved status, revision and Undo", async () => {
  const env = await environment();
  const syllabus = await env.exports("lib/syllabus.js");
  const catalog = syllabus.createHscSubjects();
  const saved = structuredClone(catalog);
  saved[0].name = "My custom Physics";
  saved[0].chapters[0].status = "Completed";
  saved[0].chapters[0].revisionCount = 5;
  saved[0].chapters[0].statusUndoUntil = Date.now() + 60000;
  saved[0].chapters.pop();
  assert.equal(syllabus.mergePublishedCatalog(saved, catalog), saved);
  catalog[0].chapters.push({ id: "admin-added", name: "Additional chapter", paperId: catalog[0].papers[0].id, status: "Not Started", revisionCount: 0 });
  const merged = syllabus.mergePublishedCatalog(saved, catalog);
  assert.equal(merged[0].name, saved[0].name);
  assert.equal(merged[0].chapters[0].status, "Completed");
  assert.equal(merged[0].chapters[0].revisionCount, 5);
  assert.equal(merged[0].chapters[0].statusUndoUntil, saved[0].chapters[0].statusUndoUntil);
  assert.equal(merged[0].chapters.length, saved[0].chapters.length + 1);
});

test("existing completion/Undo survives serialization, expires after 60 seconds and preserves revision actions", async () => {
  const source = await fs.readFile(path.join(root, "components/dashboard/StudySection.jsx"), "utf8");
  let time = 100000;
  const context = vm.createContext({ subjects: [{ id: "s", chapters: [{ id: "c", name: "Chapter", status: "Not Started", revisionCount: 2 }] }], statusTapTimes: { current: new Map() }, Date: class extends Date { static now() { return time; } }, setNow() {} });
  context.onUpdateSubjects = (subjects) => { context.subjects = JSON.parse(JSON.stringify(subjects)); };
  vm.runInContext(source.slice(source.indexOf("  function updateChapter("), source.indexOf("  function addChapter(")), context);
  const chapter = () => context.subjects[0].chapters[0];
  context.updateChapter("s", "c", "Completed");
  assert.equal(chapter().statusUndoUntil, 160000);
  context.updateChapter("s", "c", "Not Started"); assert.equal(chapter().status, "Completed");
  context.updateChapter("s", "c", "Not Started", false, true); assert.equal(chapter().status, "Not Started");
  context.updateChapter("s", "c", "Completed"); assert.equal(chapter().status, "Not Started");
  time += 751; context.updateChapter("s", "c", "Completed");
  context.subjects = JSON.parse(JSON.stringify(context.subjects)); context.statusTapTimes.current.clear();
  time += 60000; context.updateChapter("s", "c", "Not Started", false, true); assert.equal(chapter().status, "Completed");
  context.updateChapter("s", "c", "Revision"); assert.equal(chapter().revisionCount, 3);
  context.updateChapter("s", "c", "Revision", true); assert.equal(chapter().revisionCount, 4);
  assert.equal(chapter().name, "Chapter");
});
