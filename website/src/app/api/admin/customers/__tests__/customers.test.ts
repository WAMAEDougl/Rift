import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("@/lib/admin/auth", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/admin/supabase", () => ({
  getAdminClient: vi.fn(),
}));

import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";

const mockRequireAdminSession = vi.mocked(requireAdminSession);
const mockGetAdminClient = vi.mocked(getAdminClient);

function makeAdminSession(userId = "admin-user-id") {
  return {
    user: { id: userId, email: "admin@example.com" },
    profile: { id: userId, full_name: "Admin", email: "admin@example.com", role: "admin" as const },
  };
}

async function getListHandler() {
  const mod = await import("../route");
  return { GET: mod.GET };
}

async function getDetailHandler() {
  const mod = await import("../[id]/route");
  return { GET: mod.GET };
}

async function getRoleHandler() {
  const mod = await import("../[id]/role/route");
  return { PATCH: mod.PATCH };
}

// ─── Property Tests ───────────────────────────────────────────────────────────

// Feature: admin-api, Property 15: Self-Role Modification Forbidden
describe("Property 15: Self-Role Modification Forbidden", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("session user changing their own role must always return 403 and not call update", async () => {
    // **Validates: Requirements 21.3**
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (userId) => {
          vi.clearAllMocks();
          vi.resetModules();

          // Session user ID matches the target ID
          mockRequireAdminSession.mockResolvedValue(makeAdminSession(userId) as never);

          const updateMock = vi.fn();
          const mockFrom = vi.fn().mockReturnValue({
            update: updateMock,
          });
          mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

          const { PATCH } = await getRoleHandler();
          const req = new Request(`http://localhost/api/admin/customers/${userId}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "customer" }),
          });
          const res = await PATCH(req, { params: Promise.resolve({ id: userId }) });
          const body = await res.json();

          expect(res.status).toBe(403);
          expect(body.error.code).toBe("FORBIDDEN");
          expect(updateMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("GET /api/admin/customers — list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns paginated profiles with order_count and total_spent", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const rawProfiles = [
      {
        id: "p1",
        full_name: "Alice",
        email: "alice@example.com",
        phone: "0712345678",
        role: "customer",
        created_at: "2024-01-01T00:00:00Z",
        orders: [
          { total: 500, payment_status: "completed" },
          { total: 300, payment_status: "pending" },
        ],
      },
      {
        id: "p2",
        full_name: "Bob",
        email: "bob@example.com",
        phone: "0798765432",
        role: "customer",
        created_at: "2024-01-02T00:00:00Z",
        orders: [],
      },
    ];

    const mockFrom = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({ data: rawProfiles, error: null }),
        }),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({ data: rawProfiles, error: null }),
          }),
        }),
      }),
    }));

    // First call is count query, second is items query
    let callCount = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // count query
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ count: 2, error: null }),
              }),
              // head: true path
              or: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
              }),
            }),
          };
        }
        // items query
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: rawProfiles, error: null }),
            }),
          }),
        };
      }),
    } as never);

    // Simpler mock: use separate mocks for count and items
    vi.clearAllMocks();
    vi.resetModules();
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          // count query (head: true)
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ count: 2, error: null }),
              }),
            }),
          };
        }
        // items query
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: rawProfiles, error: null }),
            }),
          }),
        };
      }),
    } as never);

    const { GET } = await getListHandler();
    const req = new Request("http://localhost/api/admin/customers");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(2);
    // Alice: 1 completed order of 500
    expect(body.data.items[0].order_count).toBe(2);
    expect(body.data.items[0].total_spent).toBe(500);
    // Bob: no orders
    expect(body.data.items[1].order_count).toBe(0);
    expect(body.data.items[1].total_spent).toBe(0);
    // orders key should be removed
    expect(body.data.items[0]).not.toHaveProperty("orders");
    expect(body.data.pagination).toBeDefined();
  });
});

describe("GET /api/admin/customers/[id] — detail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 404 when profile not found", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
              }),
            }),
          };
        }
        return {};
      }),
    } as never);

    const { GET } = await getDetailHandler();
    const req = new Request("http://localhost/api/admin/customers/nonexistent-id");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent-id" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns profile, orders, and stats when found", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const profile = { id: "p1", full_name: "Alice", email: "alice@example.com", role: "customer" };
    const orders = [
      { id: "o1", total: 500, payment_status: "completed", created_at: "2024-03-01T00:00:00Z", customer_id: "p1" },
      { id: "o2", total: 300, payment_status: "pending", created_at: "2024-01-01T00:00:00Z", customer_id: "p1" },
    ];

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: profile, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: orders, error: null }),
              }),
            }),
          }),
        };
      }),
    } as never);

    const { GET } = await getDetailHandler();
    const req = new Request("http://localhost/api/admin/customers/p1");
    const res = await GET(req, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.profile).toEqual(profile);
    expect(body.data.orders).toHaveLength(2);
    expect(body.data.stats.order_count).toBe(2);
    expect(body.data.stats.total_spent_kes).toBe(500);
    expect(body.data.stats.last_order_at).toBe("2024-03-01T00:00:00Z");
    expect(body.data.stats.first_order_at).toBe("2024-01-01T00:00:00Z");
  });
});

describe("PATCH /api/admin/customers/[id]/role — self-change", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 403 when trying to change own role", async () => {
    const userId = "self-user-id";
    mockRequireAdminSession.mockResolvedValue(makeAdminSession(userId) as never);

    const updateMock = vi.fn();
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({ update: updateMock }),
    } as never);

    const { PATCH } = await getRoleHandler();
    const req = new Request(`http://localhost/api/admin/customers/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "customer" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: userId }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
    expect(body.error.message).toBe("You cannot change your own role.");
    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/admin/customers/[id]/role — valid update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 200 with updated profile when role is valid and target is different user", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession("admin-user-id") as never);

    const updatedProfile = { id: "target-user-id", full_name: "Bob", email: "bob@example.com", role: "kitchen" };

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

    const { PATCH } = await getRoleHandler();
    const req = new Request("http://localhost/api/admin/customers/target-user-id/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "kitchen" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "target-user-id" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.role).toBe("kitchen");
    expect(body.error).toBeNull();
  });

  it("returns 422 when role value is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession("admin-user-id") as never);

    mockGetAdminClient.mockReturnValue({ from: vi.fn() } as never);

    const { PATCH } = await getRoleHandler();
    const req = new Request("http://localhost/api/admin/customers/target-user-id/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "superadmin" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "target-user-id" }) });
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});
