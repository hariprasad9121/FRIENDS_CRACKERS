import { Suspense } from "react";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p className="px-4 py-12 text-center">Loading...</p>}>{children}</Suspense>;
}
