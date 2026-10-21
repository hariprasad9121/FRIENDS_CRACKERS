"use client";

import { useEffect, useState } from "react";
import { adminDashboard, getAdminToken } from "@/lib/admin-api";
import { formatCurrency } from "@/lib/utils";

type Dashboard = {
  product_count: number;
  order_count: number;
  customer_count: number;
  low_stock: { id: string; name: string; stock: number }[];
  recent_orders: {
    id: string;
    status: string;
    total_amount: number;
    shipping_name: string;
    created_at: string;
  }[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    getAdminToken()
      .then((t) => adminDashboard(t))
      .then((res) => setData(res.data as Dashboard))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return <p className="text-navy/60">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Products", value: data.product_count },
          { label: "Orders", value: data.order_count },
          { label: "Customers", value: data.customer_count },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gold/10">
            <p className="text-sm text-navy/60">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-navy">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gold/10">
          <h2 className="font-semibold text-navy">Low stock</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.low_stock.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span className="font-semibold text-orange">{p.stock} left</span>
              </li>
            ))}
            {data.low_stock.length === 0 && (
              <li className="text-navy/50">All products well stocked.</li>
            )}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gold/10">
          <h2 className="font-semibold text-navy">Recent orders</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.recent_orders.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span>
                  {o.shipping_name} · <span className="capitalize">{o.status}</span>
                </span>
                <span className="font-medium">{formatCurrency(o.total_amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
