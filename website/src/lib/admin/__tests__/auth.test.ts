import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// Mock the cookie-based Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock the service role admin client
vi.mock("../supabase", () => ({
  getAdminClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "../supabase";
import { requireAdminSession } from "../auth";

const mockCreateClient = vi.mocked(createClient);
const mockGetAdminClient = vi.mocked(getAdminClient);

function makeRequest(): Request {
  return new Request("http://localhost/api/admin/test");
}

function makeFakeUser() {
  return { id: "user-123", email: "admin@example.com" };
}

function makeSupabaseClient(user: { id: string; email: string } | null, signOutFn = vi.fn()) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: "No session" },
      }),
      signOut: signOutFn,
    },
  };
}

function makeAdminClient(profile: Record<string, unknown> | null) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: profile, error: null }),
        }),
      }),
    }),
  };
}

describe("requireAdminSession — property tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Feature: admin-api, Property 3: Session Guard Role Enforcement
  it("Property 3: any role not in ['admin','kitchen'] must produce a 403 response and never return an AdminSession", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (role) => {
        fc.pre(!["admin", "kitchen"].includes(role));

        const signOut = vi.fn().mockResolvedValue({});
        mockCreateClient.mockResolvedValue(makeSupabaseClient(makeFakeUser(), signOut) as never);
        mockGetAdminClient.mockReturnValue(
          makeAdminClient({ id: "user-123", full_name: "Test User", email: "admin@example.com", role }) as never
        );

        const result = await requireAdminSession(makeRequest());

        // Must be a Response (not an AdminSession)
        expect(result).toBeInstanceOf(Response);

        const response = result as Response;
        expect(response.status).toBe(403);

        const body = await response.json();
        expect(body.data).toBeNull();
        expect(body.error.code).toBe("FORBIDDEN");

        // signOut must have been called for invalid roles
        expect(signOut).toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });
});
