from flask import Blueprint, g, jsonify, request

from app.auth import require_admin
from app.supabase_client import get_supabase

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@bp.get("/dashboard")
@require_admin
def dashboard():
    sb = get_supabase()
    products = sb.table("products").select("id", count="exact").execute()
    orders = sb.table("orders").select("id", count="exact").execute()
    customers = (
        sb.table("profiles")
        .select("id", count="exact")
        .eq("role", "customer")
        .execute()
    )
    low_stock = (
        sb.table("products")
        .select("id, name, stock")
        .lte("stock", 10)
        .order("stock")
        .limit(10)
        .execute()
    )
    recent_orders = (
        sb.table("orders")
        .select("id, status, total_amount, created_at, shipping_name")
        .order("created_at", desc=True)
        .limit(8)
        .execute()
    )
    return jsonify(
        {
            "data": {
                "product_count": products.count or 0,
                "order_count": orders.count or 0,
                "customer_count": customers.count or 0,
                "low_stock": low_stock.data or [],
                "recent_orders": recent_orders.data or [],
            }
        }
    )


@bp.get("/products")
@require_admin
def admin_list_products():
    sb = get_supabase()
    result = (
        sb.table("products")
        .select("*, categories(id, name, slug)")
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify({"data": result.data or []})


@bp.post("/products")
@require_admin
def admin_create_product():
    body = request.get_json(silent=True) or {}
    required = ["name", "slug", "price", "stock"]
    if any(not body.get(f) for f in required):
        return jsonify({"error": "Missing required fields", "fields": required}), 400

    row = {
        "name": body["name"].strip(),
        "slug": body["slug"].strip(),
        "description": body.get("description"),
        "price": float(body["price"]),
        "discount_percent": float(body.get("discount_percent") or 0),
        "stock": int(body["stock"]),
        "category_id": body.get("category_id"),
        "image_url": body.get("image_url"),
        "is_combo": bool(body.get("is_combo")),
        "is_active": bool(body.get("is_active", True)),
    }
    sb = get_supabase()
    result = sb.table("products").insert(row).execute()
    product = (result.data or [None])[0]
    if product and int(row["stock"]) > 0:
        sb.table("stock_movements").insert(
            {
                "product_id": product["id"],
                "movement_type": "initial",
                "quantity_delta": int(row["stock"]),
                "quantity_before": 0,
                "quantity_after": int(row["stock"]),
                "user_id": g.user_id,
                "notes": "Initial stock on product create",
            }
        ).execute()
    return jsonify({"data": product}), 201


@bp.patch("/products/<product_id>")
@require_admin
def admin_update_product(product_id: str):
    body = request.get_json(silent=True) or {}
    allowed = {
        "name",
        "slug",
        "description",
        "price",
        "discount_percent",
        "stock",
        "category_id",
        "image_url",
        "is_combo",
        "is_active",
    }
    updates = {k: body[k] for k in allowed if k in body}
    if not updates:
        return jsonify({"error": "No fields to update"}), 400

    sb = get_supabase()
    existing = (
        sb.table("products").select("stock").eq("id", product_id).maybe_single().execute()
    )
    if not existing.data:
        return jsonify({"error": "Product not found"}), 404

    old_stock = int(existing.data["stock"])
    result = sb.table("products").update(updates).eq("id", product_id).execute()
    if not result.data:
        return jsonify({"error": "Product not found"}), 404

    if "stock" in updates:
        new_stock = int(updates["stock"])
        delta = new_stock - old_stock
        if delta != 0:
            sb.table("stock_movements").insert(
                {
                    "product_id": product_id,
                    "movement_type": "adjustment",
                    "quantity_delta": delta,
                    "quantity_before": old_stock,
                    "quantity_after": new_stock,
                    "user_id": g.user_id,
                    "notes": "Manual stock adjustment",
                }
            ).execute()

    return jsonify({"data": result.data[0]})


@bp.delete("/products/<product_id>")
@require_admin
def admin_delete_product(product_id: str):
    sb = get_supabase()
    sb.table("products").delete().eq("id", product_id).execute()
    return jsonify({"ok": True})


@bp.get("/categories")
@require_admin
def admin_categories():
    sb = get_supabase()
    result = sb.table("categories").select("*").order("sort_order").execute()
    return jsonify({"data": result.data or []})


@bp.post("/categories")
@require_admin
def admin_create_category():
    body = request.get_json(silent=True) or {}
    if not body.get("name") or not body.get("slug"):
        return jsonify({"error": "name and slug required"}), 400
    row = {
        "name": body["name"].strip(),
        "slug": body["slug"].strip(),
        "description": body.get("description"),
        "image_url": body.get("image_url"),
        "sort_order": int(body.get("sort_order") or 0),
    }
    sb = get_supabase()
    result = sb.table("categories").insert(row).execute()
    return jsonify({"data": (result.data or [None])[0]}), 201


@bp.patch("/categories/<category_id>")
@require_admin
def admin_update_category(category_id: str):
    body = request.get_json(silent=True) or {}
    allowed = {"name", "slug", "description", "image_url", "sort_order"}
    updates = {k: body[k] for k in allowed if k in body}
    if not updates:
        return jsonify({"error": "No fields to update"}), 400
    sb = get_supabase()
    result = (
        sb.table("categories").update(updates).eq("id", category_id).execute()
    )
    if not result.data:
        return jsonify({"error": "Category not found"}), 404
    return jsonify({"data": result.data[0]})


@bp.delete("/categories/<category_id>")
@require_admin
def admin_delete_category(category_id: str):
    sb = get_supabase()
    sb.table("categories").delete().eq("id", category_id).execute()
    return jsonify({"ok": True})


@bp.get("/orders")
@require_admin
def admin_orders():
    sb = get_supabase()
    status = request.args.get("status")
    q = sb.table("orders").select("*").order("created_at", desc=True)
    if status:
        q = q.eq("status", status)
    orders = q.execute().data or []
    for order in orders:
        items = (
            sb.table("order_items")
            .select("*")
            .eq("order_id", order["id"])
            .execute()
        )
        order["items"] = items.data or []
    return jsonify({"data": orders})


@bp.patch("/orders/<order_id>")
@require_admin
def admin_update_order(order_id: str):
    body = request.get_json(silent=True) or {}
    status = body.get("status")
    allowed = {"pending", "confirmed", "processing", "shipped", "delivered", "cancelled"}
    if status not in allowed:
        return jsonify({"error": "Invalid status"}), 400
    sb = get_supabase()
    result = (
        sb.table("orders").update({"status": status}).eq("id", order_id).execute()
    )
    if not result.data:
        return jsonify({"error": "Order not found"}), 404
    return jsonify({"data": result.data[0]})


@bp.get("/customers")
@require_admin
def admin_customers():
    sb = get_supabase()
    result = (
        sb.table("profiles")
        .select("id, full_name, phone, role, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify({"data": result.data or []})


@bp.get("/offers")
@require_admin
def admin_offers():
    sb = get_supabase()
    result = sb.table("offers").select("*").order("created_at", desc=True).execute()
    return jsonify({"data": result.data or []})


@bp.post("/offers")
@require_admin
def admin_create_offer():
    body = request.get_json(silent=True) or {}
    if not body.get("title"):
        return jsonify({"error": "title required"}), 400
    row = {
        "title": body["title"].strip(),
        "description": body.get("description"),
        "discount_percent": body.get("discount_percent"),
        "code": body.get("code"),
        "active": bool(body.get("active", True)),
        "starts_at": body.get("starts_at"),
        "ends_at": body.get("ends_at"),
    }
    sb = get_supabase()
    result = sb.table("offers").insert(row).execute()
    return jsonify({"data": (result.data or [None])[0]}), 201


@bp.patch("/offers/<offer_id>")
@require_admin
def admin_update_offer(offer_id: str):
    body = request.get_json(silent=True) or {}
    allowed = {
        "title",
        "description",
        "discount_percent",
        "code",
        "active",
        "starts_at",
        "ends_at",
    }
    updates = {k: body[k] for k in allowed if k in body}
    if not updates:
        return jsonify({"error": "No fields to update"}), 400
    sb = get_supabase()
    result = sb.table("offers").update(updates).eq("id", offer_id).execute()
    if not result.data:
        return jsonify({"error": "Offer not found"}), 404
    return jsonify({"data": result.data[0]})


@bp.post("/products/<product_id>/restock")
@require_admin
def admin_restock_product(product_id: str):
    body = request.get_json(silent=True) or {}
    quantity = body.get("quantity")
    notes = (body.get("notes") or "").strip() or None

    if not isinstance(quantity, int) or quantity <= 0:
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return jsonify({"error": "quantity must be a positive integer"}), 400
        if quantity <= 0:
            return jsonify({"error": "quantity must be a positive integer"}), 400

    sb = get_supabase()
    result = sb.rpc(
        "restock_product",
        {
            "p_product_id": product_id,
            "p_quantity": quantity,
            "p_admin_id": g.user_id,
            "p_notes": notes,
        },
    ).execute()

    data = result.data
    if isinstance(data, list):
        data = data[0] if data else {}
    if not data or not data.get("ok"):
        return jsonify({"error": (data or {}).get("error", "Restock failed")}), 400

    product = (
        sb.table("products").select("*").eq("id", product_id).maybe_single().execute()
    )
    return jsonify({"data": {"stock": data.get("stock"), "product": product.data}})


@bp.get("/stock-movements")
@require_admin
def admin_stock_movements():
    sb = get_supabase()
    product_id = request.args.get("product_id")
    q = (
        sb.table("stock_movements")
        .select("*, products(id, name, slug)")
        .order("created_at", desc=True)
        .limit(200)
    )
    if product_id:
        q = q.eq("product_id", product_id)
    result = q.execute()
    return jsonify({"data": result.data or []})
