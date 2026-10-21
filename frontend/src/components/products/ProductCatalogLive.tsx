"use client";

import { useEffect } from "react";
import { ProductCardLive } from "@/components/products/ProductCardLive";
import { useInventory } from "@/components/inventory/InventoryProvider";
import type { Product } from "@/lib/types";

export function ProductCatalogLive({ products }: { products: Product[] }) {
  const { seedStock } = useInventory();

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const p of products) map[p.id] = p.stock;
    seedStock(map);
  }, [products, seedStock]);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCardLive key={p.id} product={p} />
      ))}
    </div>
  );
}
