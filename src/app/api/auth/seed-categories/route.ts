import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/user";

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

// POST /api/auth/seed-categories
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);

  // Only seed if user has no categories yet
  const existing = await prisma.categoria.count({ where: { user_id: user.id } });
  if (existing > 0) {
    return NextResponse.json({ seeded: false, count: existing });
  }

  const categories = Array.isArray(body?.categories) && body.categories.length > 0
    ? body.categories
    : DEFAULT_CATEGORIES;

  await prisma.categoria.createMany({
    data: categories.map((c: { nombre: string; emoji: string }) => ({
      nombre: c.nombre.trim(),
      emoji: c.emoji.trim(),
      es_predeterminada: true,
      visible: true,
      user_id: user.id,
    })),
  });

  return NextResponse.json({ seeded: true, count: categories.length });
}
