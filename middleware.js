import { NextResponse } from "next/server";
export function middleware() {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
export const config = { matcher: ["/api/:path*"] };
