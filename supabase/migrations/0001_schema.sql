-- ============================================================
-- Aqua Guide — 0001_schema.sql
-- Core tables, indexes, and triggers.
-- ============================================================
create extension if not exists pgcrypto;

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,              -- 'home-use' | 'commercial-use'
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  slug text unique not null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_id_idx on products(category_id);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending','paid','failed','shipped','delivered','cancelled')),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  shipping_address jsonb not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_id_idx on orders(user_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,     -- snapshot, survives product edits/deletes
  product_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(10,2) not null
);
create index order_items_order_id_idx on order_items(order_id);

-- generic updated_at trigger, reused on products/cart_items/orders
create function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger trg_cart_items_updated_at before update on cart_items
  for each row execute function set_updated_at();
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- called from trusted server-side code (Edge Functions using the
-- service role key) after a payment is confirmed
create function decrement_stock(p_product_id uuid, p_quantity int) returns void as $$
  update products set stock_quantity = greatest(stock_quantity - p_quantity, 0)
  where id = p_product_id;
$$ language sql;

-- auto-create profile row on signup
create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
