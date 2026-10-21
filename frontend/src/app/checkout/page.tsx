"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInventory } from "@/components/inventory/InventoryProvider";
import { StockStatus } from "@/components/inventory/StockStatus";
import { createOrder } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);
  const { getStock, refreshProductStock } = useInventory();

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_pincode: "",
    notes: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      router.push("/auth/login?next=/checkout");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      for (const item of items) {
        const latest = (await refreshProductStock(item.product_id)) ?? getStock(item.product_id, item.stock);
        if (latest < item.quantity) {
          throw new Error(
            latest <= 0
              ? `${item.name} is out of stock.`
              : `Only ${latest} units of ${item.name} available.`
          );
        }
      }

      const order = await createOrder(token, {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        ...form,
      });
      clear();
      router.push(`/account/orders?placed=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-navy/60">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block text-orange hover:underline">
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2 md:px-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gold/15 bg-white p-6">
        <h1 className="text-2xl font-bold text-navy">Checkout</h1>
        {!token && (
          <p className="rounded-lg bg-gold/10 p-3 text-sm text-navy">
            Please{" "}
            <Link href="/auth/login?next=/checkout" className="font-semibold text-orange">
              sign in
            </Link>{" "}
            to place your order.
          </p>
        )}
        {(["shipping_name", "shipping_phone", "shipping_address", "shipping_city", "shipping_pincode"] as const).map(
          (field) => (
            <label key={field} className="block text-sm">
              <span className="capitalize text-navy/70">
                {field.replace("shipping_", "").replace("_", " ")}
              </span>
              <input
                required
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2"
              />
            </label>
          )
        )}
        <label className="block text-sm">
          <span className="text-navy/70">Order notes (offer code, delivery notes)</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-navy/15 px-3 py-2"
            rows={3}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded-full bg-orange py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Placing order..." : "Place order"}
        </button>
      </form>

      <div className="h-fit rounded-2xl bg-navy p-6 text-white">
        <h2 className="text-lg font-semibold text-gold">Order summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => {
            const stock = getStock(i.product_id, i.stock);
            return (
              <li key={i.product_id} className="space-y-0.5">
                <div className="flex justify-between gap-4">
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                </div>
                <StockStatus stock={stock} className="text-white/70" />
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="text-gold">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-3 text-xs text-white/60">
          Prices are validated server-side at checkout for accuracy and stock availability.
        </p>
      </div>
    </div>
  );
}
