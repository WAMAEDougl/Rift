import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/admin/auth", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/admin/supabase", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@/lib/mpesa", () => ({
  querySTKStatus: vi.fn(),
}));

import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { querySTKStatus } from "@/lib/mpesa";

const mockRequireAdminSession = vi.mocked(requireAdminSession);
const mockGetAdminClient = vi.mocked(getAdminClient);
const mockQuerySTKStatus = vi.mocked(querySTKStatus);

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

async function getLogsHandler() {
  const mod = await import("../[orderId]/logs/route");
  return { GET: mod.GET };
}

async function getSTKStatusHandler() {
  const mod = await import("../mpesa/status/[checkoutRequestId]/route");
  return { GET: mod.GET };
}

/**
 * Build a chainable Supabase query mock.
 * Supports: .eq(), .or(), .gte(), .lte(), .range().order() (items query)
 * or direct await (count query with count/error properties).
 */
function makeCountChain(count: number) {
  const chain: Record<string, unknown> = {
    count,
    data: null,
    error: null,
  };
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.or = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.lte = vi.fn().mockReturnValue(chain);
  // Make it thenable so Promise.all can await it
  chain.then = (resolve: (v: unknown) => void) => resolve({ count, data: null, error: null });
  return chain;
}

function makeItemsChain(data: unknown[]) {
  const chain: Record<string, unknown> = {};
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.or = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.lte = vi.fn().mockReturnValue(chain);
  chain.range = vi.fn().mockReturnValue({
    order: vi.fn().mockResolvedValue({ data, error: null }),
  });
  return chain;
}

// ─── Payments List Tests ──────────────────────────────────────────────────────

describe("GET /api/admin/payments — list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns paginated payment records", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const paymentRecords = [
      {
        id: "order-1",
        order_number: "ORD-001",
        customer_name: "Alice",
        customer_phone: "0712345678",
        total: 500,
        payment_method: "mpesa",
        payment_status: "completed",
        mpesa_receipt_number: "QHX123ABC",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "order-2",
        order_number: "ORD-002",
        customer_name: "Bob",
        customer_phone: "0798765432",
        total: 300,
        payment_method: "cash",
        payment_status: "pending",
        mpesa_receipt_number: null,
        created_at: "2024-01-02T00:00:00Z",
      },
    ];

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        return fromCallIndex === 1
          ? { select: vi.fn().mockReturnValue(makeCountChain(2)) }
          : { select: vi.fn().mockReturnValue(makeItemsChain(paymentRecords)) };
      }),
    } as never);

    const { GET } = await getListHandler();
    const req = new Request("http://localhost/api/admin/payments");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(2);
    expect(body.data.pagination).toBeDefined();
    expect(body.data.pagination.total).toBe(2);
    expect(body.error).toBeNull();
  });

  it("filters by payment_status", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const completedRecords = [
      {
        id: "order-1",
        order_number: "ORD-001",
        customer_name: "Alice",
        customer_phone: "0712345678",
        total: 500,
        payment_method: "mpesa",
        payment_status: "completed",
        mpesa_receipt_number: "QHX123ABC",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        return fromCallIndex === 1
          ? { select: vi.fn().mockReturnValue(makeCountChain(1)) }
          : { select: vi.fn().mockReturnValue(makeItemsChain(completedRecords)) };
      }),
    } as never);

    const { GET } = await getListHandler();
    const req = new Request("http://localhost/api/admin/payments?payment_status=completed");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].payment_status).toBe("completed");
  });
});

// ─── Payment Logs Tests ───────────────────────────────────────────────────────

describe("GET /api/admin/payments/[orderId]/logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 404 when order not found", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
          }),
        }),
      }),
    } as never);

    const { GET } = await getLogsHandler();
    const req = new Request("http://localhost/api/admin/payments/nonexistent-id/logs");
    const res = await GET(req, { params: Promise.resolve({ orderId: "nonexistent-id" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns array of logs when order exists", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const logs = [
      {
        id: "log-1",
        order_id: "order-1",
        provider: "mpesa",
        event_type: "stk_push_initiated",
        raw_payload: {},
        created_at: "2024-01-01T00:01:00Z",
      },
      {
        id: "log-2",
        order_id: "order-1",
        provider: "mpesa",
        event_type: "callback_received",
        raw_payload: {},
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          // order existence check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "order-1" }, error: null }),
              }),
            }),
          };
        }
        // payment_logs query
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: logs, error: null }),
            }),
          }),
        };
      }),
    } as never);

    const { GET } = await getLogsHandler();
    const req = new Request("http://localhost/api/admin/payments/order-1/logs");
    const res = await GET(req, { params: Promise.resolve({ orderId: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].event_type).toBe("stk_push_initiated");
    expect(body.error).toBeNull();
  });
});

// ─── STK Status Tests ─────────────────────────────────────────────────────────

describe("GET /api/admin/payments/mpesa/status/[checkoutRequestId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("proxies response from querySTKStatus", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const stkResponse = {
      ResponseCode: "0",
      ResponseDescription: "The service request has been accepted successfully",
      MerchantRequestID: "merchant-123",
      CheckoutRequestID: "ws_CO_123456",
      ResultCode: "0",
      ResultDesc: "The service request is processed successfully.",
    };

    mockQuerySTKStatus.mockResolvedValue(stkResponse as never);

    const { GET } = await getSTKStatusHandler();
    const req = new Request("http://localhost/api/admin/payments/mpesa/status/ws_CO_123456");
    const res = await GET(req, { params: Promise.resolve({ checkoutRequestId: "ws_CO_123456" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual(stkResponse);
    expect(body.error).toBeNull();
    expect(mockQuerySTKStatus).toHaveBeenCalledWith("ws_CO_123456");
  });

  it("returns 500 when querySTKStatus throws", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    mockQuerySTKStatus.mockRejectedValue(new Error("Network error") as never);

    const { GET } = await getSTKStatusHandler();
    const req = new Request("http://localhost/api/admin/payments/mpesa/status/ws_CO_bad");
    const res = await GET(req, { params: Promise.resolve({ checkoutRequestId: "ws_CO_bad" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});
