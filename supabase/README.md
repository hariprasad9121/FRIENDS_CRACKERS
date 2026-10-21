# Supabase setup — Friends Crackers

## 1. Create project

1. Create a project at [supabase.com](https://supabase.com).
2. Note **Project URL**, **publishable key**, **secret key**, and **JWT secret** (Settings → API).

**This repo is linked to:** `https://gexohwjchgrjgcpxohoe.supabase.co`  
SQL Editor: [Open in Dashboard](https://supabase.com/dashboard/project/gexohwjchgrjgcpxohoe/sql/new)

## 2. Run migration

**Option A — SQL Editor (run in order):**

1. `migrations/20260101000000_initial_schema.sql`
2. `migrations/20260102000000_inventory_realtime.sql` — atomic orders, stock history, Realtime
3. `seed.sql` — sample products with stock quantities
4. `migrations/20260103000000_seed_stock_movements.sql`

See [INVENTORY_TEST.md](./INVENTORY_TEST.md) for the 10 → 8 shared-stock test.

**Option B — CLI:**

```bash
supabase link --project-ref YOUR_REF
supabase db push
psql $DATABASE_URL -f seed.sql
```

## 3. Auth settings

In **Authentication → URL configuration**, set:

- Site URL: `http://localhost:3000` (and your Vercel URL in production)
- Redirect URLs: `http://localhost:3000/auth/callback`, `https://your-app.vercel.app/auth/callback`

Enable **Email** provider. Disable email confirmation for local dev if you prefer instant login (Authentication → Providers → Email).

## 4. Promote an admin

After registering a user in the app:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```

## 5. Security notes

- Never put the **service role key** in the frontend.
- RLS protects direct client access; order writes go through the Flask API with server-side price validation.
