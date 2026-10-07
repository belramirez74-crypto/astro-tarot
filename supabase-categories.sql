-- Categorías de la tienda, editables desde el panel. Lectura pública de las activas; escritura solo del servidor.
create table if not exists store_categories (
    slug text primary key,
    name text not null,
    position int not null default 0,
    active boolean not null default true
);
alter table store_categories enable row level security;
drop policy if exists "store_categories: public read active" on store_categories;
create policy "store_categories: public read active" on store_categories for select using (active = true);

insert into store_categories (slug, name, position) values
  ('mazos-tarot', 'Mazos de tarot', 0),
  ('mazos-oraculo', 'Mazos oráculo', 1),
  ('accesorios', 'Accesorios', 2),
  ('velas-inciensos', 'Velas e inciensos', 3),
  ('cristales', 'Cristales y piedras', 4),
  ('libros', 'Libros y guías', 5)
on conflict (slug) do nothing;
