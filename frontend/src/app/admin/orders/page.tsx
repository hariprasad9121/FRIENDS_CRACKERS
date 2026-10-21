"use client";

import { useEffect, useState } from "react";
import { adminOrders, adminUpdateOrderStatus, getAdminToken } from "@/lib/admin-api";
import type { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function reload() {
    const token = await getAdminToken();
    const res = await adminOrders(token);
    setOrders(res.data);
  }

  useEffect(() => {
    reload().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Orders</h1>
      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-navy">{order.shipping_name}</p>
              <p className="text-xs text-navy/50">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <p className="font-bold text-orange">{formatCurrency(order.total_amount)}</p>
            <select
              value={order.status}
              onChange={async (e) => {
                const token = await getAdminToken();
                await adminUpdateOrderStatus(token, order.id, e.target.value);
                await reload();
              }}
              className="rounded-lg border px-2 py-1 text-sm capitalize"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <ul className="mt-2 text-sm text-navy/70">
            {(order.items || []).map((i) => (
              <li key={i.id || i.product_name}>
                {i.product_name} × {i.quantity}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
