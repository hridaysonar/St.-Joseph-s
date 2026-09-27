import { readRequest } from "./validations.js";
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin123";

// Route services return native Web Responses; this boundary parses requests consistently.
export function createRoute(handler) {
  return async function route(request) {
    try {
      return await handler(await readRequest(request));
    } catch (error) {
      return Response.json(
        { error: error.status ? error.message : "Request failed" },
        { status: error.status || 500 },
      );
    }
  };
}
