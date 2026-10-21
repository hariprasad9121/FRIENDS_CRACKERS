"use client";

import { useEffect, useState } from "react";
import { adminCategories, adminSaveCategory, getAdminToken } from "@/lib/admin-api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [editId, setEditId] = useState<string | null>(null);

  async function reload() {
    const token = await getAdminToken();
    const res = await adminCategories(token);
    setItems(res.data);
  }

  useEffect(() => {
    reload().catch(() => undefined);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = await getAdminToken();
    await adminSaveCategory(token, form, editId || undefined);
    setForm({ name: "", slug: "", description: "" });
    setEditId(null);
    await reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Categories</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-3">
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
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-orange py-2 text-sm font-semibold text-white md:col-span-3">
          {editId ? "Update category" : "Add category"}
        </button>
      </form>
      <ul className="divide-y rounded-2xl bg-white shadow-sm">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium text-navy">{c.name}</p>
              <p className="text-navy/50">{c.slug}</p>
            </div>
            <button
              type="button"
              className="text-orange hover:underline"
              onClick={() => {
                setEditId(c.id);
                setForm({
                  name: c.name,
                  slug: c.slug,
                  description: c.description || "",
                });
              }}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
