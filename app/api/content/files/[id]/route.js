import { GridFSBucket } from "mongodb";
import { Readable } from "node:stream";
import { adminDatabase, requireAdminSession } from "../../../../../lib/admin-security.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const db = await adminDatabase();
    const record = await db.collection("site_content").findOne({ id });
    if (!record) return new Response("File not found", { status: 404 });
    const isPublic = record.kind === "routine"
      ? Boolean(await db.collection("site_publication").findOne({ _id: "routine", contentId: id }))
      : record.published === true;
    if (!isPublic) await requireAdminSession(request.headers);
    const bucket = new GridFSBucket(db, { bucketName: "academic_pdfs" });
    const file = await db.collection("academic_pdfs.files").findOne({ _id: record.fileId });
    if (!file) return new Response("File unavailable", { status: 404 });
    return new Response(Readable.toWeb(bucket.openDownloadStream(record.fileId)), { headers: {
      "Content-Type": "application/pdf", "Content-Length": String(file.length),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(record.fileName)}`,
      "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'; frame-ancestors 'self'",
    } });
  } catch (error) { return new Response(error.status ? error.message : "File unavailable", { status: error.status || 503 }); }
}
