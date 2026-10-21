"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/offers", label: "Offers" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function guard() {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const access = sessionData.session?.access_token;
      if (!access) {
        router.replace("/auth/login?next=/admin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionData.session!.user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      setToken(access);
      setReady(true);
    }
    guard();
  }, [router]);

  if (!ready) {
    return <p className="px-4 py-12 text-center text-navy/60">Verifying admin access...</p>;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr] md:px-6">
      <aside className="h-fit rounded-2xl bg-navy p-4 text-white">
        <p className="text-sm font-semibold text-gold">Admin</p>
        <p className="text-xs text-white/60">Friends Crackers</p>
        <nav className="mt-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                pathname === l.href ? "bg-orange text-white" : "hover:bg-white/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {!token && null}
      </aside>
      <div>{children}</div>
    </div>
  );
}
