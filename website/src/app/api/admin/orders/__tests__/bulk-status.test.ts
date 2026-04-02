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

function makeAdminSession() {
  return {
    user: { id: "user-123", email: "admin@example.com" },
    profile: {
      id: "user-123",
      full_name: "Admin",
      email: "admin@example.com",
      role: "admin" as const,
    },
  };
}

async function getBulkStatusHandler() {
  const mod = await import("../bulk-status/route");
  return mod.POST;
}

// ─── Property Tests ───────────────────────────────────────────────────────────

// Feature: admin-api, Property 10: Bulk Update Count Invariant
describe("Property 10: Bulk Update Count Invariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("updated + skipped always equals the number of input IDs", async () => {
    // **Validates: Requirements 14.1, 14.4**
    const TERMINAL_STATUSES = ["delivered", "cancelled"];
    const ALL_STATUSES = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "dispatched",
      "delivered",
      "cancelled",
    ];

    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 50 }),
        fc.array(fc.constantFrom(...ALL_STATUSES), { minLength: 0, maxLength: 50 }),
        async (ids, dbStatuses) => {
          vi.clearAllMocks();
          vi.resetModules();

          mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

          // Build fake DB orders: pair each id with a status from dbStatuses (cycle if needed)
          const fakeOrders = ids.map((id, i) => ({
            id,
            status: dbStatuses[i % Math.max(dbStatuses.length, 1)] ?? "pending",
          }));

          const terminalCount = fakeOrders.filter((o) =>
            TERMINAL_STATUSES.includes(o.status)
          ).length;
          const nonTerminalCount = fakeOrders.length - terminalCount;

          const mockFrom = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ data: fakeOrders, error: null }),
            }),
            update: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ error: null }),
            }),
          });

          mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

          const POST = await getBulkStatusHandler();
          const req = new Request(
            "http://localhost/api/admin/orders/bulk-status",
            {
              method: "POST",
              body: JSON.stringify({ ids, status: "confirmed" }),
            }
          );
          const res = await POST(req);
          const body = await res.json();

          expect(res.status).toBe(200);
          expect(body.data.updated + body.data.skipped).toBe(ids.length);
          expect(body.data.updated).toBe(nonTerminalCount);
          expect(body.data.skipped).toBe(terminalCount);
          expect(body.data.skipped_ids).toHaveLength(terminalCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("POST /api/admin/orders/bulk-status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 422 when more than 50 IDs are provided", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetAdminClient.mockReturnValue({ from: vi.fn() } as never);

    const ids = Array.from({ length: 51 }, () => crypto.randomUUID());

    const POST = await getBulkStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids, status: "confirmed" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when ids array is empty", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetAdminClient.mockReturnValue({ from: vi.fn() } as never);

    const POST = await getBulkStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids: [], status: "confirmed" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when status is not confirmed or cancelled", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetAdminClient.mockReturnValue({ from: vi.fn() } as never);

    const POST = await getBulkStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids: [crypto.randomUUID()], status: "preparing" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("skips terminal orders and includes their IDs in skipped_ids", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const terminalId1 = crypto.randomUUID();
    const terminalId2 = crypto.randomUUID();
    const nonTerminalId = crypto.randomUUID();

    const fakeOrders = [
      { id: terminalId1, status: "delivered" },
      { id: terminalId2, status: "cancelled" },
      { id: nonTerminalId, status: "pending" },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: fakeOrders, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const POST = await getBulkStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({
        ids: [terminalId1, terminalId2, nonTerminalId],
        status: "confirmed",
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.updated).toBe(1);
    expect(body.data.skipped).toBe(2);
    expect(body.data.skipped_ids).toContain(terminalId1);
    expect(body.data.skipped_ids).toContain(terminalId2);
    expect(body.data.skipped_ids).not.toContain(nonTerminalId);
  });

  it("updates non-terminal orders and returns correct counts", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    const fakeOrders = [
      { id: id1, status: "pending" },
      { id: id2, status: "confirmed" },
    ];

    let capturedUpdateIds: string[] = [];
    let capturedStatus: string = "";

    const updateMock = vi.fn().mockImplementation((obj: { status: string }) => {
      capturedStatus = obj.status;
      return {
        in: vi.fn().mockImplementation((_field: string, ids: string[]) => {
          capturedUpdateIds = ids;
          return Promise.resolve({ error: null });
        }),
      };
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: fakeOrders, error: null }),
      }),
      update: updateMock,
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const POST = await getBulkStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids: [id1, id2], status: "confirmed" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.updated).toBe(2);
    expect(body.data.skipped).toBe(0);
    expect(body.data.skipped_ids).toHaveLength(0);
    expect(capturedStatus).toBe("confirmed");
    expect(capturedUpdateIds).toContain(id1);
    expect(capturedUpdateIds).toContain(id2);
  });

  it("does not call update when all orders are terminal", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    const fakeOrders = [
      { id: id1, status: "delivered" },
      { id: id2, status: "cancelled" },
    ];

    const updateMock = vi.fn();
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: fakeOrders, error: null }),
      }),
      update: updateMock,
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const POST = await getBulkStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids: [id1, id2], status: "confirmed" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.updated).toBe(0);
    expect(body.data.skipped).toBe(2);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 401 when session is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(
      new Response(
        JSON.stringify({ data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } }),
        { status: 401 }
      ) as never
    );

    const POST = await getBulkStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids: [crypto.randomUUID()], status: "confirmed" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});
