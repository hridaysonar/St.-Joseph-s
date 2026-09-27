import { createRoute } from "../../../../lib/auth.js";
import { postApiAuthLogin } from "../../../../services/user.service.js";
export const runtime = "nodejs";
export const POST = createRoute(postApiAuthLogin);
