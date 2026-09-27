import { createRoute } from "../../../lib/auth.js";
import * as service from "../../../services/user.service.js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handlers = {
  "GET /api/users": service.getApiUsers,
  "POST /api/users": service.postApiUsers,
  "GET /api/routine": service.getApiRoutine,
  "POST /api/student-ai": service.postApiStudentAi,
  "POST /api/students/sync": service.postApiStudentsSync,
  "GET /api/admin/students": service.getApiAdminStudents,
  "GET /api/config": service.getApiConfig,
  "POST /api/admin/config": service.postApiAdminConfig,
  "POST /api/feedback": service.postApiFeedback,
  "GET /api/admin/feedbacks": service.getApiAdminFeedbacks,
  "POST /api/admin/login": service.postApiAdminLogin,
};
function dispatch(method) {
  return createRoute((req) => {
    const route = req.query.endpoint || req.pathname;
    const handler = handlers[method + " " + route];
    return handler
      ? handler(req)
      : Response.json({ error: "Method not allowed" }, { status: 405 });
  });
}
export const GET = dispatch("GET");
export const POST = dispatch("POST");
