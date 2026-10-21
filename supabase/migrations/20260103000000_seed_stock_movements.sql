-- Backfill initial stock movements for seeded products (safe to re-run)

insert into public.stock_movements (
  product_id, movement_type, quantity_delta, quantity_before, quantity_after, notes
)
select
  p.id,
  'initial',
  p.stock,
  0,
  p.stock,
  'Seed / demo initial inventory'
from public.products p
where not exists (
  select 1 from public.stock_movements sm
  where sm.product_id = p.id and sm.movement_type = 'initial'
);

-- Ensure demo product starts at 10 for the shared-inventory walkthrough
update public.products
set stock = 10, updated_at = now()
where slug = 'demo-shared-stock-pack';
