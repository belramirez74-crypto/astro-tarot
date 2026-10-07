-- Pedidos de la tienda. Solo el servidor (service_role) lee y escribe: sin políticas RLS para el navegador.
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    ref text unique not null,              -- external_reference de Mercado Pago ("order:...")
    items jsonb not null,                  -- [{id, name, qty, price}]
    subtotal numeric(12,2) not null,
    shipping numeric(12,2) not null default 0,
    total numeric(12,2) not null,
    buyer jsonb not null,                  -- nombre, email, teléfono, dirección
    status text not null default 'pending',  -- pending | paid | shipped | cancelled
    payment_id text,
    note text,
    created_at timestamptz default now(),
    paid_at timestamptz
);
alter table orders enable row level security;
create index if not exists idx_orders_status on orders(status, created_at desc);
