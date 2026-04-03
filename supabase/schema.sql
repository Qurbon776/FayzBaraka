create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id text primary key,
  name jsonb not null
);

create table if not exists public.products (
  id text primary key,
  name jsonb not null,
  description jsonb not null,
  price integer not null,
  image text not null,
  category text not null references public.categories(id) on delete cascade,
  stock integer not null default 0,
  discount integer,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  customer jsonb not null,
  checkout jsonb not null,
  items jsonb not null,
  total integer not null,
  created_at timestamptz not null default now()
);

insert into public.categories (id, name)
values
  ('sweets', '{"uz":"Shirinliklar","ru":"Сладости"}'),
  ('toys', '{"uz":"O‘yinchoqlar","ru":"Игрушки"}')
on conflict (id) do nothing;
