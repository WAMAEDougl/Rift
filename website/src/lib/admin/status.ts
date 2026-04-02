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
 *   - 'cancelled' is allowed from any non-terminal state.
 *   - All other transitions must be strictly forward in the sequence.
 */
export function isValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  if (TERMINAL_STATUSES.includes(current)) return false;
  if (next === "cancelled") return true;
  return (
    ORDER_STATUS_SEQUENCE.indexOf(next) > ORDER_STATUS_SEQUENCE.indexOf(current)
  );
}
