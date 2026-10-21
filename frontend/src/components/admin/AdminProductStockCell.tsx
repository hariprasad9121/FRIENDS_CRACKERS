"use client";

import Link from "next/link";
import { useLiveStock } from "@/components/inventory/InventoryProvider";

export function AdminProductStockCell({
  productId,
  initialStock,
}: {
  productId: string;
  initialStock: number;
}) {
  const stock = useLiveStock(productId, initialStock);

  return (
    <span className="inline-flex items-center gap-2">
      <span className={stock <= 0 ? "font-bold text-red-600" : "font-medium"}>{stock}</span>
      {stock <= 0 && (
        <span className="rounded bg-red-100 px-1 text-[10px] text-red-700">Out</span>
      )}
      <Link href="/admin/inventory" className="text-xs text-orange hover:underline">
        Restock
      </Link>
    </span>
  );
}
