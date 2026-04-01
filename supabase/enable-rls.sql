-- =============================================
-- Migración: Activar RLS + user_id NOT NULL
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Hacer user_id obligatorio (elimina filas huérfanas primero si existen)
delete from registros where user_id is null;
delete from categorias where user_id is null;

alter table categorias alter column user_id set not null;
alter table registros alter column user_id set not null;

-- 2. Índice para categorías por usuario
create index if not exists idx_categorias_user on categorias(user_id);

-- 3. Activar RLS
alter table categorias enable row level security;
alter table registros enable row level security;

-- 4. Policies para categorías
create policy "categorias_select" on categorias for select using (auth.uid() = user_id);
create policy "categorias_insert" on categorias for insert with check (auth.uid() = user_id);
create policy "categorias_update" on categorias for update using (auth.uid() = user_id);
create policy "categorias_delete" on categorias for delete using (auth.uid() = user_id);

-- 5. Policies para registros
create policy "registros_select" on registros for select using (auth.uid() = user_id);
create policy "registros_insert" on registros for insert with check (auth.uid() = user_id);
create policy "registros_update" on registros for update using (auth.uid() = user_id);
create policy "registros_delete" on registros for delete using (auth.uid() = user_id);
