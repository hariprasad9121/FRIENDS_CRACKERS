# Friends Crackers

**Celebrate Together. Shine Brighter.**

Modern responsive e-commerce for festive crackers — Next.js storefront, Flask REST API, Supabase PostgreSQL & Auth.

## Project structure

| Folder | Purpose |
|--------|---------|
| `frontend/` | Next.js (TypeScript, Tailwind) — deploy to **Vercel** |
| `backend/` | Flask API — deploy to **Render** |
| `supabase/` | SQL migrations, seed data, RLS policies |

## Quick start (local)

### 1. Supabase

Follow [supabase/README.md](./supabase/README.md) to apply migrations and seed data.

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env          # fill Supabase values
python wsgi.py
```

API runs at `http://localhost:5000` — check `GET /health`.

### 3. Frontend

```bash
cd frontend
copy .env.example .env.local    # anon key + API URL only
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `NEXT_PUBLIC_API_URL` | Flask API base URL |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never expose to browser |
| `SUPABASE_JWT_SECRET` | JWT secret for verifying user tokens |
| `CORS_ORIGINS` | Comma-separated frontend origins |

## Features

- **Storefront:** Home, categories, search/filter/sort, product detail, cart, checkout
- **Auth:** Supabase email/password registration & login, order history
- **API:** Product/category catalog, secure orders with price & stock validation
- **Admin:** Dashboard, products, categories, orders, customers, offers (admin role required)

## Deployment

### Vercel (frontend)

1. Import the repo; set **Root Directory** to `frontend`.
2. Add environment variables from `frontend/.env.example`.
3. Deploy. Update Supabase auth redirect URLs to your production domain.

### Render (backend)

1. New **Web Service**; root `backend`.
2. Build: `pip install -r requirements.txt`
3. Start: `gunicorn wsgi:app --bind 0.0.0.0:$PORT`
4. Set env vars from `backend/.env.example`; set `CORS_ORIGINS` to your Vercel URL.

Or use the included `backend/render.yaml` Blueprint.

### Post-deploy checklist

- [ ] Supabase migration + seed applied
- [ ] Auth redirect URLs include production callback
- [ ] Admin user promoted via SQL
- [ ] `NEXT_PUBLIC_API_URL` points to Render URL
- [ ] `CORS_ORIGINS` includes Vercel URL

## Manual setup still required

1. Create Supabase project and run SQL migration + seed.
2. Copy API keys into `.env` / Vercel / Render (service role stays on backend only).
3. Promote at least one admin user in SQL.
4. Configure Supabase Auth URLs for each environment.

## Scripts

```bash
cd frontend && npm run build    # production build
cd frontend && npm run lint
cd backend && python wsgi.py    # dev server
```

## License

Private / project use — adjust as needed for your business.
