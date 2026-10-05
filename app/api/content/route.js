import { adminDatabase } from "../../../lib/admin-security.js";
import { getCatalog, publicContent } from "../../../lib/admin-content.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const db = await adminDatabase();
    const pointer = await db.collection("site_publication").findOne({ _id: "routine" });
    const routine = pointer ? await db.collection("site_content").findOne({ id: pointer.contentId, kind: "routine" }) : null;
    const notes = await db.collection("site_content").find({ kind: "note", published: true }).toArray();
    return Response.json({ routine: routine ? publicContent(routine) : null, notes: notes.map(publicContent), catalog: await getCatalog(db) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return Response.json({ error: "Shared content unavailable. Please try again." }, { status: error.status || 503 }); }
}
