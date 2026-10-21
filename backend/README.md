# Friends Crackers API (Flask)

REST API for catalog, authenticated orders, and admin management. Uses Supabase PostgreSQL via the **service role** key (server only).

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python wsgi.py
```

## Endpoints (summary)

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | Public |
| GET | `/api/categories` | Public |
| GET | `/api/products` | Public |
| GET | `/api/products/:slug` | Public |
| GET | `/api/offers` | Public |
| GET/POST | `/api/orders` | Bearer JWT |
| GET/PATCH | `/api/admin/*` | Admin JWT |

Orders validate prices and stock on the server before inserting rows and decrementing inventory.

## Tests

```bash
pytest tests/
```
