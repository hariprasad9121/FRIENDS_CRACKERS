from flask import Blueprint, g, jsonify, request

from app.auth import require_auth
from app.services.orders import create_order, list_orders_for_user

bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@bp.get("")
@require_auth
def my_orders():
    orders = list_orders_for_user(g.user_id)
    return jsonify({"data": orders})


@bp.post("")
@require_auth
def place_order():
    body = request.get_json(silent=True) or {}
    items = body.get("items") or []
    shipping = {
        "shipping_name": (body.get("shipping_name") or "").strip(),
        "shipping_phone": (body.get("shipping_phone") or "").strip(),
        "shipping_address": (body.get("shipping_address") or "").strip(),
        "shipping_city": (body.get("shipping_city") or "").strip(),
        "shipping_pincode": (body.get("shipping_pincode") or "").strip(),
    }
    notes = (body.get("notes") or "").strip() or None

    missing = [k for k, v in shipping.items() if not v]
    if missing:
        return jsonify({"error": "Missing shipping fields", "fields": missing}), 400

    order, errors = create_order(g.user_id, items, shipping, notes)
    if errors:
        return jsonify({"error": "Order validation failed", "details": errors}), 400

    return jsonify({"data": order}), 201


@bp.get("/<order_id>")
@require_auth
def get_order(order_id: str):
    from app.supabase_client import get_supabase

    sb = get_supabase()
    order = (
        sb.table("orders")
        .select("*")
        .eq("id", order_id)
        .eq("user_id", g.user_id)
        .maybe_single()
        .execute()
    )
    if not order.data:
        return jsonify({"error": "Order not found"}), 404
    items = (
        sb.table("order_items").select("*").eq("order_id", order_id).execute()
    )
    order.data["items"] = items.data or []
    return jsonify({"data": order.data})
