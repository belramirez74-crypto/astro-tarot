-- Accesos regalados al plan mensual de LUBE (se administran desde el panel de la tienda).
-- Solo el servidor (service_role) accede a la tabla: sin políticas RLS para el navegador.
alter table profiles add column if not exists plan_expires_at timestamptz;   -- vencimiento del plan regalado (null = sin vencimiento)

create table if not exists access_grants (
    id uuid primary key default gen_random_uuid(),
    email text not null,                 -- siempre en minúsculas
    service text not null default 'plan',
    days int,                            -- duración en días desde que la persona lo recibe (null = sin vencimiento)
    note text,
    claimed_at timestamptz,              -- cuando se aplicó a la cuenta
    expires_at timestamptz,
    created_at timestamptz default now()
);
create index if not exists idx_grants_email on access_grants(email);
alter table access_grants enable row level security;

-- El navegador tampoco puede tocar el vencimiento del plan.
create or replace function protect_plan_columns() returns trigger
language plpgsql as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.plan_active := false;
      new.plan_preapproval_id := null;
      new.plan_started_at := null;
      new.plan_period_start := null;
      new.plan_tiradas_used := 0;
      new.plan_expires_at := null;
    else
      new.plan_active := old.plan_active;
      new.plan_preapproval_id := old.plan_preapproval_id;
      new.plan_started_at := old.plan_started_at;
      new.plan_period_start := old.plan_period_start;
      new.plan_tiradas_used := old.plan_tiradas_used;
      new.plan_expires_at := old.plan_expires_at;
    end if;
  end if;
  return new;
end $$;
