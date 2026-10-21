"use client";

import { ShoppingCart } from "lucide-react";
import { useLiveStock } from "@/components/inventory/InventoryProvider";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart";

export function AddToCartButton({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const stock = useLiveStock(product.id, product.stock);
  const disabled = stock <= 0;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => addItem({ ...product, stock }, 1)}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      {disabled ? "Out of stock" : "Add to cart"}
    </button>
  );
}
