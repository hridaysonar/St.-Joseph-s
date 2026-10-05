import { createRoute } from "../../../lib/auth.js";
import { requireAdminSession } from "../../../lib/admin-security.js";
import { listProducts } from "../../../services/product.service.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = createRoute(async (req) => {
  await requireAdminSession(req.headers);
  return Response.json({ products: await listProducts() });
});
