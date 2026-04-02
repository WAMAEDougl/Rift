// Feature: admin-api, Property 14: Phone Normalisation
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { normalizePhone } from "@/lib/utils/validation";

// ─── Property 14: Phone Normalisation ────────────────────────────────────────
// Validates: Requirements 27.2

describe("Property 14: Phone Normalisation", () => {
  it("07XXXXXXXX, +2547XXXXXXXX, and 2547XXXXXXXX all normalise to 2547XXXXXXXX", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 700000000, max: 799999999 }),
        (suffix) => {
          const digits = suffix.toString(); // 9 digits: 7XXXXXXXX
          const local = `0${digits}`;           // 07XXXXXXXX
          const intlPlus = `+254${digits}`;     // +2547XXXXXXXX
          const intlBare = `254${digits}`;      // 2547XXXXXXXX

          const expected = `254${digits}`;

          expect(normalizePhone(local)).toBe(expected);
          expect(normalizePhone(intlPlus)).toBe(expected);
          expect(normalizePhone(intlBare)).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Unit Tests: M-Pesa Initiate Route ───────────────────────────────────────

vi.mock("@/lib/mpesa", () => ({
  isMpesaConfigured: vi.fn(),
  initiateSTKPush: vi.fn(),
}));

vi.mock("@/lib/admin/supabase", () => ({
  getAdminClient: vi.fn(),
}));

import { isMpesaConfigured, initiateSTKPush } from "@/lib/mpesa";
import { getAdminClient } from "@/lib/admin/supabase";

const mockIsMpesaConfigured = vi.mocked(isMpesaConfigured);
const mockInitiateSTKPush = vi.mocked(initiateSTKPush);
const mockGetAdminClient = vi.mocked(getAdminClient);

async function getHandler() {
  const mod = await import("../initiate/route");
  return { POST: mod.POST };
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/payments/mpesa/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_ORDER_ID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_PHONE = "0712345678";

describe("POST /api/payments/mpesa/initiate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ── 503 when M-Pesa not configured ──────────────────────────────────────────
  it("returns 503 when isMpesaConfigured() returns false", async () => {
    mockIsMpesaConfigured.mockReturnValue(false);

    // Supabase mock for order fetch (should not be called, but set up anyway)
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: VALID_ORDER_ID, order_number: "ORD-001", total: 500, payment_status: "pending" },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const { POST } = await getHandler();
    const res = await POST(makeRequest({ order_id: VALID_ORDER_ID, phone: VALID_PHONE }));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
    expect(body.error.message).toBe("M-Pesa is not configured on this server.");
  });

  // ── 422 when order not found ─────────────────────────────────────────────────
  it("returns 422 when order is not found", async () => {
    mockIsMpesaConfigured.mockReturnValue(true);

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
          }),
        }),
      }),
    } as never);

    const { POST } = await getHandler();
    const res = await POST(makeRequest({ order_id: VALID_ORDER_ID, phone: VALID_PHONE }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Order not found or not eligible for payment");
  });

  // ── 422 when order payment_status is not 'pending' ───────────────────────────
  it("returns 422 when order payment_status is not pending", async () => {
    mockIsMpesaConfigured.mockReturnValue(true);

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: VALID_ORDER_ID, order_number: "ORD-001", total: 500, payment_status: "processing" },
              error: null,
            }),
          }),
        }),
      }),
    } as never);

    const { POST } = await getHandler();
    const res = await POST(makeRequest({ order_id: VALID_ORDER_ID, phone: VALID_PHONE }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Order not found or not eligible for payment");
  });

  // ── 422 on Zod validation failure ────────────────────────────────────────────
  it("returns 422 on invalid phone format", async () => {
    mockIsMpesaConfigured.mockReturnValue(true);
    mockGetAdminClient.mockReturnValue({} as never);

    const { POST } = await getHandler();
    const res = await POST(makeRequest({ order_id: VALID_ORDER_ID, phone: "12345" }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  // ── Success path ─────────────────────────────────────────────────────────────
  it("success path: updates order with checkout_request_id, inserts payment_log, returns checkout_request_id", async () => {
    mockIsMpesaConfigured.mockReturnValue(true);

    const stkResponse = {
      MerchantRequestID: "merchant-123",
      CheckoutRequestID: "ws_CO_123456789",
      ResponseCode: "0",
      ResponseDescription: "Success",
      CustomerMessage: "Success",
    };

    mockInitiateSTKPush.mockResolvedValue(stkResponse as never);

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        fromCallIndex++;
        if (table === "orders" && fromCallIndex === 1) {
          // order fetch
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: VALID_ORDER_ID, order_number: "ORD-001", total: 500, payment_status: "pending" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "orders") {
          // order update
          return { update: updateMock };
        }
        if (table === "payment_logs") {
          return { insert: insertMock };
        }
        return {};
      }),
    } as never);

    const { POST } = await getHandler();
    const res = await POST(makeRequest({ order_id: VALID_ORDER_ID, phone: VALID_PHONE }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.checkout_request_id).toBe("ws_CO_123456789");
    expect(body.data.message).toBe("STK Push sent to your phone");
    expect(body.error).toBeNull();

    // Verify order was updated
    expect(updateMock).toHaveBeenCalledWith({
      mpesa_checkout_request_id: "ws_CO_123456789",
      payment_status: "processing",
    });

    // Verify payment log was inserted
    expect(insertMock).toHaveBeenCalledWith({
      order_id: VALID_ORDER_ID,
      provider: "mpesa",
      event_type: "stk_push_initiated",
      raw_payload: stkResponse,
    });
  });
});
