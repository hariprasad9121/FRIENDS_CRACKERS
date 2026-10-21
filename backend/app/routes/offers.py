from flask import Blueprint, jsonify

from app.supabase_client import get_supabase

bp = Blueprint("offers", __name__, url_prefix="/api/offers")


@bp.get("")
def list_offers():
    sb = get_supabase()
    result = (
        sb.table("offers")
        .select("*")
        .eq("active", True)
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify({"data": result.data or []})
