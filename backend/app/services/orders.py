from typing import Any

from app.supabase_client import get_supabase


def create_order(
    user_id: str,
    items: list[dict[str, Any]],
    shipping: dict[str, str],
    notes: str | None = None,
) -> tuple[dict[str, Any] | None, list[str]]:
    sb = get_supabase()

    payload_items = [
        {"product_id": i["product_id"], "quantity": i["quantity"]}
        for i in items
        if i.get("product_id") and i.get("quantity")
    ]

    if not payload_items:
        return None, ["No valid products in cart"]

    result = sb.rpc(
        "create_order_atomic",
        {
            "p_user_id": user_id,
            "p_items": payload_items,
            "p_shipping_name": shipping["shipping_name"],
            "p_shipping_phone": shipping["shipping_phone"],
            "p_shipping_address": shipping["shipping_address"],
            "p_shipping_city": shipping["shipping_city"],
            "p_shipping_pincode": shipping["shipping_pincode"],
            "p_notes": notes,
        },
    ).execute()

    body = result.data
    if not body:
        return None, ["Order processing failed"]

    if isinstance(body, list):
        body = body[0] if body else {}

    if not body.get("ok"):
        errors = body.get("errors") or [body.get("error") or "Order validation failed"]
        if isinstance(errors, str):
            errors = [errors]
        return None, list(errors)

    order_id = body.get("order_id")
    if not order_id:
        return None, ["Order id missing from response"]

    order_resp = sb.table("orders").select("*").eq("id", order_id).maybe_single().execute()
    if not order_resp.data:
        return None, ["Order created but could not be loaded"]

    order = order_resp.data
    items_resp = sb.table("order_items").select("*").eq("order_id", order_id).execute()
    order["items"] = items_resp.data or []
    return order, []


def list_orders_for_user(user_id: str) -> list[dict[str, Any]]:
    sb = get_supabase()
    orders = (
        sb.table("orders")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    result = orders.data or []
    for order in result:
        items = (
            sb.table("order_items").select("*").eq("order_id", order["id"]).execute()
        )
        order["items"] = items.data or []
    return result
