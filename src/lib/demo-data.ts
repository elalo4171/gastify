import type { Categoria, Registro } from "./types";

const DEMO_USER_ID = "demo-user-00000000-0000-0000-0000";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function uuid(n: number): string {
  return `demo-${String(n).padStart(4, "0")}-0000-0000-000000000000`;
}

export const DEMO_CATEGORIAS: Categoria[] = [
  { id: uuid(1), nombre: "Comida", emoji: "🍔", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(2), nombre: "Transporte", emoji: "🚗", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(3), nombre: "Servicios", emoji: "💡", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(4), nombre: "Entretenimiento", emoji: "🎬", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(5), nombre: "Salud", emoji: "💊", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(6), nombre: "Ropa", emoji: "👕", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(7), nombre: "Educación", emoji: "📚", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(8), nombre: "Hogar", emoji: "🏠", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(9), nombre: "Salario", emoji: "💼", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(10), nombre: "Freelance", emoji: "💻", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(11), nombre: "Regalo", emoji: "🎁", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(12), nombre: "Mascota", emoji: "🐶", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
  { id: uuid(13), nombre: "Suscripciones", emoji: "📱", es_predeterminada: true, visible: true, user_id: DEMO_USER_ID, created_at: "" },
];

const catMap = Object.fromEntries(DEMO_CATEGORIAS.map((c) => [c.nombre, c]));

function reg(id: number, tipo: "entrada" | "salida", monto: number, desc: string, catName: string, daysOffset: number): Registro {
  const cat = catMap[catName];
  return {
    id: `demo-reg-${String(id).padStart(4, "0")}`,
    tipo,
    monto,
    descripcion: desc,
    categoria_id: cat.id,
    fecha: daysAgo(daysOffset),
    user_id: DEMO_USER_ID,
    created_at: new Date().toISOString(),
    categoria: cat,
  };
}

export function generateDemoRegistros(): Registro[] {
  return [
    reg(1, "entrada", 8500, "Salario quincenal", "Salario", 0),
    reg(2, "salida", 185, "Tacos y refrescos", "Comida", 0),
    reg(3, "salida", 45, "Uber al trabajo", "Transporte", 0),
    reg(4, "salida", 350, "Despensa semanal", "Comida", 1),
    reg(5, "salida", 120, "Netflix y Spotify", "Suscripciones", 1),
    reg(6, "entrada", 2500, "Proyecto freelance", "Freelance", 2),
    reg(7, "salida", 280, "Consulta médica", "Salud", 2),
    reg(8, "salida", 95, "Cine con amigos", "Entretenimiento", 3),
    reg(9, "salida", 450, "Recibo de luz", "Servicios", 3),
    reg(10, "salida", 75, "Gasolina", "Transporte", 4),
    reg(11, "salida", 220, "Comida japonesa", "Comida", 5),
    reg(12, "salida", 890, "Playera y tenis", "Ropa", 5),
    reg(13, "entrada", 8500, "Salario quincenal", "Salario", 15),
    reg(14, "salida", 1200, "Renta internet", "Servicios", 15),
    reg(15, "salida", 165, "Pizza en familia", "Comida", 16),
    reg(16, "salida", 340, "Vacuna perro", "Mascota", 17),
    reg(17, "salida", 55, "Café y pan", "Comida", 18),
    reg(18, "entrada", 1800, "Venta de monitor", "Freelance", 20),
    reg(19, "salida", 250, "Libros de TypeScript", "Educación", 21),
    reg(20, "salida", 130, "Uber fin de semana", "Transporte", 22),
    reg(21, "salida", 380, "Cena de cumpleaños", "Comida", 24),
    reg(22, "entrada", 500, "Regalo de cumpleaños", "Regalo", 25),
    reg(23, "salida", 950, "Mantenimiento casa", "Hogar", 28),
    reg(24, "salida", 85, "Medicinas", "Salud", 29),
    reg(25, "salida", 199, "Disney+", "Suscripciones", 30),
  ];
}
