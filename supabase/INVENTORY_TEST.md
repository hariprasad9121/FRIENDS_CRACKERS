# Shared inventory test plan

## Prerequisites

Run in SQL Editor (in order):

1. `migrations/20260101000000_initial_schema.sql`
2. `migrations/20260102000000_inventory_realtime.sql`
3. `seed.sql`
4. `migrations/20260103000000_seed_stock_movements.sql`

Enable **Realtime** for `products` (migration adds table to publication).

Backend `.env` must include Supabase **secret** key and JWT secret for checkout.

## Scenario A — 10 → 8 for all customers

1. Open **Demo Shared Stock Pack** — stock should show **10** on `/account`, product card, and detail.
2. Customer A: add 2 to cart, checkout (signed in), complete order.
3. Customer B (or another browser): refresh — stock shows **8** without manual reload if Realtime is on; within seconds at worst.
4. Admin **Inventory** page shows **8** and a **sale** movement (−2, before 10 → after 8).

## Scenario B — oversell protection

1. Reset demo product: `update products set stock = 2 where slug = 'demo-shared-stock-pack';`
2. Two browsers each try to buy 2 units at the same time.
3. One order succeeds; the other fails with insufficient stock. Final stock is **0**, not negative.

## Scenario C — owner restock

1. Admin → **Inventory** → restock Demo product **+10**.
2. All customer sessions show new total via Realtime.
