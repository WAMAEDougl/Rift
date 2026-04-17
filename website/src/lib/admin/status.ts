import {
  OrderStatus,
  ORDER_STATUS_SEQUENCE,
  TERMINAL_STATUSES,
} from "./types";

export { ORDER_STATUS_SEQUENCE, TERMINAL_STATUSES };

/**
 * Returns true if the transition from `current` to `next` is valid.
 * Rules:
 *   - Terminal states cannot be updated.
 *   - 'pending_delivery_confirmation' is a non-terminal holding state that can
 *     only transition to 'pending' (fee agreed) or 'cancelled' (order abandoned).
 *   - 'cancelled' is allowed from any other non-terminal state.
 *   - All other transitions must be strictly forward in the sequence.
 */
export function isValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  if (TERMINAL_STATUSES.includes(current)) return false;

  // Holding state: only allow transition to pending or cancelled
  if (current === "pending_delivery_confirmation") {
    return next === "pending" || next === "cancelled";
  }

  if (next === "cancelled") return true;
  return (
    ORDER_STATUS_SEQUENCE.indexOf(next) > ORDER_STATUS_SEQUENCE.indexOf(current)
  );
}
