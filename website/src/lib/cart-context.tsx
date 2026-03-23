"use client";

import { createContext, useContext, useState, useCallback, useSyncExternalStore, type ReactNode } from "react";
import type { Product } from "./products";
import { getItem, setItem, STORAGE_KEYS } from "./utils/storage";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [items, setItems] = useState<CartItem[]>(() =>
    isClient ? (getItem<CartItem[]>(STORAGE_KEYS.CART) ?? []) : []
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  const persistItems = useCallback((updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setItems((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setItem(STORAGE_KEYS.CART, next);
      return next;
    });
  }, []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    persistItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  }, [persistItems]);

  const removeItem = useCallback((productId: string) => {
    persistItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, [persistItems]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      persistItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    persistItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [persistItems]);

  const clearCart = useCallback(() => {
    persistItems([]);
    setIsCartOpen(false);
  }, [persistItems]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, clearCart,
        totalItems, totalPrice, isCartOpen, setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
