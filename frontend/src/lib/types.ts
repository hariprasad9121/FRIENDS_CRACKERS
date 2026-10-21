export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  discount_percent: number;
  stock: number;
  image_url?: string | null;
  is_combo: boolean;
  is_active?: boolean;
  category_id?: string | null;
  categories?: Category | null;
};

export type Offer = {
  id: string;
  title: string;
  description?: string | null;
  discount_percent?: number | null;
  code?: string | null;
  active: boolean;
};

export type OrderItem = {
  id?: string;
  product_id?: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  status: string;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_pincode: string;
  notes?: string | null;
  created_at: string;
  items?: OrderItem[];
};

export type Profile = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role: "customer" | "admin";
};

export type CartItem = {
  product_id: string;
  slug: string;
  name: string;
  image_url?: string | null;
  price: number;
  discount_percent: number;
  quantity: number;
  stock: number;
};
