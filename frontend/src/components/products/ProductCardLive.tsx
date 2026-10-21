"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { StockStatus } from "@/components/inventory/StockStatus";
import { useInventory, useLiveStock } from "@/components/inventory/InventoryProvider";
import type { Product } from "@/lib/types";
import { effectivePrice, formatCurrency } from "@/lib/utils";

export function ProductCardLive({ product }: { product: Product }) {
  const { seedStock } = useInventory();
  const stock = useLiveStock(product.id, product.stock);
  const sale = effectivePrice(product.price, product.discount_percent);

  useEffect(() => {
    seedStock({ [product.id]: product.stock });
  }, [product.id, product.stock, seedStock]);

  return (
    <article className="group overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-navy/5">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-navy/40">
              No image
            </div>
          )}
          {stock <= 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-navy/50 text-sm font-bold uppercase tracking-wide text-white">
              Out of stock
            </span>
          )}
          {product.discount_percent > 0 && stock > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-orange px-2 py-0.5 text-xs font-bold text-white">
              -{product.discount_percent}%
            </span>
          )}
          {product.is_combo && (
            <span className="absolute right-3 top-3 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">
              Combo
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 font-semibold text-navy">{product.name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-orange">{formatCurrency(sale)}</span>
            {product.discount_percent > 0 && (
              <span className="text-sm text-navy/40 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <div className="mt-1">
            <StockStatus stock={stock} />
          </div>
        </div>
      </Link>
    </article>
  );
}
