"use client";

import { cn } from "@/lib/utils";

export function StockStatus({
  stock,
  className,
}: {
  stock: number;
  className?: string;
}) {
  if (stock <= 0) {
    return (
      <span className={cn("text-xs font-semibold uppercase text-red-600", className)}>
        Out of stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className={cn("text-xs font-medium text-orange", className)}>
        Only {stock} left — order soon
      </span>
    );
  }
  return (
    <span className={cn("text-xs text-navy/60", className)}>
      {stock} in stock
    </span>
  );
}
