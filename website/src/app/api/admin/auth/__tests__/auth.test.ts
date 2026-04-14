import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/admin/supabase", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  requireAdminSession: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/admin/supabase";
import { requireAdminSession } from "@/lib/admin/auth";

const mockCreateClient = vi.mocked(createClient);
const mockGetAdminClient = vi.mocked(getAdminClient);
const mockRequireAdminSession = vi.mocked(requireAdminSession);

function makeRequest(body?: unknown, method = "POST") {
  return new Request("http://localhost/api/admin/auth/login", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function makeSupabaseClient(
  user: { id: string; email: string } | null,
  signOutFn = vi.fn().mockResolvedValue({})
) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(
        user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Invalid credentials" } }
      ),
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

function makeAdminSession(role: "admin" | "kitchen" = "admin") {
  return {
    user: { id: "user-123", email: "admin@example.com" },
    profile: {
      id: "user-123",
      full_name: "Admin User",
      email: "admin@example.com",
      role,
    },
  };
}

// Dynamically import route handlers after mocks are set up
async function getLoginHandler() {
  const mod = await import("../login/route");
  return mod.POST;
}

async function getLogoutHandler() {
  const mod = await import("../logout/route");
  return mod.POST;
}

async function getMeHandler() {
  const mod = await import("../me/route");
  return mod.GET;
}

describe("POST /api/admin/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 200 with profile on valid credentials and admin role", async () => {
    const user = { id: "user-123", email: "admin@example.com" };
    const profile = {
      id: "user-123",
      email: "admin@example.com",
      full_name: "Admin User",
      role: "admin",
    };

    mockCreateClient.mockResolvedValue(makeSupabaseClient(user) as never);
    mockGetAdminClient.mockReturnValue(makeAdminClient(profile) as never);

    const POST = await getLoginHandler();
    const req = makeRequest({ email: "admin@example.com", password: "password123" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({
      id: "user-123",
      email: "admin@example.com",
      full_name: "Admin User",
      role: "admin",
    });
    expect(body.error).toBeNull();
  });

  it("returns 401 when signInWithPassword returns an error", async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseClient(null) as never);

    const POST = await getLoginHandler();
    const req = makeRequest({ email: "admin@example.com", password: "wrongpassword" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Invalid email or password");
  });

  it("returns 403 when profile role is not admin or kitchen", async () => {
    const user = { id: "user-456", email: "customer@example.com" };
    const profile = {
      id: "user-456",
      email: "customer@example.com",
      full_name: "Customer User",
      role: "customer",
    };
    const signOut = vi.fn().mockResolvedValue({});
    const supabaseClient = makeSupabaseClient(user, signOut);

    mockCreateClient.mockResolvedValue(supabaseClient as never);
    mockGetAdminClient.mockReturnValue(makeAdminClient(profile) as never);

    const POST = await getLoginHandler();
    const req = makeRequest({ email: "customer@example.com", password: "password123" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("FORBIDDEN");
    expect(body.error.message).toBe("Access denied");
    expect(signOut).toHaveBeenCalled();
  });

  it("returns 422 when email is missing", async () => {
    const POST = await getLoginHandler();
    const req = makeRequest({ password: "password123" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when password is too short", async () => {
    const POST = await getLoginHandler();
    const req = makeRequest({ email: "admin@example.com", password: "short" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when email is invalid", async () => {
    const POST = await getLoginHandler();
    const req = makeRequest({ email: "not-an-email", password: "password123" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/admin/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 200 with success: true when session is valid", async () => {
    const signOut = vi.fn().mockResolvedValue({});
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockCreateClient.mockResolvedValue({
      auth: { signOut },
    } as never);

    const POST = await getLogoutHandler();
    const req = new Request("http://localhost/api/admin/auth/logout", { method: "POST" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({ success: true });
    expect(body.error).toBeNull();
    expect(signOut).toHaveBeenCalled();
  });

  it("returns 401 when no valid session", async () => {
    const unauthorizedResponse = new Response(
      JSON.stringify({ data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } }),
      { status: 401 }
    );
    mockRequireAdminSession.mockResolvedValue(unauthorizedResponse as never);

    const POST = await getLogoutHandler();
    const req = new Request("http://localhost/api/admin/auth/logout", { method: "POST" });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/admin/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 200 with profile fields when session is valid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession("admin") as never);

    const GET = await getMeHandler();
    const req = new Request("http://localhost/api/admin/auth/me", { method: "GET" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({
      id: "user-123",
      full_name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    });
    expect(body.error).toBeNull();
  });

  it("returns 401 when no valid session", async () => {
    const unauthorizedResponse = new Response(
      JSON.stringify({ data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } }),
      { status: 401 }
    );
    mockRequireAdminSession.mockResolvedValue(unauthorizedResponse as never);

    const GET = await getMeHandler();
    const req = new Request("http://localhost/api/admin/auth/me", { method: "GET" });
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("returns kitchen role correctly", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession("kitchen") as never);

    const GET = await getMeHandler();
    const req = new Request("http://localhost/api/admin/auth/me", { method: "GET" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.role).toBe("kitchen");
  });
});
