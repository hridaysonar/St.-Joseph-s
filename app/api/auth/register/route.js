import { createRoute } from "../../../../lib/auth.js";
import { postApiAuthRegister } from "../../../../services/user.service.js";
export const runtime = "nodejs";
export const POST = createRoute(postApiAuthRegister);
