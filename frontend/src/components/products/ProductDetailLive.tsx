"use client";

import { AddToCartButton } from "@/components/products/AddToCartButton";
import { StockStatus } from "@/components/inventory/StockStatus";
import { useLiveStock } from "@/components/inventory/InventoryProvider";
import type { Product } from "@/lib/types";
import { effectivePrice, formatCurrency } from "@/lib/utils";

export function ProductDetailLive({ product }: { product: Product }) {
  const stock = useLiveStock(product.id, product.stock);
  const liveProduct = { ...product, stock };
  const sale = effectivePrice(product.price, product.discount_percent);

  return (
    <div>
      {product.categories && (
        <p className="text-sm font-medium uppercase tracking-wide text-gold">
          {product.categories.name}
        </p>
      )}
      <h1 className="mt-2 text-3xl font-bold text-navy">{product.name}</h1>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-orange">{formatCurrency(sale)}</span>
        {product.discount_percent > 0 && (
          <>
            <span className="text-lg text-navy/40 line-through">
              {formatCurrency(product.price)}
            </span>
            <span className="rounded-full bg-orange/10 px-2 py-0.5 text-sm font-semibold text-orange">
              Save {product.discount_percent}%
            </span>
          </>
        )}
      </div>
      <p className="mt-4 leading-relaxed text-navy/70">{product.description}</p>
      <div className="mt-3">
        <StockStatus stock={stock} className="text-sm" />
      </div>
      <div className="mt-6">
        <AddToCartButton product={liveProduct} className="px-8 py-3" />
      </div>
    </div>
  );
}
