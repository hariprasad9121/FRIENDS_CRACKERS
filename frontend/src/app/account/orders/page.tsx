"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMyOrders } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function OrdersPage() {
  const params = useSearchParams();
  const placed = params.get("placed");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      try {
        const list = await fetchMyOrders(token);
        setOrders(list);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [placed]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <p className="px-4 py-12 text-center text-navy/60">Loading orders...</p>;
  }

  if (!signedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-navy/70">Sign in to view your order history.</p>
        <Link href="/auth/login" className="mt-4 inline-block text-orange hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-navy">My orders</h1>
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-navy/60 hover:text-orange"
        >
          Sign out
        </button>
      </div>

      {placed && (
        <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">
          Order placed successfully. Thank you for shopping with Friends Crackers!
        </p>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-gold/15 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-navy/50">Order</p>
                <p className="font-mono text-sm text-navy">{order.id.slice(0, 8)}…</p>
              </div>
              <span className="rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold capitalize text-navy">
                {order.status}
              </span>
              <p className="font-bold text-orange">{formatCurrency(order.total_amount)}</p>
            </div>
            <p className="mt-2 text-sm text-navy/60">
              {new Date(order.created_at).toLocaleString()} · {order.shipping_city}
            </p>
            <ul className="mt-3 space-y-1 border-t border-navy/5 pt-3 text-sm">
              {(order.items || []).map((item) => (
                <li key={item.id || item.product_name} className="flex justify-between">
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.line_total)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
        {orders.length === 0 && (
          <p className="text-navy/60">No orders yet. Start with our festive combos!</p>
        )}
      </div>
    </div>
  );
}
