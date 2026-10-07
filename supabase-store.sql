-- Tienda: productos. Lectura pública solo de los activos; escritura SOLO desde el servidor (service_role).
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    category text not null default 'mazos-tarot',
    price numeric(12,2) not null default 0,
    compare_price numeric(12,2),          -- precio tachado (opcional)
    stock int not null default 0,
    low_stock_threshold int not null default 3,
    sku text,
    image_url text,
    active boolean not null default true,
    featured boolean not null default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table products enable row level security;
drop policy if exists "products: public read active" on products;
create policy "products: public read active" on products for select using (active = true);
create index if not exists idx_products_cat on products(category, active);
