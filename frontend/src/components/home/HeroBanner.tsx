import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-[#1a3358] to-navy px-6 py-14 text-white md:px-12 md:py-20">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
          Celebrate Together. Shine Brighter.
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
          Premium festive crackers for every celebration
        </h1>
        <p className="mt-4 text-base text-white/80 md:text-lg">
          Sparklers, combos, rockets, and family packs — curated quality with transparent pricing
          and fast checkout.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange/30 transition hover:bg-orange/90"
          >
            Shop now
          </Link>
          <Link
            href="/products?combo=1"
            className="rounded-full border border-gold/50 px-6 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
          >
            View combo packs
          </Link>
        </div>
      </div>
    </section>
  );
}
