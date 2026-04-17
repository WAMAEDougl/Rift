import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all dependencies before importing route modules
vi.mock("@/lib/admin/notifications", () => ({
  createNotification: vi.fn(),
}));

vi.mock("@/lib/utils/api", () => ({
  getServiceClient: vi.fn(),
  apiError: vi.fn((message: string, status = 400) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json({ error: message }, { status });
  }),
  apiSuccess: vi.fn((data: unknown) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(data);
  }),
  checkRateLimit: vi.fn(() => true),
}));

vi.mock("@/lib/utils/validation", () => ({
  createOrderSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock("@/lib/order-utils", () => ({
  generateOrderNumber: vi.fn(),
  calculateDeliveryFee: vi.fn(),
  validateOrderItems: vi.fn(),
}));

import { createNotification } from "@/lib/admin/notifications";
import { getServiceClient, checkRateLimit } from "@/lib/utils/api";
import { createOrderSchema } from "@/lib/utils/validation";
import { generateOrderNumber, calculateDeliveryFee, validateOrderItems } from "@/lib/order-utils";

const mockCreateNotification = vi.mocked(createNotification);
const mockGetServiceClient = vi.mocked(getServiceClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockGenerateOrderNumber = vi.mocked(generateOrderNumber);
const mockCalculateDeliveryFee = vi.mocked(calculateDeliveryFee);
const mockValidateOrderItems = vi.mocked(validateOrderItems);

// ─── Order Route — new_order notification ────────────────────────────────────

describe("POST /api/orders — new_order notification side effect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("emits new_order notification (fire-and-forget) after successful order creation", async () => {
    mockCheckRateLimit.mockReturnValue(true);

    vi.mocked(createOrderSchema).safeParse = vi.fn().mockReturnValue({
      success: true,
      data: {
        customer_name: "Jane Doe",
        customer_phone: "254712345678",
        delivery_address: "123 Main St",
        delivery_city: "Nairobi",
        delivery_type: "delivery",
        payment_method: "mpesa",
        items: [{ product_id: "prod-1", quantity: 2 }],
      },
    });

    mockValidateOrderItems.mockResolvedValue({
      valid: true,
      validatedItems: [
        {
          product_id: "prod-1",
          product_name: "Test Product",
          product_price: 500,
          quantity: 2,
          line_total: 1000,
        },
      ],
      subtotal: 1000,
    });

    mockCalculateDeliveryFee.mockReturnValue(200);
    mockGenerateOrderNumber.mockResolvedValue("AY-20240101-0001");

    const insertedOrder = { id: "order-uuid-1", order_number: "AY-20240101-0001" };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: insertedOrder, error: null }),
            }),
          }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
      };
    });

    mockGetServiceClient.mockReturnValue({ from: mockFrom } as never);
    mockCreateNotification.mockResolvedValue(undefined);

    const { POST } = await import("../orders/route");

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({
        customer_name: "Jane Doe",
        customer_phone: "0712345678",
        delivery_address: "123 Main St",
        delivery_city: "Nairobi",
        delivery_type: "delivery",
        payment_method: "mpesa",
        items: [{ product_id: "prod-1", quantity: 2 }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockCreateNotification).toHaveBeenCalledWith(
      "new_order",
      "New Order #AY-20240101-0001",
      "New order placed by Jane Doe",
      "order-uuid-1"
    );
  });

  it("does NOT emit notification when order items insertion fails", async () => {
    mockCheckRateLimit.mockReturnValue(true);

    vi.mocked(createOrderSchema).safeParse = vi.fn().mockReturnValue({
      success: true,
      data: {
        customer_name: "Jane Doe",
        customer_phone: "254712345678",
        delivery_address: "123 Main St",
        delivery_city: "Nairobi",
        delivery_type: "delivery",
        payment_method: "mpesa",
        items: [{ product_id: "prod-1", quantity: 1 }],
      },
    });

    mockValidateOrderItems.mockResolvedValue({
      valid: true,
      validatedItems: [
        {
          product_id: "prod-1",
          product_name: "Test Product",
          product_price: 500,
          quantity: 1,
          line_total: 500,
        },
      ],
      subtotal: 500,
    });

    mockCalculateDeliveryFee.mockReturnValue(200);
    mockGenerateOrderNumber.mockResolvedValue("AY-20240101-0002");

    const insertedOrder = { id: "order-uuid-2", order_number: "AY-20240101-0002" };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: insertedOrder, error: null }),
            }),
          }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
      };
    });

    mockGetServiceClient.mockReturnValue({ from: mockFrom } as never);

    const { POST } = await import("../orders/route");

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({
        customer_name: "Jane Doe",
        customer_phone: "0712345678",
        delivery_address: "123 Main St",
        delivery_city: "Nairobi",
        delivery_type: "delivery",
        payment_method: "mpesa",
        items: [{ product_id: "prod-1", quantity: 1 }],
      }),
    });

    await POST(req);

    expect(mockCreateNotification).not.toHaveBeenCalled();
  });
});

// ─── M-Pesa Callback — payment_completed / payment_failed notifications ───────

describe("POST /api/payments/mpesa/callback — notification side effects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  function makeCallbackBody(resultCode: number, checkoutRequestId = "ws_CO_123") {
    return {
      Body: {
        stkCallback: {
          MerchantRequestID: "merchant-req-1",
          CheckoutRequestID: checkoutRequestId,
          ResultCode: resultCode,
          ResultDesc:
            resultCode === 0
              ? "The service request is processed successfully."
              : "Request cancelled by user",
          CallbackMetadata:
            resultCode === 0
              ? {
                  Item: [
                    { Name: "Amount", Value: 1200 },
                    { Name: "MpesaReceiptNumber", Value: "QKA12345XY" },
                    { Name: "TransactionDate", Value: 20240101120000 },
                    { Name: "PhoneNumber", Value: 254712345678 },
                  ],
                }
              : undefined,
        },
      },
    };
  }

  it("emits payment_completed notification when ResultCode = 0", async () => {
    const order = { id: "order-uuid-3", order_number: "AY-20240101-0003" };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: order, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockGetServiceClient.mockReturnValue({ from: mockFrom } as never);
    mockCreateNotification.mockResolvedValue(undefined);

    const { POST } = await import("../payments/mpesa/callback/route");

    const req = new Request("http://localhost/api/payments/mpesa/callback", {
      method: "POST",
      body: JSON.stringify(makeCallbackBody(0)),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockCreateNotification).toHaveBeenCalledWith(
      "payment_completed",
      "Payment Received for #AY-20240101-0003",
      "M-Pesa payment confirmed. Receipt: QKA12345XY",
      "order-uuid-3"
    );
  });

  it("emits payment_failed notification when ResultCode != 0", async () => {
    const order = { id: "order-uuid-4", order_number: "AY-20240101-0004" };

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: order, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockGetServiceClient.mockReturnValue({ from: mockFrom } as never);
    mockCreateNotification.mockResolvedValue(undefined);

    const { POST } = await import("../payments/mpesa/callback/route");

    const req = new Request("http://localhost/api/payments/mpesa/callback", {
      method: "POST",
      body: JSON.stringify(makeCallbackBody(1032)),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockCreateNotification).toHaveBeenCalledWith(
      "payment_failed",
      "Payment Failed for #AY-20240101-0004",
      "M-Pesa payment failed. Code: 1032 - Request cancelled by user",
      "order-uuid-4"
    );
  });

  it("does NOT emit notification when order is not found", async () => {
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockGetServiceClient.mockReturnValue({ from: mockFrom } as never);

    const { POST } = await import("../payments/mpesa/callback/route");

    const req = new Request("http://localhost/api/payments/mpesa/callback", {
      method: "POST",
      body: JSON.stringify(makeCallbackBody(0, "unknown-checkout-id")),
    });

    await POST(req);

    expect(mockCreateNotification).not.toHaveBeenCalled();
  });
});
