import Link from "next/link";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductCatalogLive } from "@/components/products/ProductCatalogLive";
import { getCategories, getOffers, getProducts } from "@/lib/catalog";

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let featured: Awaited<ReturnType<typeof getProducts>> = [];
  let offers: Awaited<ReturnType<typeof getOffers>> = [];

  try {
    [categories, featured, offers] = await Promise.all([
      getCategories(),
      getProducts({ sort: "newest" }),
      getOffers(),
    ]);
  } catch {
    /* API unavailable during static build preview */
  }

  const showcase = featured.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 md:px-6 md:py-12">
      <HeroBanner />

      {offers.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/15 to-orange/10 p-5"
            >
              <h2 className="text-lg font-bold text-navy">{offer.title}</h2>
              {offer.description && (
                <p className="mt-1 text-sm text-navy/70">{offer.description}</p>
              )}
              {offer.code && (
                <p className="mt-2 text-sm font-semibold text-orange">
                  Code: {offer.code}
                  {offer.discount_percent ? ` · ${offer.discount_percent}% off` : ""}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy">Shop by category</h2>
            <p className="text-sm text-navy/60">Curated collections for every mood</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-orange hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="rounded-2xl border border-gold/15 bg-white p-5 shadow-sm transition hover:border-gold/40"
            >
              <h3 className="font-semibold text-navy">{cat.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-navy/60">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-navy">Featured products</h2>
          <Link href="/products" className="text-sm font-semibold text-orange hover:underline">
            Browse shop
          </Link>
        </div>
        {showcase.length > 0 ? (
          <ProductCatalogLive products={showcase} />
        ) : (
          <p className="rounded-xl border border-dashed border-navy/20 p-6 text-sm text-navy/60">
            Connect the API and Supabase to load products. See README for setup.
          </p>
        )}
      </section>
    </div>
  );
}
