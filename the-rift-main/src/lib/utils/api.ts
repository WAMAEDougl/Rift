import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Shared Supabase service client for API routes
export function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Standard API error response
export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Standard API success response with cache headers
export function apiSuccess<T>(data: T, cacheSeconds: number = 0) {
  const headers: Record<string, string> = {};
  if (cacheSeconds > 0) {
    headers["Cache-Control"] = `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`;
  }
  return NextResponse.json(data, { headers });
}

// Simple rate limiter (in-memory, per-instance — adequate for Vercel serverless)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
