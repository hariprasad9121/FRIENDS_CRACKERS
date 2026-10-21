import type { Category, Offer, Order, Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApiList<T> = { data: T[] };
type ApiOne<T> = { data: T };

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      body.error ||
      body.details?.join?.(", ") ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export async function fetchCategories(): Promise<Category[]> {
  const json = await apiFetch<ApiList<Category>>("/api/categories");
  return json.data;
}

export async function fetchProducts(params?: Record<string, string>): Promise<Product[]> {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  const json = await apiFetch<ApiList<Product>>(`/api/products${qs}`);
  return json.data;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const json = await apiFetch<ApiOne<Product>>(`/api/products/${slug}`);
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchOffers(): Promise<Offer[]> {
  const json = await apiFetch<ApiList<Offer>>("/api/offers");
  return json.data;
}

export async function fetchMyOrders(token: string): Promise<Order[]> {
  const json = await apiFetch<ApiList<Order>>("/api/orders", {}, token);
  return json.data;
}

export async function createOrder(
  token: string,
  payload: {
    items: { product_id: string; quantity: number }[];
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_pincode: string;
    notes?: string;
  }
): Promise<Order> {
  const json = await apiFetch<ApiOne<Order>>(
    "/api/orders",
    { method: "POST", body: JSON.stringify(payload) },
    token
  );
  return json.data;
}

export async function adminFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return apiFetch<T>(path, options, token);
}
