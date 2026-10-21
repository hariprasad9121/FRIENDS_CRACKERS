import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gold/20 bg-navy text-white/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="font-semibold text-gold">Friends Crackers</h3>
          <p className="mt-2 text-sm leading-relaxed">
            Premium festive crackers for families and communities. Celebrate together and shine
            brighter with curated combos and safe, joyful selections.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Quick links</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/products" className="hover:text-gold">
                All products
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-gold">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-gold">
                My account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Safety note</h4>
          <p className="mt-2 text-sm">
            Always follow local regulations and adult supervision guidelines when using fireworks.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Friends Crackers. All rights reserved.
      </div>
    </footer>
  );
}
