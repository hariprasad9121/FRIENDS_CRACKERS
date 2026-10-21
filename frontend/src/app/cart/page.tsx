"use client";

import Image from "next/image";
import Link from "next/link";
import { StockStatus } from "@/components/inventory/StockStatus";
import { useInventory } from "@/components/inventory/InventoryProvider";
import { useCartStore } from "@/store/cart";
import { effectivePrice, formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const { getStock } = useInventory();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold text-navy">Your cart</h1>
      <p className="mt-1 text-sm text-navy/60">
        Stock updates live from the shared warehouse — quantities adjust automatically.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy/20 bg-white p-8 text-center">
          <p className="text-navy/60">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-orange px-5 py-2 text-sm font-semibold text-white"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => {
            const stock = getStock(item.product_id, item.stock);
            const unit = effectivePrice(item.price, item.discount_percent);
            const maxQty = Math.max(0, stock);
            return (
              <div
                key={item.product_id}
                className="flex gap-4 rounded-2xl border border-gold/15 bg-white p-4"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-navy/5">
                  {item.image_url && (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-semibold text-navy hover:text-orange"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-navy/60">{formatCurrency(unit)} each</p>
                    <StockStatus stock={stock} />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={maxQty || 1}
                      value={Math.min(item.quantity, maxQty || item.quantity)}
                      disabled={maxQty <= 0}
                      onChange={(e) =>
                        setQuantity(item.product_id, Number(e.target.value))
                      }
                      className="w-16 rounded-lg border border-navy/15 px-2 py-1 text-sm"
                    />
                    <span className="min-w-[5rem] text-right font-semibold text-navy">
                      {formatCurrency(unit * Math.min(item.quantity, maxQty))}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl bg-navy p-5 text-white">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span className="text-gold">{formatCurrency(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-4 block rounded-full bg-orange py-3 text-center text-sm font-semibold text-white hover:bg-orange/90"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
