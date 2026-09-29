-- Esquema de Astro Tarot para Supabase.
-- Cómo aplicarlo: Supabase → tu proyecto → SQL Editor → pegar todo este archivo → Run.

create extension if not exists "pgcrypto";

-- Un perfil por usuario autenticado (auth.users ya lo maneja Supabase Auth).
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    birth_datetime timestamptz,          -- fecha y hora de nacimiento (UTC)
    birth_place text,                    -- texto libre, ej. "Buenos Aires, Argentina"
    birth_lat double precision,
    birth_lon double precision,
    birth_time_unknown boolean default false,
    natal_data jsonb,                    -- último cálculo de carta natal (planetas, asc, mc, casas)
    notify_frequency_days int default 21,-- cada cuánto se le manda el recordatorio
    notify_enabled boolean default true,
    last_notified_at timestamptz,
    created_at timestamptz default now()
);

-- Historial de lecturas: cada tirada, horóscopo, señal o carta natal que hizo el usuario.
create table if not exists reading_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    kind text not null,                  -- 'natal' | 'tirada_gratis' | 'tirada_full' | 'tirada_categoria' | 'horoscopo' | 'senal'
    label text,                          -- descripción corta para mostrar en el perfil
    detail jsonb,                        -- datos crudos (cartas salidas, signo, etc.)
    created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table reading_history enable row level security;

-- Cada usuario solo puede ver y tocar sus propios datos.
create policy "profiles: select own" on profiles for select using (auth.uid() = id);
create policy "profiles: update own" on profiles for update using (auth.uid() = id);
create policy "profiles: insert own" on profiles for insert with check (auth.uid() = id);

create policy "history: select own" on reading_history for select using (auth.uid() = user_id);
create policy "history: insert own" on reading_history for insert with check (auth.uid() = user_id);

create index if not exists idx_history_user on reading_history(user_id, created_at desc);
create index if not exists idx_profiles_notify on profiles(notify_enabled, last_notified_at);

-- Migración: plan mensual y contador de señales (ejecutar de nuevo en el SQL Editor; es segura,
-- "if not exists" no rompe nada si ya corriste el archivo antes).
alter table profiles add column if not exists plan_active boolean default false;
alter table profiles add column if not exists plan_preapproval_id text;
alter table profiles add column if not exists plan_started_at timestamptz;
alter table profiles add column if not exists plan_period_start timestamptz;
alter table profiles add column if not exists plan_tiradas_used int default 0;
alter table profiles add column if not exists senal_count int default 0;
