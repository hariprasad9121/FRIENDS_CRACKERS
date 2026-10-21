"use client";

import { adminFetch } from "@/lib/api";
import type { Category, Offer, Order, Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export async function getAdminToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function adminDashboard(token: string) {
  return adminFetch<{ data: Record<string, unknown> }>("/api/admin/dashboard", token);
}

export async function adminProducts(token: string) {
  return adminFetch<{ data: Product[] }>("/api/admin/products", token);
}

export async function adminSaveProduct(
  token: string,
  payload: Partial<Product> & { name: string; slug: string; price: number; stock: number },
  id?: string
) {
  if (id) {
    return adminFetch<{ data: Product }>(`/api/admin/products/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  return adminFetch<{ data: Product }>("/api/admin/products", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteProduct(token: string, id: string) {
  return adminFetch(`/api/admin/products/${id}`, token, { method: "DELETE" });
}

export async function adminCategories(token: string) {
  return adminFetch<{ data: Category[] }>("/api/admin/categories", token);
}

export async function adminSaveCategory(
  token: string,
  payload: Partial<Category> & { name: string; slug: string },
  id?: string
) {
  if (id) {
    return adminFetch<{ data: Category }>(`/api/admin/categories/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  return adminFetch<{ data: Category }>("/api/admin/categories", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminOrders(token: string) {
  return adminFetch<{ data: Order[] }>("/api/admin/orders", token);
}

export async function adminUpdateOrderStatus(token: string, id: string, status: string) {
  return adminFetch<{ data: Order }>(`/api/admin/orders/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function adminCustomers(token: string) {
  return adminFetch<{ data: Record<string, unknown>[] }>("/api/admin/customers", token);
}

export async function adminOffers(token: string) {
  return adminFetch<{ data: Offer[] }>("/api/admin/offers", token);
}

export async function adminRestockProduct(
  token: string,
  productId: string,
  quantity: number,
  notes?: string
) {
  return adminFetch<{ data: { stock: number; product: Product } }>(
    `/api/admin/products/${productId}/restock`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ quantity, notes }),
    }
  );
}

export type StockMovement = {
  id: string;
  product_id: string;
  movement_type: string;
  quantity_delta: number;
  quantity_before: number;
  quantity_after: number;
  notes?: string | null;
  created_at: string;
  products?: { id: string; name: string; slug: string } | null;
};

export async function adminStockMovements(token: string, productId?: string) {
  const qs = productId ? `?product_id=${productId}` : "";
  return adminFetch<{ data: StockMovement[] }>(
    `/api/admin/stock-movements${qs}`,
    token
  );
}

export async function adminSaveOffer(
  token: string,
  payload: Partial<Offer> & { title: string },
  id?: string
) {
  if (id) {
    return adminFetch<{ data: Offer }>(`/api/admin/offers/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
  return adminFetch<{ data: Offer }>("/api/admin/offers", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
