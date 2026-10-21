from flask import Blueprint, jsonify, request

from app.supabase_client import get_supabase

bp = Blueprint("products", __name__, url_prefix="/api/products")

SORT_MAP = {
    "price_asc": ("price", False),
    "price_desc": ("price", True),
    "name_asc": ("name", False),
    "name_desc": ("name", True),
    "newest": ("created_at", True),
}


@bp.get("")
def list_products():
    sb = get_supabase()
    query = sb.table("products").select("*, categories(id, name, slug)")

    if request.args.get("admin") != "1":
        query = query.eq("is_active", True)

    category = request.args.get("category")
    if category:
        cat = (
            sb.table("categories")
            .select("id")
            .eq("slug", category)
            .maybe_single()
            .execute()
        )
        if cat.data:
            query = query.eq("category_id", cat.data["id"])
        else:
            return jsonify({"data": []})

    search = (request.args.get("q") or "").strip()
    combo = request.args.get("combo")
    if combo == "1":
        query = query.eq("is_combo", True)

    min_price = request.args.get("min_price")
    max_price = request.args.get("max_price")
    if min_price:
        query = query.gte("price", float(min_price))
    if max_price:
        query = query.lte("price", float(max_price))

    sort = request.args.get("sort", "newest")
    col, desc = SORT_MAP.get(sort, ("created_at", True))
    query = query.order(col, desc=desc)

    result = query.execute()
    data = result.data or []

    if search:
        s = search.lower()
        data = [
            p
            for p in data
            if s in (p.get("name") or "").lower()
            or s in (p.get("description") or "").lower()
        ]

    return jsonify({"data": data})


@bp.get("/<slug>")
def get_product(slug: str):
    sb = get_supabase()
    result = (
        sb.table("products")
        .select("*, categories(id, name, slug)")
        .eq("slug", slug)
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )
    if not result.data:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"data": result.data})
