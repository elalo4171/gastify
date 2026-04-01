import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

const DEFAULT_CATEGORIES = [
  { nombre: "Comida", emoji: "🍔" },
  { nombre: "Hogar", emoji: "🏠" },
  { nombre: "Transporte", emoji: "🚗" },
  { nombre: "Compras", emoji: "🛒" },
  { nombre: "Salud", emoji: "💊" },
  { nombre: "Entretenimiento", emoji: "🎮" },
  { nombre: "Educación", emoji: "📚" },
  { nombre: "Trabajo", emoji: "👔" },
  { nombre: "Servicios", emoji: "💳" },
  { nombre: "Regalos", emoji: "🎁" },
  { nombre: "Salario", emoji: "💰" },
  { nombre: "Inversiones", emoji: "📈" },
  { nombre: "Otros", emoji: "✨" },
];

// POST /api/auth/seed-categories — creates default categories for a new user
export async function POST() {
  const user = await requireUser();

  // Only seed if user has no categories yet
  const existing = await prisma.categoria.count({ where: { user_id: user.id } });
  if (existing > 0) {
    return NextResponse.json({ seeded: false, count: existing });
  }

  await prisma.categoria.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      es_predeterminada: true,
      visible: true,
      user_id: user.id,
    })),
  });

  return NextResponse.json({ seeded: true, count: DEFAULT_CATEGORIES.length });
}
