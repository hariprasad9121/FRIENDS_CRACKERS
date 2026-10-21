import Link from "next/link";
import { ProductCatalogLive } from "@/components/products/ProductCatalogLive";
import { getProducts } from "@/lib/catalog";

export const metadata = { title: "My dashboard" };

export default async function AccountDashboardPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = await getProducts({ sort: "newest" });
  } catch {
    /* Supabase/API not ready */
  }

  const demo = products.filter((p) => p.slug === "demo-shared-stock-pack");
  const showcase = products.length > 0 ? products : demo;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="rounded-3xl bg-navy p-8 text-white md:p-10">
        <p className="text-sm uppercase tracking-widest text-gold">Customer dashboard</p>
        <h1 className="mt-2 text-3xl font-bold">Welcome to Friends Crackers</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Browse live inventory shared with every customer. Stock counts update in real time when
          anyone places an order or when the owner restocks.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-orange px-5 py-2 text-sm font-semibold text-white"
          >
            Shop all
          </Link>
          <Link
            href="/account/orders"
            className="rounded-full border border-gold/40 px-5 py-2 text-sm font-semibold text-gold"
          >
            My orders
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold"
          >
            Cart
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy">Sample products — live stock</h2>
        <p className="mt-1 text-sm text-navy/60">
          Every card shows shared Supabase inventory. Try{" "}
          <strong>Demo Shared Stock Pack</strong> (10 units): when one customer buys 2, everyone
          immediately sees 8 left.
        </p>
        <div className="mt-6">
          {showcase.length > 0 ? (
            <ProductCatalogLive products={showcase} />
          ) : (
            <p className="text-navy/60">Run Supabase migrations and seed to load products.</p>
          )}
        </div>
      </section>
    </div>
  );
}
