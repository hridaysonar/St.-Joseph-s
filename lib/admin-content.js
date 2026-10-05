import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import { createHscSubjects } from "./syllabus.js";
import { fail } from "./admin-security.js";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export async function readLimitedBody(request, limit) {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); fail("Request too large.", 413); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
export async function readUpload(request) {
  return new Response(await readLimitedBody(request, MAX_PDF_BYTES + 1024 * 1024), { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
}
export async function readAdminJson(request) {
  try {
    const value = JSON.parse((await readLimitedBody(request, 16 * 1024)).toString());
    if (!value || typeof value !== "object" || Array.isArray(value)) fail("Expected a JSON object.");
    return value;
  } catch (error) { if (error.status) throw error; fail("Invalid JSON."); }
}
export const CONTENT_TYPES = ["Chapter Note", "Class Note", "Short Note", "MCQ Note", "Revision Note", "Paper Material"];
export const publicContent = (record) => {
  const { _id, fileId, ...content } = record;
  return { ...content, url: `/api/content/files/${record.id}` };
};
export async function getCatalog(db) {
  const saved = await db.collection("site_catalog").findOne({ _id: "catalog" });
  return saved?.subjects || createHscSubjects();
}
export function validateRelationship(catalog, data) {
  const subject = catalog.find((item) => item.id === data.subjectId);
  const paper = subject?.papers?.find((item) => item.id === data.paperId);
  if (!paper) fail("Select a valid subject and paper.");
  if (!CONTENT_TYPES.includes(data.contentType)) fail("Select a valid content type.");
  if (data.contentType !== "Paper Material" || data.chapterId) {
    if (!subject.chapters.some((chapter) => chapter.id === data.chapterId && chapter.paperId === paper.id)) fail("Chapter does not belong to the selected subject and paper.");
  }
}
export function textField(value, name, max, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) fail(`${name} is invalid (maximum ${max} characters).`);
  return value.trim();
}
export function validatePdf(file, bytes) {
  if (!file || file.type !== "application/pdf" || !/\.pdf$/i.test(file.name)) fail("Only PDF files are accepted.");
  if (bytes.length < 12 || bytes.length > MAX_PDF_BYTES) fail("PDF must be between 12 bytes and 10 MB.");
  if (bytes.subarray(0, 5).toString() !== "%PDF-" || !bytes.subarray(-2048).includes(Buffer.from("%%EOF"))) fail("Invalid or incomplete PDF.");
}
export async function storePdf(db, file) {
  if (!file || file.size > MAX_PDF_BYTES) fail("Select a PDF no larger than 10 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  validatePdf(file, bytes);
  const bucket = new GridFSBucket(db, { bucketName: "academic_pdfs" });
  const upload = bucket.openUploadStream(file.name.slice(0, 200), { metadata: { type: "application/pdf" } });
  try {
    Readable.from(bytes).pipe(upload);
    await finished(upload);
    return { fileId: upload.id, fileName: file.name.slice(0, 200), fileSize: bytes.length };
  } catch (error) {
    await upload.abort().catch(() => {});
    throw error;
  }
}
export async function discardPdf(db, id) {
  if (id) await new GridFSBucket(db, { bucketName: "academic_pdfs" }).delete(new ObjectId(id)).catch(() => {});
}
export async function uploadContent(db, form) {
  const kind = form.get("kind");
  if (!["routine", "note"].includes(kind)) fail("Invalid content kind.");
  const record = {
    id: randomUUID(), kind, title: textField(form.get("title"), "Title", 160, true),
    description: textField(form.get("description") || "", "Description", 2000),
    published: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  if (kind === "note") {
    for (const key of ["subjectId", "paperId", "chapterId", "contentType"]) record[key] = textField(form.get(key) || "", key, 150);
    validateRelationship(await getCatalog(db), record);
  }
  Object.assign(record, await storePdf(db, form.get("file")));
  try { await db.collection("site_content").insertOne(record); }
  catch (error) { await discardPdf(db, record.fileId); throw error; }
  return publicContent(record);
}
export async function updateContent(db, id, input, form = null) {
  const collection = db.collection("site_content");
  const current = await collection.findOne({ id });
  if (!current) fail("Content not found.", 404);
  if (input.action === "delete") {
    if (current.kind === "routine") {
      const published = await db.collection("site_publication").findOne({ _id: "routine", contentId: id });
      if (published) fail("Unpublish the current routine before deleting it.", 409);
    }
    await collection.deleteOne({ id });
    await discardPdf(db, current.fileId);
    return { success: true };
  }
  if (input.action === "publish" || input.action === "unpublish") {
    const published = input.action === "publish";
    if (current.kind === "routine") {
      // A single atomic pointer makes routine replacement independent of old files.
      if (published) await db.collection("site_publication").updateOne({ _id: "routine" }, { $set: { contentId: id } }, { upsert: true });
      else await db.collection("site_publication").deleteOne({ _id: "routine", contentId: id });
    } else await collection.updateOne({ id }, { $set: { published, updatedAt: new Date().toISOString() } });
    return { success: true };
  }
  const update = { updatedAt: new Date().toISOString() };
  if (input.title !== undefined) update.title = textField(input.title, "Title", 160, true);
  if (input.description !== undefined) update.description = textField(input.description, "Description", 2000);
  if (form) Object.assign(update, await storePdf(db, form.get("file")));
  try { await collection.updateOne({ id }, { $set: update }); }
  catch (error) { if (update.fileId) await discardPdf(db, update.fileId); throw error; }
  if (update.fileId) await discardPdf(db, current.fileId);
  return { success: true };
}
