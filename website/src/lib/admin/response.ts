import { NextResponse } from "next/server";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status });
}

export function err(message: string, code: ErrorCode, status: number): NextResponse {
  return NextResponse.json({ data: null, error: { message, code } }, { status });
}
