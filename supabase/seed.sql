-- =============================================
-- Gastify — Seed: Categorías predeterminadas
-- Run this AFTER schema.sql
-- =============================================

insert into categorias (nombre, emoji, es_predeterminada, visible) values
  ('Comida', '🍔', true, true),
  ('Hogar', '🏠', true, true),
  ('Transporte', '🚗', true, true),
  ('Compras', '🛒', true, true),
  ('Salud', '💊', true, true),
  ('Entretenimiento', '🎮', true, true),
  ('Educación', '📚', true, true),
  ('Trabajo', '👔', true, true),
  ('Servicios', '💳', true, true),
  ('Regalos', '🎁', true, true),
  ('Salario', '💰', true, true),
  ('Inversiones', '📈', true, true),
  ('Otros', '✨', true, true)
on conflict do nothing;
