"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { useCartStore } from "@/store/cart";

type StockMap = Record<string, number>;

type InventoryContextValue = {
  stockByProductId: StockMap;
  seedStock: (entries: StockMap) => void;
  getStock: (productId: string, fallback?: number) => number;
  refreshProductStock: (productId: string) => Promise<number | null>;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [stockByProductId, setStockByProductId] = useState<StockMap>({});
  const syncCartStock = useCartStore((s) => s.syncStockFromServer);

  const seedStock = useCallback((entries: StockMap) => {
    setStockByProductId((prev) => ({ ...prev, ...entries }));
  }, []);

  const getStock = useCallback(
    (productId: string, fallback = 0) =>
      stockByProductId[productId] ?? fallback,
    [stockByProductId]
  );

  const refreshProductStock = useCallback(async (productId: string) => {
    const { isConfigured } = getSupabaseEnv();
    if (!isConfigured) return null;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .maybeSingle();
    if (error || !data) return null;
    setStockByProductId((prev) => ({ ...prev, [productId]: data.stock }));
    return data.stock as number;
  }, []);

  useEffect(() => {
    syncCartStock(stockByProductId);
  }, [stockByProductId, syncCartStock]);

  useEffect(() => {
    const { isConfigured } = getSupabaseEnv();
    if (!isConfigured) return;

    const supabase = createClient();
    const channel = supabase
      .channel("public:products-stock")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          const row = payload.new as { id?: string; stock?: number };
          if (!row?.id || typeof row.stock !== "number") return;
          setStockByProductId((prev) => ({ ...prev, [row.id!]: row.stock! }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value = useMemo(
    () => ({ stockByProductId, seedStock, getStock, refreshProductStock }),
    [stockByProductId, seedStock, getStock, refreshProductStock]
  );

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return ctx;
}

export function useLiveStock(productId: string, initialStock: number) {
  const { getStock, seedStock } = useInventory();

  useEffect(() => {
    seedStock({ [productId]: initialStock });
  }, [productId, initialStock, seedStock]);

  return getStock(productId, initialStock);
}
