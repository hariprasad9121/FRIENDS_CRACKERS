import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { InventoryProvider } from "@/components/inventory/InventoryProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { ConnectionBanner } from "@/components/setup/ConnectionBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Friends Crackers",
    template: "%s | Friends Crackers",
  },
  description:
    "Celebrate Together. Shine Brighter. Premium festive crackers, combos, and family celebration packs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <InventoryProvider>
          <SupabaseProvider>
            <ConnectionBanner />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </SupabaseProvider>
        </InventoryProvider>
      </body>
    </html>
  );
}
