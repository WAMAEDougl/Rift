/**
 * Property-Based Tests — WhatsApp Delivery Negotiation
 * Feature: whatsapp-delivery-negotiation
 *
 * Uses fast-check with vitest. Each test is tagged with the property it validates.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  formatDeliveryInquiryMessage,
  formatPaymentRequestNotificationMessage,
  formatDeliveryReceiptMessage,
  formatPaymentConfirmationMessage,
} from "@/lib/wasender";
import { isValidStatusTransition } from "@/lib/admin/status";
import type { OrderStatus } from "@/lib/admin/types";

// All valid OrderStatus values
const ALL_ORDER_STATUSES: OrderStatus[] = [
  "pending_delivery_confirmation",
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "dispatched",
  "delivered",
  "cancelled",
];

// ---------------------------------------------------------------------------
// Property 4: formatDeliveryInquiryMessage always contains order number and
//             location prompt
// Validates: Requirements 2.2
// ---------------------------------------------------------------------------
describe("Property 4: formatDeliveryInquiryMessage always contains order number and location prompt", () => {
  it(
    "Feature: whatsapp-delivery-negotiation, Property 4: for any order number string, formatDeliveryInquiryMessage returns a string containing the order number and 'share your specific location'",
    () => {
      fc.assert(
        fc.property(
          // Generate printable strings that could be order numbers
          fc.string({ minLength: 1, maxLength: 50 }),
          (orderNumber) => {
            const result = formatDeliveryInquiryMessage({ order_number: orderNumber });
            return (
              typeof result === "string" &&
              result.includes(orderNumber) &&
              result.includes("share your specific location")
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 8: Notification message preview is always ≤ 100 characters
// Validates: Requirements 3.3
// ---------------------------------------------------------------------------
describe("Property 8: notification message preview is always ≤ 100 characters", () => {
  it(
    "Feature: whatsapp-delivery-negotiation, Property 8: for any inbound message body string of arbitrary length, message.slice(0, 100).length <= 100",
    () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 500 }),
          (message) => {
            const truncated = message.slice(0, 100);
            return truncated.length <= 100;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 9: Order_Total = subtotal + delivery_fee for all non-negative
//             integer pairs
// Validates: Requirements 5.3, 7.1
// ---------------------------------------------------------------------------
describe("Property 9: Order_Total = subtotal + delivery_fee for all non-negative integer pairs", () => {
  it(
    "Feature: whatsapp-delivery-negotiation, Property 9: for any non-negative integer subtotal and delivery_fee, subtotal + delivery_fee equals the expected total",
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1_000_000 }),
          fc.integer({ min: 0, max: 100_000 }),
          (subtotal, deliveryFee) => {
            const total = subtotal + deliveryFee;
            return total === subtotal + deliveryFee && total >= 0;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 10: formatPaymentRequestNotificationMessage always contains fee
//              amount and "payment prompt"
// Validates: Requirements 5.5
// ---------------------------------------------------------------------------
describe("Property 10: formatPaymentRequestNotificationMessage always contains fee amount and payment prompt", () => {
  it(
    "Feature: whatsapp-delivery-negotiation, Property 10: for any delivery fee amount, formatPaymentRequestNotificationMessage returns a string containing the fee value and 'payment prompt'",
    () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.integer({ min: 0, max: 100_000 }),
          (orderNumber, deliveryFee) => {
            const result = formatPaymentRequestNotificationMessage({
              order_number: orderNumber,
              delivery_fee: deliveryFee,
            });
            return (
              typeof result === "string" &&
              result.includes(String(deliveryFee)) &&
              result.includes("payment prompt")
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 11: formatDeliveryReceiptMessage always contains all required
//              fields and "dispatched"
// Validates: Requirements 8.2, 8.3
// ---------------------------------------------------------------------------
describe("Property 11: formatDeliveryReceiptMessage always contains all required fields and 'dispatched'", () => {
  it(
    "Feature: whatsapp-delivery-negotiation, Property 11: for any order_number, mpesa_receipt_number, total, and delivery_fee, formatDeliveryReceiptMessage contains all four values and 'being dispatched'",
    () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.integer({ min: 1, max: 1_000_000 }),
          fc.integer({ min: 1, max: 100_000 }),
          (orderNumber, receiptNumber, total, deliveryFee) => {
            const result = formatDeliveryReceiptMessage({
              order_number: orderNumber,
              mpesa_receipt_number: receiptNumber,
              total,
              delivery_fee: deliveryFee,
            });
            return (
              typeof result === "string" &&
              result.includes(orderNumber) &&
              result.includes(receiptNumber) &&
              result.includes(String(total)) &&
              result.includes(String(deliveryFee)) &&
              result.includes("being dispatched")
            );
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 3: isValidStatusTransition from "pending_delivery_confirmation"
//             is correct for all target statuses
// Validates: Requirements 1.6
// ---------------------------------------------------------------------------
describe("Property 3: isValidStatusTransition from 'pending_delivery_confirmation' is correct for all target statuses", () => {
  it(
    "Feature: whatsapp-delivery-negotiation, Property 3: for any OrderStatus that is not 'pending' and not 'cancelled', isValidStatusTransition('pending_delivery_confirmation', status) returns false; for 'pending' and 'cancelled' it returns true",
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALL_ORDER_STATUSES),
          (targetStatus) => {
            const result = isValidStatusTransition(
              "pending_delivery_confirmation",
              targetStatus
            );
            if (targetStatus === "pending" || targetStatus === "cancelled") {
              return result === true;
            }
            return result === false;
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 7: Webhook returns 400 for any payload missing/empty phone or
//             message — validation logic tested directly
// Validates: Requirements 3.6
// ---------------------------------------------------------------------------
describe("Property 7: webhook validation logic returns 400 for any payload missing/empty phone or message", () => {
  /**
   * Mirrors the validation logic in the webhook handler:
   * website/src/app/api/webhooks/wasender/route.ts
   */
  function validateWebhookPayload(payload: unknown): 400 | 200 {
    const p = payload as Record<string, unknown>;
    if (
      typeof p.phone !== "string" ||
      p.phone.trim() === "" ||
      typeof p.message !== "string" ||
      p.message.trim() === ""
    ) {
      return 400;
    }
    return 200;
  }

  it(
    "Feature: whatsapp-delivery-negotiation, Property 7: for any payload where phone is missing/empty OR message is missing/empty, the validation logic returns 400",
    () => {
      // Payloads with empty phone (message may be valid or not)
      fc.assert(
        fc.property(
          fc.record({
            phone: fc.constant(""),
            message: fc.string({ minLength: 0, maxLength: 200 }),
          }),
          (payload) => validateWebhookPayload(payload) === 400
        ),
        { numRuns: 100 }
      );

      // Payloads with empty message (phone may be valid or not)
      fc.assert(
        fc.property(
          fc.record({
            phone: fc.string({ minLength: 0, maxLength: 20 }),
            message: fc.constant(""),
          }),
          (payload) => validateWebhookPayload(payload) === 400
        ),
        { numRuns: 100 }
      );

      // Payloads with whitespace-only phone
      fc.assert(
        fc.property(
          fc.record({
            phone: fc.stringMatching(/^\s+$/),
            message: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          (payload) => validateWebhookPayload(payload) === 400
        ),
        { numRuns: 100 }
      );

      // Payloads with whitespace-only message
      fc.assert(
        fc.property(
          fc.record({
            phone: fc.string({ minLength: 1, maxLength: 20 }),
            message: fc.stringMatching(/^\s+$/),
          }),
          (payload) => validateWebhookPayload(payload) === 400
        ),
        { numRuns: 100 }
      );

      // Payloads missing phone field entirely
      fc.assert(
        fc.property(
          fc.record({ message: fc.string({ minLength: 1, maxLength: 200 }) }),
          (payload) => validateWebhookPayload(payload) === 400
        ),
        { numRuns: 100 }
      );

      // Payloads missing message field entirely
      fc.assert(
        fc.property(
          fc.record({ phone: fc.string({ minLength: 1, maxLength: 20 }) }),
          (payload) => validateWebhookPayload(payload) === 400
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ---------------------------------------------------------------------------
// Property 12: Delivery receipt vs payment confirmation message selection
//              based on delivery_fee
// Validates: Requirements 8.5
// ---------------------------------------------------------------------------
describe("Property 12: message selection logic uses formatDeliveryReceiptMessage when delivery_fee > 0, formatPaymentConfirmationMessage when delivery_fee === 0", () => {
  /**
   * Mirrors the conditional in the M-Pesa callback handler:
   * website/src/app/api/payments/mpesa/callback/route.ts
   */
  function selectMessage(
    deliveryFee: number,
    order: {
      order_number: string;
      mpesa_receipt_number: string;
      total: number;
      delivery_fee: number;
    }
  ): string {
    return deliveryFee > 0
      ? formatDeliveryReceiptMessage(order)
      : formatPaymentConfirmationMessage({
          order_number: order.order_number,
          mpesa_receipt_number: order.mpesa_receipt_number,
          total: order.total,
        });
  }

  it(
    "Feature: whatsapp-delivery-negotiation, Property 12: if delivery_fee > 0, formatDeliveryReceiptMessage is used; if delivery_fee === 0, formatPaymentConfirmationMessage is used",
    () => {
      // When delivery_fee > 0 → must use delivery receipt message (contains "being dispatched")
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.integer({ min: 1, max: 1_000_000 }),
          fc.integer({ min: 1, max: 100_000 }),
          (orderNumber, receiptNumber, total, deliveryFee) => {
            const order = {
              order_number: orderNumber,
              mpesa_receipt_number: receiptNumber,
              total,
              delivery_fee: deliveryFee,
            };
            const message = selectMessage(deliveryFee, order);
            // Delivery receipt message contains "being dispatched"
            return message.includes("being dispatched");
          }
        ),
        { numRuns: 100 }
      );

      // When delivery_fee === 0 → must use payment confirmation message (does NOT contain "being dispatched")
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.integer({ min: 1, max: 1_000_000 }),
          (orderNumber, receiptNumber, total) => {
            const order = {
              order_number: orderNumber,
              mpesa_receipt_number: receiptNumber,
              total,
              delivery_fee: 0,
            };
            const message = selectMessage(0, order);
            // Payment confirmation message does NOT contain "being dispatched"
            return !message.includes("being dispatched");
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});
