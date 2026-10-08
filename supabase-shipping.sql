-- Peso y medidas de cada producto, para cotizar el envío automáticamente con Correo Argentino (MiCorreo).
alter table products add column if not exists weight_g int;     -- gramos
alter table products add column if not exists length_cm int;
alter table products add column if not exists width_cm int;
alter table products add column if not exists height_cm int;
