import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[middleware] path:", request.nextUrl.pathname, "user:", user?.id ?? null, "err:", userError?.message ?? null);

  // For profile lookups that bypass RLS, use bare client with service_role key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const isLoginPage = request.nextUrl.pathname === "/admin/login";

    // Allow hardcoded session cookie to bypass Supabase auth check
    const hardcodedSession = request.cookies.get("admin_hardcoded_session");
    if (hardcodedSession) {
      try {
        const profile = JSON.parse(hardcodedSession.value);
        if (profile?.role && ["admin", "kitchen"].includes(profile.role)) {
          // Valid hardcoded session — allow through, redirect away from login
          if (isLoginPage) {
            return NextResponse.redirect(new URL("/admin", request.url));
          }
          return supabaseResponse;
        }
      } catch {
        // Invalid cookie, fall through to Supabase check
      }
    }

    if (!user) {
      if (isLoginPage) return supabaseResponse;
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Check admin/kitchen role bypassing RLS
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("[middleware] profile:", profile?.role ?? null, "err:", profileError?.message ?? null);

    if (!profile || !["admin", "kitchen"].includes(profile.role)) {
      if (isLoginPage) return supabaseResponse;
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Already authenticated admin hitting login page → redirect to dashboard
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Protect account routes
  if (request.nextUrl.pathname.startsWith("/account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
