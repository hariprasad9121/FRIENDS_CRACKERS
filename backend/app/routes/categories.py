from flask import Blueprint, jsonify, request

from app.supabase_client import get_supabase

bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@bp.get("")
def list_categories():
    sb = get_supabase()
    q = sb.table("categories").select("*").order("sort_order")
    slug = request.args.get("slug")
    if slug:
        q = q.eq("slug", slug)
    result = q.execute()
    return jsonify({"data": result.data or []})
