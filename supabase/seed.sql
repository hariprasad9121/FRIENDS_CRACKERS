-- Seed data for Friends Crackers (run after migrations in Supabase SQL editor)
-- Uses ON CONFLICT so you can re-run safely after initial load.

insert into public.categories (name, slug, description, image_url, sort_order) values
  ('Sparklers', 'sparklers', 'Bright handheld sparklers for every celebration.', 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80', 1),
  ('Flower Pots', 'flower-pots', 'Colorful ground fountains and flower pots.', 'https://images.unsplash.com/photo-1513151233551-d8243ff24f8f?w=800&q=80', 2),
  ('Rockets & Sky Shots', 'rockets-sky-shots', 'Soar high with rockets and aerial shells.', 'https://images.unsplash.com/photo-1467810563316-b5472a094f2d?w=800&q=80', 3),
  ('Combo Packs', 'combo-packs', 'Curated festive bundles at special prices.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

insert into public.products (category_id, name, slug, description, price, discount_percent, stock, image_url, is_combo, is_active)
select c.id, v.name, v.slug, v.description, v.price, v.discount_percent, v.stock, v.image_url, v.is_combo, true
from (values
  ('sparklers', 'Premium Gold Sparklers (10 pcs)', 'premium-gold-sparklers-10', 'Long-burn gold sparklers, safe for family use.', 149.00, 10, 120, 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80', false),
  ('sparklers', 'Electric Sparklers Pack', 'electric-sparklers-pack', 'Vibrant electric sparklers — pack of 5.', 89.00, 0, 85, 'https://images.unsplash.com/photo-1513151233551-d8243ff24f8f?w=600&q=80', false),
  ('flower-pots', 'Tri-Color Flower Pot', 'tri-color-flower-pot', 'Classic 3-color ground spinner.', 199.00, 15, 45, 'https://images.unsplash.com/photo-1467810563316-b5472a094f2d?w=600&q=80', false),
  ('flower-pots', 'Mega Fountain Pack', 'mega-fountain-pack', 'Set of 4 high-fountain flower pots.', 449.00, 20, 30, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', false),
  ('rockets-sky-shots', 'Sky Master Rocket (5 pcs)', 'sky-master-rocket-5', 'High-altitude rockets with golden burst.', 599.00, 12, 25, 'https://images.unsplash.com/photo-1520637836465-4a4d4d5e2c8e?w=600&q=80', false),
  ('rockets-sky-shots', 'Whistling Rocket Set', 'whistling-rocket-set', 'Loud whistling rockets — pack of 3.', 349.00, 5, 18, 'https://images.unsplash.com/photo-1513151233551-d8243ff24f8f?w=600&q=80', false),
  ('combo-packs', 'Family Celebration Combo', 'family-celebration-combo', 'Sparklers, flower pots & fountains — best value.', 1299.00, 25, 15, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', true),
  ('combo-packs', 'Shine Brighter Mega Pack', 'shine-brighter-mega-pack', 'Our signature mega combo for big festivals.', 2499.00, 30, 12, 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80', true),
  ('sparklers', 'Demo Shared Stock Pack', 'demo-shared-stock-pack', 'Demo product for shared inventory (starts at 10 units for all customers).', 99.00, 0, 10, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', false),
  ('sparklers', 'Kids Safe Sparkler Box', 'kids-safe-sparkler-box', 'Low-smoke sparklers designed for children — 12 pieces.', 179.00, 8, 55, 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80', false),
  ('flower-pots', 'Peacock Feather Fountain', 'peacock-feather-fountain', 'Long-lasting peacock-color fountain.', 279.00, 10, 40, 'https://images.unsplash.com/photo-1513151233551-d8243ff24f8f?w=600&q=80', false),
  ('rockets-sky-shots', 'Galaxy Burst Aerial (3 pcs)', 'galaxy-burst-aerial-3', 'Multi-color aerial burst shells.', 799.00, 15, 22, 'https://images.unsplash.com/photo-1467810563316-b5472a094f2d?w=600&q=80', false),
  ('combo-packs', 'Neighborhood Night Combo', 'neighborhood-night-combo', 'Perfect for housing society celebrations.', 1899.00, 22, 8, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80', true),
  ('sparklers', 'Twilight Stick Sparklers (20 pcs)', 'twilight-stick-sparklers-20', 'Extra-long twilight sparklers for photo moments.', 219.00, 5, 65, 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80', false)
) as v(cat_slug, name, slug, description, price, discount_percent, stock, image_url, is_combo)
join public.categories c on c.slug = v.cat_slug
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  discount_percent = excluded.discount_percent,
  stock = excluded.stock,
  image_url = excluded.image_url,
  is_combo = excluded.is_combo,
  category_id = excluded.category_id,
  is_active = true;

insert into public.offers (title, description, discount_percent, code, active, starts_at, ends_at) values
  ('Diwali Early Bird', 'Extra 5% off orders above ₹2000 — use at checkout note.', 5, 'SHINE2026', true, now() - interval '1 day', now() + interval '90 days')
on conflict (code) do nothing;

insert into public.offers (title, description, discount_percent, code, active, starts_at, ends_at)
select 'Combo Fest', 'All combo packs include free sparkler add-on (while stocks last).', null, null, true, now(), now() + interval '60 days'
where not exists (select 1 from public.offers where title = 'Combo Fest');
