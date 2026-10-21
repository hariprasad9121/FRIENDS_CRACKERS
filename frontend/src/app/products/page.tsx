import { Suspense } from "react";
import { ProductCatalogLive } from "@/components/products/ProductCatalogLive";
import { ProductFilters } from "@/components/products/ProductFilters";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata = { title: "Shop" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && v) query[k] = v;
  }

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let products: Awaited<ReturnType<typeof getProducts>> = [];

  try {
    [categories, products] = await Promise.all([
      getCategories(),
      getProducts(query),
    ]);
  } catch {
    /* handled in UI */
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">Shop crackers & combos</h1>
        <p className="mt-1 text-navy/60">Search, filter, and sort our festive collection</p>
      </div>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-white" />}>
        <ProductFilters categories={categories} />
      </Suspense>

      <div className="mt-8">
        <ProductCatalogLive products={products} />
      </div>

      {products.length === 0 && (
        <p className="mt-8 text-center text-navy/60">No products match your filters.</p>
      )}
    </div>
  );
}
