import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/admin/auth", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/admin/supabase", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@/lib/mpesa", () => ({
  getOAuthToken: vi.fn(),
}));

import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { getOAuthToken } from "@/lib/mpesa";

const mockRequireAdminSession = vi.mocked(requireAdminSession);
const mockGetAdminClient = vi.mocked(getAdminClient);
const mockGetOAuthToken = vi.mocked(getOAuthToken);

function makeAdminSession(userId = "admin-user-id") {
  return {
    user: { id: userId, email: "admin@example.com" },
    profile: {
      id: userId,
      full_name: "Admin",
      email: "admin@example.com",
      role: "admin" as const,
    },
  };
}

async function getSettingsHandler() {
  const mod = await import("../route");
  return { GET: mod.GET, PATCH: mod.PATCH };
}

async function getInviteHandler() {
  const mod = await import("../invite/route");
  return { POST: mod.POST };
}

async function getUsersHandler() {
  const mod = await import("../users/[id]/route");
  return { DELETE: mod.DELETE };
}

async function getTestMpesaHandler() {
  const mod = await import("../test-mpesa/route");
  return { POST: mod.POST };
}

// ─── GET /api/admin/settings ──────────────────────────────────────────────────

describe("GET /api/admin/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns store_settings row", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const settings = {
      id: 1,
      store_name: "Ayola Foods KE",
      support_email: "support@ayola.co.ke",
      support_phone: "+254700000000",
      default_delivery_fee: 150,
      delivery_cities: ["Nairobi"],
      order_notification_emails: [],
      updated_at: "2024-01-01T00:00:00Z",
    };

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: settings, error: null }),
          }),
        }),
      }),
    } as never);

    const { GET } = await getSettingsHandler();
    const req = new Request("http://localhost/api/admin/settings");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(settings);
    expect(body.error).toBeNull();
  });
});

// ─── PATCH /api/admin/settings ────────────────────────────────────────────────

describe("PATCH /api/admin/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("updates only provided fields and returns 200", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const updatedSettings = {
      id: 1,
      store_name: "New Name",
      support_email: "new@ayola.co.ke",
      default_delivery_fee: 200,
    };

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedSettings, error: null }),
            }),
          }),
        }),
      }),
    } as never);

    const { PATCH } = await getSettingsHandler();
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_name: "New Name" }),
    });
    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(updatedSettings);
    expect(body.error).toBeNull();
  });

  it("returns 422 when support_email is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetAdminClient.mockReturnValue({ from: vi.fn() } as never);

    const { PATCH } = await getSettingsHandler();
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ support_email: "not-an-email" }),
    });
    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when unknown field is provided (strict schema)", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetAdminClient.mockReturnValue({ from: vi.fn() } as never);

    const { PATCH } = await getSettingsHandler();
    const req = new Request("http://localhost/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unknown_field: "value" }),
    });
    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ─── POST /api/admin/settings/invite ─────────────────────────────────────────

describe("POST /api/admin/settings/invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("invites user and upserts profile, returns 201", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const invitedUser = { id: "new-user-id", email: "newadmin@example.com" };

    mockGetAdminClient.mockReturnValue({
      auth: {
        admin: {
          inviteUserByEmail: vi.fn().mockResolvedValue({
            data: { user: invitedUser },
            error: null,
          }),
        },
      },
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as never);

    const { POST } = await getInviteHandler();
    const req = new Request("http://localhost/api/admin/settings/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "newadmin@example.com", role: "admin" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data).toEqual({
      email: "newadmin@example.com",
      role: "admin",
      invited: true,
    });
    expect(body.error).toBeNull();
  });

  it("returns 422 when email is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetAdminClient.mockReturnValue({ auth: { admin: {} }, from: vi.fn() } as never);

    const { POST } = await getInviteHandler();
    const req = new Request("http://localhost/api/admin/settings/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bad-email", role: "admin" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when role is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetAdminClient.mockReturnValue({ auth: { admin: {} }, from: vi.fn() } as never);

    const { POST } = await getInviteHandler();
    const req = new Request("http://localhost/api/admin/settings/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", role: "customer" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ─── DELETE /api/admin/settings/users/[id] ───────────────────────────────────

describe("DELETE /api/admin/settings/users/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 400 when trying to demote yourself", async () => {
    const userId = "self-user-id";
    mockRequireAdminSession.mockResolvedValue(makeAdminSession(userId) as never);

    const updateMock = vi.fn();
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({ update: updateMock }),
    } as never);

    const { DELETE } = await getUsersHandler();
    const req = new Request(`http://localhost/api/admin/settings/users/${userId}`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: userId }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("You cannot demote yourself.");
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("demotes another user to customer and returns 200", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession("admin-user-id") as never);

    const updatedProfile = { id: "target-user-id", role: "customer" };

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
            }),
          }),
        }),
      }),
    } as never);

    const { DELETE } = await getUsersHandler();
    const req = new Request("http://localhost/api/admin/settings/users/target-user-id", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "target-user-id" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({ id: "target-user-id", role: "customer" });
    expect(body.error).toBeNull();
  });

  it("returns 404 when user not found", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession("admin-user-id") as never);

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
            }),
          }),
        }),
      }),
    } as never);

    const { DELETE } = await getUsersHandler();
    const req = new Request("http://localhost/api/admin/settings/users/nonexistent", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});

// ─── POST /api/admin/settings/test-mpesa ─────────────────────────────────────

describe("POST /api/admin/settings/test-mpesa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns { success: true } when OAuth token succeeds", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetOAuthToken.mockResolvedValue("mock-token");

    const { POST } = await getTestMpesaHandler();
    const req = new Request("http://localhost/api/admin/settings/test-mpesa", {
      method: "POST",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(true);
    expect(body.data.message).toBe("M-Pesa credentials are valid.");
    expect(body.data.environment).toMatch(/^(sandbox|production)$/);
    expect(body.error).toBeNull();
  });

  it("returns { success: false } when OAuth token fails", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetOAuthToken.mockRejectedValue(new Error("M-Pesa OAuth failed: 401 Unauthorized"));

    const { POST } = await getTestMpesaHandler();
    const req = new Request("http://localhost/api/admin/settings/test-mpesa", {
      method: "POST",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.success).toBe(false);
    expect(body.data.message).toContain("Failed to authenticate:");
    expect(body.error).toBeNull();
  });
});
