"use client";

import { useEffect, useState } from "react";
import { adminOffers, adminSaveOffer, getAdminToken } from "@/lib/admin-api";
import type { Offer } from "@/lib/types";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    code: "",
    discount_percent: 0,
    active: true,
  });

  async function reload() {
    const token = await getAdminToken();
    const res = await adminOffers(token);
    setOffers(res.data);
  }

  useEffect(() => {
    reload().catch(() => undefined);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = await getAdminToken();
    await adminSaveOffer(token, form);
    setForm({ title: "", description: "", code: "", discount_percent: 0, active: true });
    await reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Offers</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-2">
        <input
          placeholder="Title"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          placeholder="Promo code"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Discount %"
          value={form.discount_percent}
          onChange={(e) => setForm((f) => ({ ...f, discount_percent: Number(e.target.value) }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
        />
        <button type="submit" className="rounded-full bg-orange py-2 text-sm font-semibold text-white md:col-span-2">
          Add offer
        </button>
      </form>
      <ul className="divide-y rounded-2xl bg-white shadow-sm">
        {offers.map((o) => (
          <li key={o.id} className="p-4 text-sm">
            <p className="font-semibold text-navy">{o.title}</p>
            <p className="text-navy/60">{o.description}</p>
            {o.code && <p className="text-orange">Code: {o.code}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
