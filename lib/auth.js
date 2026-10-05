import { readRequest } from "./validations.js";
import { requireAdminSession, checkOrigin } from "./admin-security.js";

// Route services return native Web Responses; this boundary parses requests consistently.
export function createRoute(handler) {
  return async function route(request) {
    try {
      const req = await readRequest(request);
      const route = req.query.endpoint || req.pathname;
      if (route.startsWith("/api/admin/") || route === "/api/users") {
        await requireAdminSession(request.headers);
        if (!["GET", "HEAD"].includes(request.method)) checkOrigin(request.headers);
      }
      return await handler(req);
    } catch (error) {
      return Response.json(
        { error: error.status ? error.message : "Request failed" },
        { status: error.status || 500 },
      );
    }
  };
}
