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
  user_id uuid not null references auth.users(id) on delete cascade,
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
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Índices
create index if not exists idx_registros_fecha on registros(fecha desc);
create index if not exists idx_registros_tipo on registros(tipo);
create index if not exists idx_registros_user on registros(user_id);
create index if not exists idx_categorias_user on categorias(user_id);

-- =============================================
-- Row Level Security
-- =============================================

alter table categorias enable row level security;
alter table registros enable row level security;

-- Categorías: cada usuario solo ve/modifica las suyas
create policy "categorias_select" on categorias for select using (auth.uid() = user_id);
create policy "categorias_insert" on categorias for insert with check (auth.uid() = user_id);
create policy "categorias_update" on categorias for update using (auth.uid() = user_id);
create policy "categorias_delete" on categorias for delete using (auth.uid() = user_id);

-- Registros: cada usuario solo ve/modifica los suyos
create policy "registros_select" on registros for select using (auth.uid() = user_id);
create policy "registros_insert" on registros for insert with check (auth.uid() = user_id);
create policy "registros_update" on registros for update using (auth.uid() = user_id);
create policy "registros_delete" on registros for delete using (auth.uid() = user_id);
