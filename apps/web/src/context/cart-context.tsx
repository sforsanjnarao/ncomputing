"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/types";
import { track } from "@/lib/track";

const STORAGE_KEY = "ncomputing.cart.v1";

/**
 * A line in the cart.
 *
 * The price field here is a *display snapshot* only. What gets sent to the
 * API is the product id and quantity — the server prices the order from its
 * own database, so tampering with localStorage achieves nothing.
 */
export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  type: Product["type"];
  quantity: number;
  unitAmount: number;
  seats?: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (product: Product, quantity: number, seats?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  itemCount: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLines(JSON.parse(stored) as CartLine[]);
    } catch {
      // Corrupt or unavailable storage just means an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback(
    (product: Product, quantity: number, seats?: number) => {
      track("ADD_TO_CART", { productSlug: product.slug });
      setLines((current) => {
        const existing = current.find((line) => line.productId === product.id);
        if (existing) {
          return current.map((line) =>
            line.productId === product.id
              ? { ...line, quantity: line.quantity + quantity, seats }
              : line,
          );
        }

        return [
          ...current,
          {
            key: product.id,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            type: product.type,
            quantity,
            unitAmount: product.amount,
            seats,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      quantity < 1
        ? current.filter((line) => line.key !== key)
        : current.map((line) =>
            line.key === key ? { ...line, quantity } : line,
          ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(
    () => ({
      totalAmount: lines.reduce(
        (sum, line) => sum + line.unitAmount * line.quantity,
        0,
      ),
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    }),
    [lines],
  );

  const value = useMemo(
    () => ({ lines, add, updateQuantity, remove, clear, ...totals }),
    [lines, add, updateQuantity, remove, clear, totals],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
