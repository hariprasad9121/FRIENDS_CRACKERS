-- Atomic inventory, stock movement history, realtime on products

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  movement_type text not null check (
    movement_type in ('initial', 'sale', 'restock', 'adjustment', 'cancel')
  ),
  quantity_delta int not null,
  quantity_before int not null check (quantity_before >= 0),
  quantity_after int not null check (quantity_after >= 0),
  order_id uuid references public.orders (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_product_id_idx on public.stock_movements (product_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements (created_at desc);

alter table public.stock_movements enable row level security;

create policy "Admin read stock movements"
  on public.stock_movements for select
  using (public.is_admin());

-- Realtime: broadcast product stock changes to all clients
alter table public.products replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end $$;

create or replace function public.log_stock_movement(
  p_product_id uuid,
  p_movement_type text,
  p_quantity_delta int,
  p_quantity_before int,
  p_quantity_after int,
  p_order_id uuid default null,
  p_user_id uuid default null,
  p_notes text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.stock_movements (
    product_id, movement_type, quantity_delta,
    quantity_before, quantity_after, order_id, user_id, notes
  ) values (
    p_product_id, p_movement_type, p_quantity_delta,
    p_quantity_before, p_quantity_after, p_order_id, p_user_id, p_notes
  );
end;
$$;

create or replace function public.create_order_atomic(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_address text,
  p_shipping_city text,
  p_shipping_pincode text,
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_total numeric(10, 2) := 0;
  v_line record;
  v_product public.products%rowtype;
  v_unit numeric(10, 2);
  v_line_total numeric(10, 2);
  v_qty int;
  v_before int;
  v_after int;
  v_errors text[] := array[]::text[];
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'errors', array['Cart is empty']);
  end if;

  create temporary table _order_cart (
    product_id uuid not null,
    quantity int not null check (quantity > 0),
    primary key (product_id)
  ) on commit drop;

  begin
    insert into _order_cart (product_id, quantity)
    select (elem ->> 'product_id')::uuid, (elem ->> 'quantity')::int
    from jsonb_array_elements(p_items) as elem;
  exception
    when others then
      return jsonb_build_object('ok', false, 'errors', array['Invalid cart line items']);
  end;

  for v_line in select * from _order_cart order by product_id
  loop
    select * into v_product
    from public.products
    where id = v_line.product_id
    for update;

    if not found then
      v_errors := array_append(v_errors, 'Product not found: ' || v_line.product_id::text);
      continue;
    end if;

    if not v_product.is_active then
      v_errors := array_append(v_errors, 'Product unavailable: ' || v_product.name);
      continue;
    end if;

    if v_product.stock < v_line.quantity then
      v_errors := array_append(
        v_errors,
        format('Insufficient stock for %s (available: %s)', v_product.name, v_product.stock)
      );
    end if;
  end loop;

  if array_length(v_errors, 1) is not null then
    return jsonb_build_object('ok', false, 'errors', v_errors);
  end if;

  for v_line in select * from _order_cart order by product_id
  loop
    select * into v_product from public.products where id = v_line.product_id;
    v_unit := round(v_product.price * (100 - v_product.discount_percent) / 100, 2);
    v_line_total := round(v_unit * v_line.quantity, 2);
    v_total := v_total + v_line_total;
  end loop;

  insert into public.orders (
    user_id, status, total_amount,
    shipping_name, shipping_phone, shipping_address, shipping_city, shipping_pincode, notes
  ) values (
    p_user_id, 'pending', v_total,
    p_shipping_name, p_shipping_phone, p_shipping_address, p_shipping_city, p_shipping_pincode, p_notes
  )
  returning id into v_order_id;

  for v_line in select * from _order_cart order by product_id
  loop
    select * into v_product from public.products where id = v_line.product_id for update;
    v_unit := round(v_product.price * (100 - v_product.discount_percent) / 100, 2);
    v_line_total := round(v_unit * v_line.quantity, 2);

    update public.products
    set stock = stock - v_line.quantity, updated_at = now()
    where id = v_line.product_id and stock >= v_line.quantity
    returning stock into v_after;

    if not found then
      raise exception 'Insufficient stock for % (concurrent purchase)', v_product.name;
    end if;

    v_before := v_after + v_line.quantity;

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity, line_total
    ) values (
      v_order_id, v_product.id, v_product.name, v_unit, v_line.quantity, v_line_total
    );

    perform public.log_stock_movement(
      v_product.id, 'sale', -v_line.quantity, v_before, v_after, v_order_id, p_user_id, null
    );
  end loop;

  return jsonb_build_object('ok', true, 'order_id', v_order_id);
exception
  when others then
    return jsonb_build_object('ok', false, 'errors', array[sqlerrm]);
end;
$$;

create or replace function public.restock_product(
  p_product_id uuid,
  p_quantity int,
  p_admin_id uuid,
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_before int;
  v_after int;
begin
  if p_quantity is null or p_quantity <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Quantity must be positive');
  end if;

  select * into v_product from public.products where id = p_product_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Product not found');
  end if;

  v_before := v_product.stock;
  v_after := v_before + p_quantity;

  update public.products set stock = v_after, updated_at = now() where id = p_product_id;

  perform public.log_stock_movement(
    p_product_id, 'restock', p_quantity, v_before, v_after, null, p_admin_id, p_notes
  );

  return jsonb_build_object('ok', true, 'stock', v_after);
end;
$$;

revoke all on function public.create_order_atomic from public;
revoke all on function public.restock_product from public;
grant execute on function public.create_order_atomic to service_role;
grant execute on function public.restock_product to service_role;
