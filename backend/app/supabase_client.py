from functools import lru_cache

from supabase import Client, create_client

from app.config import Config


@lru_cache
def get_supabase() -> Client:
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)
