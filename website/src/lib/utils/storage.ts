// Shared localStorage utilities — single implementation, used everywhere

export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

// Storage keys — centralized to avoid key collisions
export const STORAGE_KEYS = {
  CART: "ayola-cart",
  CUSTOMER: "ayola-customer",
} as const;
