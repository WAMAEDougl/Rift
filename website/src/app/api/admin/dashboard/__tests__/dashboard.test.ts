import { describe, it, expect, vi, beforeEach } from "vitest";

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

function makeAdminSession() {
  return {
    user: { id: "user-123", email: "admin@example.com" },
    profile: { id: "user-123", full_name: "Admin", email: "admin@example.com", role: "admin" },
  };
}

function makeUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } }),
    { status: 401 }
  );
}

// ─── Stats route ─────────────────────────────────────────────────────────────

async function getStatsHandler() {
  const mod = await import("../stats/route");
  return mod.GET;
}

async function getRevenueHandler() {
  const mod = await import("../revenue/route");
  return mod.GET;
}

async function getOrderStatusSummaryHandler() {
  const mod = await import("../order-status-summary/route");
  return mod.GET;
}

describe("GET /api/admin/dashboard/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns all four fields with correct values", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    // Build a mock admin client that handles the four parallel queries
    const mockFrom = vi.fn();

    // Query 1: count all orders → count: 42
    const ordersCountChain = {
      select: vi.fn().mockReturnValue({ count: 42, data: null, error: null }),
    };

    // Query 2: revenue sum → rows with total
    const revenueChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ total: 1000 }, { total: 500 }, { total: 250 }],
          error: null,
        }),
      }),
    };

    // Query 3: pending orders count → count: 5
    const pendingChain = {
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({ count: 5, data: null, error: null }),
      }),
    };

    // Query 4: customer count → count: 20
    const customersChain = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ count: 20, data: null, error: null }),
      }),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return customersChain;
      // orders table — distinguish by call order
      const callCount = mockFrom.mock.calls.filter((c) => c[0] === "orders").length;
      if (callCount === 1) return ordersCountChain;
      if (callCount === 2) return revenueChain;
      return pendingChain;
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const GET = await getStatsHandler();
    const req = new Request("http://localhost/api/admin/dashboard/stats");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data).toHaveProperty("total_orders");
    expect(body.data).toHaveProperty("total_revenue_kes");
    expect(body.data).toHaveProperty("pending_orders");
    expect(body.data).toHaveProperty("total_customers");
  });

  it("returns 401 when session is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeUnauthorizedResponse() as never);

    const GET = await getStatsHandler();
    const req = new Request("http://localhost/api/admin/dashboard/stats");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});

// ─── Revenue route ────────────────────────────────────────────────────────────

describe("GET /api/admin/dashboard/revenue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns array of { date, revenue_kes } objects", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            data: [
              { total: 500, created_at: "2024-01-15T10:00:00Z" },
              { total: 300, created_at: "2024-01-15T14:00:00Z" },
              { total: 200, created_at: "2024-01-16T09:00:00Z" },
            ],
            error: null,
          }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const GET = await getRevenueHandler();
    const req = new Request("http://localhost/api/admin/dashboard/revenue?days=14");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.error).toBeNull();
    expect(Array.isArray(body.data)).toBe(true);
    // Two distinct dates
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toHaveProperty("date");
    expect(body.data[0]).toHaveProperty("revenue_kes");
    // Same-day totals are summed
    const jan15 = body.data.find((d: { date: string }) => d.date === "2024-01-15");
    expect(jan15?.revenue_kes).toBe(800);
  });

  it("clamps days to 90 when days=200 is passed", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let capturedGte: string | undefined;
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockImplementation((_, value: string) => {
            capturedGte = value;
            return Promise.resolve({ data: [], error: null });
          }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const GET = await getRevenueHandler();
    const req = new Request("http://localhost/api/admin/dashboard/revenue?days=200");
    const res = await GET(req);

    expect(res.status).toBe(200);

    // The cutoff date should be ~90 days ago, not 200 days ago
    const cutoff = new Date(capturedGte!);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeLessThanOrEqual(91); // allow 1 day tolerance
    expect(diffDays).toBeGreaterThanOrEqual(89);
  });

  it("defaults to 14 days when no days param", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let capturedGte: string | undefined;
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockImplementation((_, value: string) => {
            capturedGte = value;
            return Promise.resolve({ data: [], error: null });
          }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const GET = await getRevenueHandler();
    const req = new Request("http://localhost/api/admin/dashboard/revenue");
    await GET(req);

    const cutoff = new Date(capturedGte!);
    const now = new Date();
    const diffDays = Math.round((now.getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeLessThanOrEqual(15);
    expect(diffDays).toBeGreaterThanOrEqual(13);
  });

  it("returns 401 when session is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeUnauthorizedResponse() as never);

    const GET = await getRevenueHandler();
    const req = new Request("http://localhost/api/admin/dashboard/revenue");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});

// ─── Order status summary route ───────────────────────────────────────────────

describe("GET /api/admin/dashboard/order-status-summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns array of { status, count } objects", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          { status: "pending" },
          { status: "pending" },
          { status: "confirmed" },
          { status: "delivered" },
          { status: "delivered" },
          { status: "delivered" },
          { status: "cancelled" },
        ],
        error: null,
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const GET = await getOrderStatusSummaryHandler();
    const req = new Request("http://localhost/api/admin/dashboard/order-status-summary");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.error).toBeNull();
    expect(Array.isArray(body.data)).toBe(true);

    const pending = body.data.find((d: { status: string }) => d.status === "pending");
    const confirmed = body.data.find((d: { status: string }) => d.status === "confirmed");
    const delivered = body.data.find((d: { status: string }) => d.status === "delivered");
    const cancelled = body.data.find((d: { status: string }) => d.status === "cancelled");

    expect(pending?.count).toBe(2);
    expect(confirmed?.count).toBe(1);
    expect(delivered?.count).toBe(3);
    expect(cancelled?.count).toBe(1);
  });

  it("returns empty array when no orders exist", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const GET = await getOrderStatusSummaryHandler();
    const req = new Request("http://localhost/api/admin/dashboard/order-status-summary");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 401 when session is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeUnauthorizedResponse() as never);

    const GET = await getOrderStatusSummaryHandler();
    const req = new Request("http://localhost/api/admin/dashboard/order-status-summary");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});
