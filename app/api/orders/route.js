import { createRoute } from "../../../lib/auth.js";
import { requireAdminSession } from "../../../lib/admin-security.js";
import { listOrders } from "../../../services/order.service.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = createRoute(async (req) => {
  await requireAdminSession(req.headers);
  return Response.json({ orders: await listOrders() });
});
