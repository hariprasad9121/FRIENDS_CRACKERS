"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name A–Z" },
];

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/products?${next.toString()}`);
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-gold/15 bg-white p-4 md:grid-cols-4">
      <input
        type="search"
        placeholder="Search products..."
        defaultValue={params.get("q") || ""}
        className="rounded-xl border border-navy/10 px-3 py-2 text-sm md:col-span-2"
        onKeyDown={(e) => {
          if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
        }}
      />
      <select
        className="rounded-xl border border-navy/10 px-3 py-2 text-sm"
        value={params.get("category") || ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        className="rounded-xl border border-navy/10 px-3 py-2 text-sm"
        value={params.get("sort") || "newest"}
        onChange={(e) => update("sort", e.target.value)}
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
