import type { Category, Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function fetchCategoriesFromSupabase(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductsFromSupabase(
  params?: Record<string, string>
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("is_active", true);

  if (params?.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .maybeSingle();
    if (cat?.id) query = query.eq("category_id", cat.id);
    else return [];
  }

  if (params?.combo === "1") {
    query = query.eq("is_combo", true);
  }

  const sort = params?.sort ?? "newest";
  const sortMap: Record<string, { col: string; asc: boolean }> = {
    price_asc: { col: "price", asc: true },
    price_desc: { col: "price", asc: false },
    name_asc: { col: "name", asc: true },
    name_desc: { col: "name", asc: false },
    newest: { col: "created_at", asc: false },
  };
  const { col, asc } = sortMap[sort] ?? sortMap.newest;
  query = query.order(col, { ascending: asc });

  const { data, error } = await query;
  if (error) throw error;

  let list = (data ?? []) as Product[];

  const q = (params?.q ?? "").trim().toLowerCase();
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }

  return list;
}

export async function fetchProductBySlugFromSupabase(
  slug: string
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchOffersFromSupabase() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
