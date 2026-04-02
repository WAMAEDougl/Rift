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

async function getListHandler() {
  const mod = await import("../route");
  return mod.GET;
}

async function getDetailHandlers() {
  const mod = await import("../[id]/route");
  return { GET: mod.GET, DELETE: mod.DELETE };
}

// ─── Orders list ─────────────────────────────────────────────────────────────

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns paginated response with items and item_count", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const fakeOrders = [
      {
        id: "order-1",
        order_number: "ORD-001",
        customer_name: "Alice",
        customer_phone: "0712345678",
        subtotal: 500,
        delivery_fee: 150,
        total: 650,
        delivery_type: "delivery",
        status: "pending",
        payment_method: "mpesa",
        payment_status: "pending",
        created_at: "2024-01-15T10:00:00Z",
        order_items: [{ count: 3 }],
      },
    ];

    const countChain = {
      select: vi.fn().mockReturnValue({
        count: 1,
        data: null,
        error: null,
      }),
    };

    const itemsChain = {
      select: vi.fn().mockReturnValue({
        range: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: fakeOrders, error: null }),
        }),
      }),
    };

    let callCount = 0;
    const mockFrom = vi.fn().mockImplementation(() => {
      callCount++;
      return callCount === 1 ? countChain : itemsChain;
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const GET = await getListHandler();
    const req = new Request("http://localhost/api/admin/orders");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].item_count).toBe(3);
    expect(body.data.items[0].order_items).toBeUndefined();
    expect(body.data.pagination).toHaveProperty("total");
    expect(body.data.pagination).toHaveProperty("page");
    expect(body.data.pagination).toHaveProperty("per_page");
    expect(body.data.pagination).toHaveProperty("total_pages");
  });

  it("filters by status", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let capturedEqField: string | undefined;
    let capturedEqValue: string | undefined;

    const eqMock = vi.fn().mockImplementation((field: string, value: string) => {
      capturedEqField = field;
      capturedEqValue = value;
      return {
        range: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    });

    const countEqMock = vi.fn().mockReturnValue({ count: 0, data: null, error: null });

    let callCount = 0;
    const mockFrom = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { select: vi.fn().mockReturnValue({ eq: countEqMock }) };
      }
      return { select: vi.fn().mockReturnValue({ eq: eqMock }) };
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const GET = await getListHandler();
    const req = new Request("http://localhost/api/admin/orders?status=pending");
    await GET(req);

    expect(capturedEqField).toBe("status");
    expect(capturedEqValue).toBe("pending");
  });

  it("returns 401 when session is invalid", async () => {
    mockRequireAdminSession.mockResolvedValue(makeUnauthorizedResponse() as never);

    const GET = await getListHandler();
    const req = new Request("http://localhost/api/admin/orders");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});

// ─── Order detail ─────────────────────────────────────────────────────────────

describe("GET /api/admin/orders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns full order with order_items", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const fakeOrder = {
      id: "order-1",
      order_number: "ORD-001",
      status: "pending",
      order_items: [
        { id: "item-1", product_id: "prod-1", product_name: "Tea", product_price: 200, quantity: 2, line_total: 400 },
      ],
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: fakeOrder, error: null }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { GET } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/orders/order-1");
    const res = await GET(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data.id).toBe("order-1");
    expect(body.data.order_items).toHaveLength(1);
  });

  it("returns 404 when order not found", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { GET } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/orders/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});

// ─── Order delete ─────────────────────────────────────────────────────────────

describe("DELETE /api/admin/orders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 409 when order is not cancelled", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "order-1", status: "pending" },
            error: null,
          }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { DELETE } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/orders/order-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
  });

  it("returns { deleted: true } when order is cancelled", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    let callCount = 0;
    const mockFrom = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "order-1", status: "cancelled" },
                error: null,
              }),
            }),
          }),
        };
      }
      return { delete: deleteMock };
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { DELETE } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/orders/order-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({ deleted: true });
  });

  it("returns 404 when order not found", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { DELETE } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/orders/nonexistent", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
