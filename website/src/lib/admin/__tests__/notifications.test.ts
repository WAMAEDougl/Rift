import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// Mock the supabase module before importing the module under test
vi.mock("../supabase", () => ({
  getAdminClient: vi.fn(),
}));

import { createNotification } from "../notifications";
import { getAdminClient } from "../supabase";
import type { NotificationType } from "../notifications";

const allTypes: NotificationType[] = [
  "new_order",
  "payment_completed",
  "payment_failed",
  "order_cancelled",
];

function makeFakeClient(insertMock: ReturnType<typeof vi.fn>) {
  return {
    from: vi.fn().mockReturnValue({
      insert: insertMock,
    }),
  };
}

describe("createNotification — unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls insert with correct type, title, message, and order_id when orderId is provided", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(getAdminClient).mockReturnValue(makeFakeClient(insertMock) as never);

    await createNotification(
      "new_order",
      "New Order #1234",
      "A new order has been placed.",
      "order-uuid-123"
    );

    expect(insertMock).toHaveBeenCalledWith({
      type: "new_order",
      title: "New Order #1234",
      message: "A new order has been placed.",
      order_id: "order-uuid-123",
    });
  });

  it("calls insert with order_id: null when orderId is omitted", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(getAdminClient).mockReturnValue(makeFakeClient(insertMock) as never);

    await createNotification(
      "payment_failed",
      "Payment Failed",
      "Payment could not be processed."
    );

    expect(insertMock).toHaveBeenCalledWith({
      type: "payment_failed",
      title: "Payment Failed",
      message: "Payment could not be processed.",
      order_id: null,
    });
  });

  // Feature: admin-api, Property 13: Notification Round Trip
  it("Property 13: inserted row matches all passed arguments", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allTypes),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.option(fc.uuid(), { nil: undefined }),
        (type, title, message, orderId) => {
          const insertMock = vi.fn().mockResolvedValue({ error: null });
          vi.mocked(getAdminClient).mockReturnValue(
            makeFakeClient(insertMock) as never
          );

          // Fire and forget — we only care about what was passed to insert
          createNotification(type, title, message, orderId);

          expect(insertMock).toHaveBeenCalledWith({
            type,
            title,
            message,
            order_id: orderId ?? null,
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
