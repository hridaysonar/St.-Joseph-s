import { randomBytes, createHash } from "node:crypto";
import { ADMIN_EMAIL, SESSION_COOKIE, adminDatabase, appOrigin, adminSetupStatus, cookie, cookieValue, checkOrigin, signState, readState, createAdminSession, requireAdminSession, passwordAdminLogin, revokeAdminSession, fail } from "../../../../lib/admin-security.js";
import { getCatalog, publicContent, uploadContent, updateContent, textField, readUpload, readAdminJson } from "../../../../lib/admin-content.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
function oauthConfig() {
  const setup = adminSetupStatus();
  if (!setup.ready) fail(setup.error || `Admin setup required: add ${setup.missing.join(", ")} to the server environment, then restart the app.`, 503);
  return { client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: appOrigin() + "/api/admin/auth/callback" };
}
async function handler(request, context) {
  try {
    const { path } = await context.params;
    const route = path.join("/");
    const method = request.method;
    if (route === "login" && method === "POST") {
      const token = await passwordAdminLogin(request.headers, await readAdminJson(request));
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Set-Cookie": cookie(SESSION_COOKIE, token, 8 * 3600) } });
    }
    if (route === "auth/start" && method === "GET") {
      const config = oauthConfig();
      await adminDatabase();
      const state = randomBytes(32).toString("hex");
      const verifier = randomBytes(32).toString("base64url");
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.search = new URLSearchParams({ client_id: config.client_id, redirect_uri: config.redirect_uri, response_type: "code", scope: "openid email", state, prompt: "select_account", login_hint: ADMIN_EMAIL, code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256" }).toString();
      return new Response(null, { status: 302, headers: { Location: url.toString(), "Set-Cookie": cookie("sl_admin_oauth", signState({ state, verifier, expires: Date.now() + 600_000 }), 600), "Cache-Control": "no-store" } });
    }
    if (route === "auth/callback" && method === "GET") {
      try {
        const url = new URL(request.url);
        const stored = readState(cookieValue(request.headers, "sl_admin_oauth"));
        if (!stored || stored.state !== url.searchParams.get("state") || !url.searchParams.get("code")) fail("Google sign-in could not be verified.", 403);
        const config = oauthConfig();
        const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ ...config, code: url.searchParams.get("code"), grant_type: "authorization_code", code_verifier: stored.verifier }), signal: AbortSignal.timeout(15000) });
        if (!response.ok) fail("Google token exchange failed.", 403);
        const token = await response.json();
        const profile = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000) });
        if (!profile.ok) fail("Google account verification failed.", 403);
        const sessionToken = await createAdminSession(await adminDatabase(), await profile.json());
        const headers = new Headers({ Location: appOrigin() + "/admin", "Cache-Control": "no-store" });
        headers.append("Set-Cookie", cookie(SESSION_COOKIE, sessionToken, 8 * 3600));
        headers.append("Set-Cookie", cookie("sl_admin_oauth", "", 0));
        return new Response(null, { status: 302, headers });
      } catch (error) {
        return new Response(null, { status: 302, headers: { Location: appOrigin() + "/admin?error=" + encodeURIComponent(error.status ? error.message : "Google sign-in failed."), "Set-Cookie": cookie("sl_admin_oauth", "", 0), "Cache-Control": "no-store" } });
      }
    }
    if (!["GET", "HEAD"].includes(method)) checkOrigin(request.headers);
    const auth = await requireAdminSession(request.headers);
    const { session } = auth;
    if (route === "session" && method === "GET") return json({ email: session.email });
    if (route === "logout" && method === "POST") {
      await revokeAdminSession(request.headers, auth.db);
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", "Set-Cookie": cookie(SESSION_COOKIE, "", 0) } });
    }
    const db = auth.db || await adminDatabase();
    if (route === "overview" && method === "GET") {
      const [content, reports, suggestions, students, catalog, routine] = await Promise.all([
        db.collection("site_content").find({}).sort({ createdAt: -1 }).toArray(),
        db.collection("problem_reports").find({}).sort({ createdAt: -1 }).toArray(),
        db.collection("feature_suggestions").find({}).sort({ createdAt: -1 }).toArray(),
        db.collection("students").find({}, { projection: { userId: 1, studentName: 1, school: 1, grade: 1, group: 1, batch: 1, studentId: 1, profilePhoto: 1, email: 1, phone: 1, joinedAt: 1, lastActive: 1 } }).toArray(),
        getCatalog(db), db.collection("site_publication").findOne({ _id: "routine" }),
      ]);
      const feedbacks = await db.collection("feedbacks").find({}).sort({ createdAt: -1 }).toArray();
      const legacy = (type) => feedbacks.filter((item) => item.type === type).map((item) => ({ ...item, category: item.category || "Other", status: ["New", "Reviewing", "Resolved", "Planned", "Implemented", "Declined"].includes(item.status) ? item.status : "New", emailStatus: item.emailStatus || "legacy" }));
      const config = await db.collection("config").findOne({ key: "admin_config" });
      return json({ content: content.map((item) => ({ ...publicContent(item), published: item.kind === "routine" ? routine?.contentId === item.id : item.published })), reports: [...reports, ...legacy("Problem Report")], suggestions: [...suggestions, ...legacy("Feature Request")], feedbacks: feedbacks.filter((item) => !["Problem Report", "Feature Request"].includes(item.type)), students, catalog, settings: { adminEmail: ADMIN_EMAIL, supportEmail: config?.value?.adminContactEmail || process.env.ADMIN_CONTACT_EMAIL || ADMIN_EMAIL, emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM), maxPdfMB: 10 } });
    }
    if (route === "config" && method === "POST") {
      const input = await readAdminJson(request);
      const email = textField(input.adminContactEmail, "Support email", 254, true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Enter a valid support email.");
      await db.collection("config").updateOne({ key: "admin_config" }, { $set: { key: "admin_config", "value.adminContactEmail": email } }, { upsert: true });
      return json({ success: true });
    }
    if (route === "content" && method === "POST") {
      if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) fail("Upload too large.", 413);
      return json(await uploadContent(db, await readUpload(request)), 201);
    }
    if (path[0] === "content" && path.length === 2 && method === "PATCH") {
      const multipart = request.headers.get("content-type")?.startsWith("multipart/form-data");
      if (Number(request.headers.get("content-length")) > 11 * 1024 * 1024) fail("Upload too large.", 413);
      const form = multipart ? await readUpload(request) : null;
      const input = form ? Object.fromEntries(["title", "description"].filter((key) => form.has(key)).map((key) => [key, form.get(key)])) : await readAdminJson(request);
      return json(await updateContent(db, path[1], input, form));
    }
    if (["reports", "suggestions"].includes(path[0]) && path.length === 2 && method === "PATCH") {
      const { status } = await readAdminJson(request);
      const allowed = path[0] === "reports" ? ["New", "Reviewing", "Resolved"] : ["New", "Reviewing", "Planned", "Implemented", "Declined"];
      if (!allowed.includes(status)) fail("Invalid review status.");
      let result = await db.collection(path[0] === "reports" ? "problem_reports" : "feature_suggestions").updateOne({ id: path[1] }, { $set: { status } });
      if (!result.matchedCount) result = await db.collection("feedbacks").updateOne({ id: path[1], type: path[0] === "reports" ? "Problem Report" : "Feature Request" }, { $set: { status } });
      if (!result.matchedCount) fail("Submission not found.", 404);
      return json({ success: true });
    }
    if (route === "catalog" && method === "POST") {
      const { kind, name, subjectId, paperId } = await readAdminJson(request);
      const label = textField(name, "Name", 160, true);
      const existingCatalog = await db.collection("site_catalog").findOne({ _id: "catalog" });
      const catalog = existingCatalog?.subjects || await getCatalog(db);
      const id = randomBytes(16).toString("hex");
      if (kind === "subject") catalog.push({ id, name: label, color: "#6366f1", papers: [], chapters: [] });
      else {
        const subject = catalog.find((item) => item.id === subjectId);
        if (!subject) fail("Subject not found.");
        if (kind === "paper") subject.papers.push({ id, name: label });
        else if (kind === "chapter" && subject.papers.some((paper) => paper.id === paperId)) subject.chapters.push({ id, name: label, paperId, status: "Not Started", revisionCount: 0 });
        else fail("Select a valid paper.");
      }
      // Admin catalog only adds records; existing names, IDs and student progress remain intact.
      if (existingCatalog) {
        const result = await db.collection("site_catalog").updateOne({ _id: "catalog", revision: existingCatalog.revision ?? null }, { $set: { subjects: catalog }, $inc: { revision: 1 } });
        if (!result.matchedCount) fail("Syllabus changed in another session. Refresh and try again.", 409);
      } else {
        try { await db.collection("site_catalog").insertOne({ _id: "catalog", subjects: catalog, revision: 1 }); }
        catch (error) { if (error.code === 11000) fail("Syllabus changed in another session. Refresh and try again.", 409); throw error; }
      }
      return json({ success: true });
    }
    return json({ error: "Admin endpoint not found." }, 404);
  } catch (error) {
    if (request.method === "GET" && new URL(request.url).pathname === "/api/admin/auth/start") {
      return new Response(null, { status: 302, headers: { Location: "/admin?error=" + encodeURIComponent(error.status ? error.message : "Google sign-in is temporarily unavailable. Please try again."), "Cache-Control": "no-store" } });
    }
    return json({ error: error.status ? error.message : "Operation failed. Existing content is preserved." }, error.status || 500);
  }
}
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
