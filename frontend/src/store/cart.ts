"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/lib/types";
import { effectivePrice } from "@/lib/utils";

type CartState = {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  syncStockFromServer: (stockMap: Record<string, number>) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

function toCartItem(product: Product, quantity: number): CartItem {
  return {
    product_id: product.id,
    slug: product.slug,
    name: product.name,
    image_url: product.image_url,
    price: product.price,
    discount_percent: product.discount_percent,
    quantity,
    stock: product.stock,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product_id === product.id);
          const nextQty = Math.min(
            (existing?.quantity || 0) + qty,
            product.stock
          );
          if (nextQty <= 0) return state;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === product.id ? { ...i, quantity: nextQty, stock: product.stock } : i
              ),
            };
          }
          return { items: [...state.items, toCartItem(product, nextQty)] };
        });
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.product_id === productId
                ? { ...i, quantity: Math.min(Math.max(1, quantity), i.stock) }
                : i
            )
            .filter((i) => i.quantity > 0 && i.stock > 0),
        })),
      syncStockFromServer: (stockMap) =>
        set((state) => ({
          items: state.items
            .map((i) => {
              const latest = stockMap[i.product_id];
              if (typeof latest !== "number") return i;
              const quantity = Math.min(i.quantity, latest);
              return { ...i, stock: latest, quantity };
            })
            .filter((i) => i.stock > 0 && i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () =>
        get().items.reduce(
          (s, i) => s + effectivePrice(i.price, i.discount_percent) * i.quantity,
          0
        ),
    }),
    { name: "friends-crackers-cart" }
  )
);
