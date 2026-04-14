import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match admin and account routes, skip static files and API routes
    "/admin",
    "/admin/:path*",
    "/account/:path*",
  ],
};
