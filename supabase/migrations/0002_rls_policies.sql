-- ============================================================
-- Aqua Guide — 0002_rls_policies.sql
-- Row Level Security for every table.
-- ============================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- categories: public read, admin write
create policy "categories_select_all" on categories for select using (true);
create policy "categories_admin_write" on categories for all
  using (is_admin()) with check (is_admin());

-- products: public read, admin write
create policy "products_select_all" on products for select using (true);
create policy "products_admin_write" on products for all
  using (is_admin()) with check (is_admin());

-- profiles: user sees/updates own row; admin sees all
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- cart_items: fully owned by the user
create policy "cart_items_owner_all" on cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders: user creates/reads own; only admin (or service-role, which
-- bypasses RLS) can update status — customers cannot self-mark "paid"
create policy "orders_select_own_or_admin" on orders for select
  using (user_id = auth.uid() or is_admin());
create policy "orders_insert_own" on orders for insert
  with check (user_id = auth.uid());
create policy "orders_update_admin_only" on orders for update
  using (is_admin());

-- order_items: readable/insertable via parent order ownership
create policy "order_items_select_via_order" on order_items for select
  using (exists (select 1 from orders o
                 where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_items_insert_via_order" on order_items for insert
  with check (exists (select 1 from orders o
                       where o.id = order_id and o.user_id = auth.uid()));
