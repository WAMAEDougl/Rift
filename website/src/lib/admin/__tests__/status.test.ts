import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
  isValidStatusTransition,
  ORDER_STATUS_SEQUENCE,
  TERMINAL_STATUSES,
} from "../status";
import type { OrderStatus } from "../types";

const allStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "dispatched",
  "delivered",
  "cancelled",
];

describe("status transition logic — property tests", () => {
  // Feature: admin-api, Property 8: Forward-Only Status Transitions
  it("Property 8: transition valid iff S not terminal AND (N = 'cancelled' OR index(N) > index(S))", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allStatuses),
        fc.constantFrom(...allStatuses),
        (current, next) => {
          const result = isValidStatusTransition(current, next);
          const isTerminal = TERMINAL_STATUSES.includes(current);
          const isCancelNext = next === "cancelled";
          const isForward =
            ORDER_STATUS_SEQUENCE.indexOf(next) >
            ORDER_STATUS_SEQUENCE.indexOf(current);

          const expected = !isTerminal && (isCancelNext || isForward);
          return result === expected;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: admin-api, Property 9: Terminal Orders Cannot Be Updated
  it("Property 9: any transition from 'delivered' or 'cancelled' returns false", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allStatuses), (next) => {
        return (
          isValidStatusTransition("delivered", next) === false &&
          isValidStatusTransition("cancelled", next) === false
        );
      }),
      { numRuns: 100 }
    );
  });
});
