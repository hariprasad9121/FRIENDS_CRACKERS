"use client";

import Link from "next/link";
import { ShoppingCart, Sparkles, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/products?combo=1", label: "Combos" },
  { href: "/account", label: "Dashboard" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50 border-b border-gold/20 bg-navy/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-gold">
          <Sparkles className="h-7 w-7 text-orange" aria-hidden />
          <div>
            <span className="block text-lg font-bold leading-tight text-white">
              Friends Crackers
            </span>
            <span className="hidden text-[10px] uppercase tracking-widest text-gold/80 sm:block">
              Celebrate Together. Shine Brighter.
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/90 transition hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gold/90 transition hover:text-gold"
          >
            Login
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/account"
            className="rounded-full p-2 text-white/90 transition hover:bg-white/10 hover:text-gold"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-white/90 transition hover:bg-white/10 hover:text-gold"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-full p-2 text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 text-white/90"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/auth/login" className="block py-2 text-gold" onClick={() => setOpen(false)}>
            Login / Register
          </Link>
        </nav>
      )}
    </header>
  );
}
