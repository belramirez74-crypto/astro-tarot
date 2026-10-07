-- Cupones de descuento y número de seguimiento de los pedidos de la tienda.
-- Solo el servidor (service_role) accede: sin políticas RLS para el navegador.
alter table orders add column if not exists tracking text;
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount numeric(12,2) not null default 0;

create table if not exists coupons (
    code text primary key,                 -- siempre en MAYÚSCULAS
    kind text not null default 'percent',  -- 'percent' | 'fixed'
    value numeric(12,2) not null,          -- % (1-100) o monto fijo en ARS
    active boolean not null default true,
    expires_at timestamptz,
    max_uses int,                          -- null = sin límite
    used_count int not null default 0,
    note text,
    created_at timestamptz default now()
);
alter table coupons enable row level security;
