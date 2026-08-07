"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product, ProductOption } from "@/lib/types";

const STORAGE_KEY = "ncomputing.cart.v1";
const GST_RATE = 0.18;

/**
 * A line in the cart.
 *
 * The price fields here are a *display snapshot* only. What gets sent to the
 * API is the product id, quantity and option ids — the server prices the order
 * from its own database, so tampering with localStorage achieves nothing.
 */
export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  imageEmoji: string;
  quantity: number;
  optionIds: string[];
  optionLabels: { group: string; label: string }[];
  unitPriceInPaise: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (product: Product, options: ProductOption[], quantity: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  itemCount: number;
  subtotalInPaise: number;
  taxInPaise: number;
  totalInPaise: number;
};

const CartContext = createContext<CartContextValue | null>(null);

// Same product with the same configuration should stack rather than appear
// twice, so the identity of a line is product + sorted options.
const lineKey = (productId: string, optionIds: string[]) =>
  [productId, ...[...optionIds].sort()].join("|");

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

  const add = useCallback((product: Product, options: ProductOption[], quantity: number) => {
    const optionIds = options.map((option) => option.id);
    const key = lineKey(product.id, optionIds);
    const unitPriceInPaise =
      product.priceInPaise + options.reduce((sum, option) => sum + option.priceDeltaInPaise, 0);

    setLines((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) {
        return current.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + quantity } : line
        );
      }

      return [
        ...current,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageEmoji: product.imageEmoji,
          quantity,
          optionIds,
          optionLabels: options.map((option) => ({ group: option.group, label: option.label })),
          unitPriceInPaise,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      quantity < 1
        ? current.filter((line) => line.key !== key)
        : current.map((line) => (line.key === key ? { ...line, quantity } : line))
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(() => {
    const subtotalInPaise = lines.reduce(
      (sum, line) => sum + line.unitPriceInPaise * line.quantity,
      0
    );
    const taxInPaise = Math.round(subtotalInPaise * GST_RATE);
    return {
      subtotalInPaise,
      taxInPaise,
      totalInPaise: subtotalInPaise + taxInPaise,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    };
  }, [lines]);

  const value = useMemo(
    () => ({ lines, add, updateQuantity, remove, clear, ...totals }),
    [lines, add, updateQuantity, remove, clear, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
