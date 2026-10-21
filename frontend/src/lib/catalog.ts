import {
  fetchCategories,
  fetchOffers,
  fetchProductBySlug,
  fetchProducts,
} from "@/lib/api";
import { getSupabaseEnv } from "@/lib/supabase/config";
import {
  fetchCategoriesFromSupabase,
  fetchOffersFromSupabase,
  fetchProductBySlugFromSupabase,
  fetchProductsFromSupabase,
} from "@/lib/supabase/catalog";
import type { Category, Offer, Product } from "@/lib/types";

async function withSupabaseFallback<T>(
  apiFn: () => Promise<T>,
  supabaseFn: () => Promise<T>
): Promise<T> {
  const { isConfigured } = getSupabaseEnv();
  try {
    return await apiFn();
  } catch {
    if (!isConfigured) throw new Error("API unavailable and Supabase is not configured");
    return supabaseFn();
  }
}

export function getCategories(): Promise<Category[]> {
  return withSupabaseFallback(fetchCategories, fetchCategoriesFromSupabase);
}

export function getProducts(params?: Record<string, string>): Promise<Product[]> {
  return withSupabaseFallback(
    () => fetchProducts(params),
    () => fetchProductsFromSupabase(params)
  );
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return withSupabaseFallback(
    () => fetchProductBySlug(slug),
    () => fetchProductBySlugFromSupabase(slug)
  );
}

export function getOffers(): Promise<Offer[]> {
  return withSupabaseFallback(fetchOffers, fetchOffersFromSupabase);
}
