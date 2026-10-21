from functools import wraps
from typing import Any, Callable

import jwt
from flask import g, jsonify, request

from app.config import Config
from app.supabase_client import get_supabase


class AuthError(Exception):
    def __init__(self, message: str, status: int = 401):
        self.message = message
        self.status = status
        super().__init__(message)


def decode_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            Config.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.PyJWTError as exc:
        raise AuthError("Invalid or expired token") from exc


def get_bearer_token() -> str | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return auth[7:].strip() or None


def load_user_profile(user_id: str) -> dict[str, Any] | None:
    sb = get_supabase()
    result = (
        sb.table("profiles")
        .select("id, full_name, phone, role")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    return result.data


def require_auth(f: Callable) -> Callable:
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = get_bearer_token()
        if not token:
            return jsonify({"error": "Authorization required"}), 401
        try:
            payload = decode_token(token)
        except AuthError as e:
            return jsonify({"error": e.message}), e.status

        user_id = payload.get("sub")
        if not user_id:
            return jsonify({"error": "Invalid token subject"}), 401

        profile = load_user_profile(user_id)
        if not profile:
            return jsonify({"error": "User profile not found"}), 403

        g.user_id = user_id
        g.user_profile = profile
        g.jwt_payload = payload
        return f(*args, **kwargs)

    return wrapper


def require_admin(f: Callable) -> Callable:
    @wraps(f)
    @require_auth
    def wrapper(*args, **kwargs):
        if g.user_profile.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)

    return wrapper
