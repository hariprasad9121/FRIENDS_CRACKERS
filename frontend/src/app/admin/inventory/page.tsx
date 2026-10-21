"use client";

import { useEffect, useState } from "react";
import {
  adminProducts,
  adminRestockProduct,
  adminStockMovements,
  getAdminToken,
  type StockMovement,
} from "@/lib/admin-api";
import { useInventory, useLiveStock } from "@/components/inventory/InventoryProvider";
import type { Product } from "@/lib/types";

function ProductStockRow({
  product,
  onRestocked,
}: {
  product: Product;
  onRestocked: () => void;
}) {
  const stock = useLiveStock(product.id, product.stock);
  const [qty, setQty] = useState(10);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function restock() {
    setMsg(null);
    try {
      const token = await getAdminToken();
      await adminRestockProduct(token, product.id, qty, notes || undefined);
      setMsg(`Restocked +${qty}. Live stock updates for all customers.`);
      onRestocked();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Restock failed");
    }
  }

  return (
    <tr className="border-t align-top">
      <td className="p-3">
        <p className="font-medium text-navy">{product.name}</p>
        <p className="text-xs text-navy/50">{product.slug}</p>
      </td>
      <td className="p-3">
        <span
          className={`font-bold ${stock <= 0 ? "text-red-600" : stock <= 5 ? "text-orange" : "text-navy"}`}
        >
          {stock}
        </span>
        {stock <= 0 && (
          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
            Out of stock
          </span>
        )}
      </td>
      <td className="p-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-navy/60">
            Add qty
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="mt-0.5 block w-20 rounded border px-2 py-1 text-sm"
            />
          </label>
          <input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-w-[8rem] flex-1 rounded border px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={restock}
            className="rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-navy hover:bg-gold/90"
          >
            Restock
          </button>
        </div>
        {msg && <p className="mt-1 text-xs text-navy/70">{msg}</p>}
      </td>
    </tr>
  );
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const { seedStock } = useInventory();

  async function reload() {
    const token = await getAdminToken();
    const [p, m] = await Promise.all([
      adminProducts(token),
      adminStockMovements(token),
    ]);
    setProducts(p.data);
    setMovements(m.data);
    const map: Record<string, number> = {};
    for (const prod of p.data) map[prod.id] = prod.stock;
    seedStock(map);
  }

  useEffect(() => {
    reload().catch(() => undefined);
  }, [seedStock]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Inventory management</h1>
        <p className="mt-1 text-sm text-navy/60">
          Stock lives in Supabase and is shared by every customer. Restock here or when creating
          products — counts update in real time on the shop and customer dashboard.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-navy/5 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Live stock</th>
              <th className="p-3">Restock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductStockRow key={p.id} product={p} onRestocked={reload} />
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-navy">Stock movement history</h2>
        <p className="text-sm text-navy/60">Sales, restocks, and adjustments (latest 200).</p>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-navy/5 text-left">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">Product</th>
                <th className="p-3">Type</th>
                <th className="p-3">Δ</th>
                <th className="p-3">Before → After</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3 whitespace-nowrap text-navy/70">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">{m.products?.name ?? m.product_id.slice(0, 8)}</td>
                  <td className="p-3 capitalize">{m.movement_type}</td>
                  <td
                    className={`p-3 font-medium ${m.quantity_delta < 0 ? "text-red-600" : "text-green-700"}`}
                  >
                    {m.quantity_delta > 0 ? "+" : ""}
                    {m.quantity_delta}
                  </td>
                  <td className="p-3">
                    {m.quantity_before} → {m.quantity_after}
                  </td>
                  <td className="p-3 text-navy/60">{m.notes ?? "—"}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-navy/50">
                    No movements yet. Run the inventory migration and place orders or restock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
