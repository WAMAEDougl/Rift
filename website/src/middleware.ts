import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  // Signal to the root layout that this is an admin route
  // so it can suppress the public Navbar/Footer
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const res = response instanceof NextResponse ? response : NextResponse.next();
    res.headers.set("x-is-admin", "1");
    return res;
  }
  return response;
}

export const config = {
  matcher: [
    // Match admin and account routes, skip static files and API routes
    "/admin",
    "/admin/:path*",
    "/account/:path*",
  ],
};
