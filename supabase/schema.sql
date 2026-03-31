-- =============================================
-- Gastify — Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Categorías
create table if not exists categorias (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  emoji text not null,
  es_predeterminada boolean default false,
  visible boolean default true,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Registros (movimientos)
create table if not exists registros (
  id uuid default gen_random_uuid() primary key,
  tipo text not null check (tipo in ('entrada', 'salida')),
  monto numeric(12,2) not null check (monto > 0),
  descripcion text not null,
  categoria_id uuid references categorias(id) on delete set null,
  fecha date not null default current_date,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Índices
create index if not exists idx_registros_fecha on registros(fecha desc);
create index if not exists idx_registros_tipo on registros(tipo);
create index if not exists idx_registros_user on registros(user_id);

-- RLS (activar si se usa auth)
-- alter table registros enable row level security;
-- alter table categorias enable row level security;
-- create policy "Users see own registros" on registros for all using (auth.uid() = user_id);
-- create policy "Users see own categorias" on categorias for all using (auth.uid() = user_id or es_predeterminada = true);
