import { createRoute, ADMIN_SECRET } from "../../../lib/auth.js";
import { listProducts } from "../../../services/product.service.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = createRoute(async (req) => {
  if (req.headers["x-admin-token"] !== ADMIN_SECRET)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ products: await listProducts() });
});
