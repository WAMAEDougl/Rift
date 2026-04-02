import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/admin/auth", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/admin/supabase", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@/lib/admin/status", () => ({
  isValidStatusTransition: vi.fn(),
}));

vi.mock("@/lib/admin/notifications", () => ({
  createNotification: vi.fn(),
}));

import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { isValidStatusTransition } from "@/lib/admin/status";
import { createNotification } from "@/lib/admin/notifications";

const mockRequireAdminSession = vi.mocked(requireAdminSession);
const mockGetAdminClient = vi.mocked(getAdminClient);
const mockIsValidStatusTransition = vi.mocked(isValidStatusTransition);
const mockCreateNotification = vi.mocked(createNotification);

function makeAdminSession() {
  return {
    user: { id: "user-123", email: "admin@example.com" },
    profile: { id: "user-123", full_name: "Admin", email: "admin@example.com", role: "admin" as const },
  };
}

function makeKitchenSession() {
  return {
    user: { id: "kitchen-123", email: "kitchen@example.com" },
    profile: { id: "kitchen-123", full_name: "Kitchen", email: "kitchen@example.com", role: "kitchen" as const },
  };
}

async function getStatusHandler() {
  const mod = await import("../[id]/status/route");
  return mod.PATCH;
}

async function getCancelHandler() {
  const mod = await import("../[id]/cancel/route");
  return mod.POST;
}

// ─── PATCH /api/admin/orders/[id]/status ─────────────────────────────────────

describe("PATCH /api/admin/orders/[id]/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 200 with updated order on valid forward transition", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockIsValidStatusTransition.mockReturnValue(true);

    const updatedOrder = { id: "order-1", status: "confirmed", confirmed_at: "2024-01-01T00:00:00Z" };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "order-1", status: "pending" }, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedOrder, error: null }),
          }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const PATCH = await getStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/order-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "confirmed" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data.status).toBe("confirmed");
  });

  it("returns 409 on backward transition", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockIsValidStatusTransition.mockReturnValue(false);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "order-1", status: "confirmed" }, error: null }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const PATCH = await getStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/order-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "pending" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
  });

  it("returns 409 when order is in terminal state", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockIsValidStatusTransition.mockReturnValue(false);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "order-1", status: "delivered" }, error: null }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const PATCH = await getStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/order-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "confirmed" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
    expect(body.error.message).toContain("delivered");
  });

  it("returns 403 when kitchen role tries to cancel", async () => {
    mockRequireAdminSession.mockResolvedValue(makeKitchenSession() as never);

    // No DB calls needed — should be rejected before fetching order
    mockGetAdminClient.mockReturnValue({ from: vi.fn() } as never);

    const PATCH = await getStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/order-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("returns 422 on invalid status value", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockGetAdminClient.mockReturnValue({ from: vi.fn() } as never);

    const PATCH = await getStatusHandler();
    const req = new Request("http://localhost/api/admin/orders/order-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "invalid-status" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

// ─── POST /api/admin/orders/[id]/cancel ──────────────────────────────────────

describe("POST /api/admin/orders/[id]/cancel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("cancels order and returns updated order", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockCreateNotification.mockResolvedValue(undefined);

    const updatedOrder = { id: "order-1", status: "cancelled", payment_status: "pending" };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "order-1", order_number: "ORD-001", status: "pending", payment_status: "pending", order_notes: null },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedOrder, error: null }),
          }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const POST = await getCancelHandler();
    const req = new Request("http://localhost/api/admin/orders/order-1/cancel", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data.status).toBe("cancelled");
  });

  it("sets payment_status to refunded when payment was completed", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockCreateNotification.mockResolvedValue(undefined);

    let capturedUpdateObj: Record<string, unknown> = {};

    const updateMock = vi.fn().mockImplementation((obj: Record<string, unknown>) => {
      capturedUpdateObj = obj;
      return {
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "order-1", status: "cancelled", payment_status: "refunded" },
              error: null,
            }),
          }),
        }),
      };
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "order-1", order_number: "ORD-001", status: "confirmed", payment_status: "completed", order_notes: null },
            error: null,
          }),
        }),
      }),
      update: updateMock,
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const POST = await getCancelHandler();
    const req = new Request("http://localhost/api/admin/orders/order-1/cancel", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "order-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(capturedUpdateObj.payment_status).toBe("refunded");
    expect(body.data.payment_status).toBe("refunded");
  });

  it("emits order_cancelled notification (fire-and-forget)", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);
    mockCreateNotification.mockResolvedValue(undefined);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "order-1", order_number: "ORD-042", status: "pending", payment_status: "pending", order_notes: null },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "order-1", status: "cancelled" },
              error: null,
            }),
          }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const POST = await getCancelHandler();
    const req = new Request("http://localhost/api/admin/orders/order-1/cancel", {
      method: "POST",
      body: JSON.stringify({ reason: "Customer request" }),
    });
    await POST(req, { params: Promise.resolve({ id: "order-1" }) });

    expect(mockCreateNotification).toHaveBeenCalledWith(
      "order_cancelled",
      "Order #ORD-042 Cancelled",
      "Customer request",
      "order-1"
    );
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

    const POST = await getCancelHandler();
    const req = new Request("http://localhost/api/admin/orders/nonexistent/cancel", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "nonexistent" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
