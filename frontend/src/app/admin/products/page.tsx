"use client";

import { useEffect, useState } from "react";
import {
  adminCategories,
  adminDeleteProduct,
  adminProducts,
  adminSaveProduct,
  getAdminToken,
} from "@/lib/admin-api";
import { AdminProductStockCell } from "@/components/admin/AdminProductStockCell";
import { useInventory } from "@/components/inventory/InventoryProvider";
import type { Category, Product } from "@/lib/types";

const empty: Partial<Product> & { name: string; slug: string; price: number; stock: number } = {
  name: "",
  slug: "",
  price: 0,
  stock: 0,
  discount_percent: 0,
  description: "",
  image_url: "",
  is_combo: false,
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { seedStock } = useInventory();

  async function reload() {
    const token = await getAdminToken();
    const [p, c] = await Promise.all([adminProducts(token), adminCategories(token)]);
    setProducts(p.data);
    setCategories(c.data);
    const map: Record<string, number> = {};
    for (const prod of p.data) map[prod.id] = prod.stock;
    seedStock(map);
  }

  useEffect(() => {
    reload().catch(() => undefined);
  }, [seedStock]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const token = await getAdminToken();
      await adminSaveProduct(token, form, editId || undefined);
      setForm(empty);
      setEditId(null);
      await reload();
      setMsg("Product saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Products</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
        <input
          placeholder="Name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          placeholder="Slug"
          required
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Price"
          required
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Stock"
          required
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Discount %"
          value={form.discount_percent || 0}
          onChange={(e) => setForm((f) => ({ ...f, discount_percent: Number(e.target.value) }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={form.category_id || ""}
          onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value || undefined }))}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Image URL"
          value={form.image_url || ""}
          onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
        />
        <textarea
          placeholder="Description"
          value={form.description || ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.is_combo}
            onChange={(e) => setForm((f) => ({ ...f, is_combo: e.target.checked }))}
          />
          Combo pack
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active !== false}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          />
          Active
        </label>
        <button type="submit" className="rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white md:col-span-2">
          {editId ? "Update product" : "Add product"}
        </button>
        {msg && <p className="text-sm text-navy/70 md:col-span-2">{msg}</p>}
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-navy/5 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">
                  <AdminProductStockCell productId={p.id} initialStock={p.stock} />
                </td>
                <td className="p-3 space-x-2">
                  <button
                    type="button"
                    className="text-orange hover:underline"
                    onClick={() => {
                      setEditId(p.id);
                      setForm({
                        name: p.name,
                        slug: p.slug,
                        price: p.price,
                        stock: p.stock,
                        discount_percent: p.discount_percent,
                        description: p.description || "",
                        image_url: p.image_url || "",
                        category_id: p.category_id || undefined,
                        is_combo: p.is_combo,
                        is_active: p.is_active,
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={async () => {
                      const token = await getAdminToken();
                      await adminDeleteProduct(token, p.id);
                      await reload();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
