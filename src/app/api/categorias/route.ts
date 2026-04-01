import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

// GET /api/categorias?all=true (all=true includes hidden)
export async function GET(req: NextRequest) {
  const user = await requireUser();
  const showAll = req.nextUrl.searchParams.get("all") === "true";

  const categorias = await prisma.categoria.findMany({
    where: {
      user_id: user.id,
      ...(showAll ? {} : { visible: true }),
    },
    orderBy: [{ es_predeterminada: "desc" }, { nombre: "asc" }],
  });

  return NextResponse.json(categorias);
}

// POST /api/categorias
export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json();
  const { nombre, emoji } = body;

  if (!nombre?.trim() || !emoji?.trim()) {
    return NextResponse.json({ error: "nombre y emoji requeridos" }, { status: 400 });
  }

  const categoria = await prisma.categoria.create({
    data: {
      nombre: nombre.trim(),
      emoji: emoji.trim(),
      es_predeterminada: false,
      visible: true,
      user_id: user.id,
    },
  });

  return NextResponse.json(categoria);
}

// PUT /api/categorias
export async function PUT(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const categoria = await prisma.categoria.update({
    where: { id, user_id: user.id },
    data: updates,
  });

  return NextResponse.json(categoria);
}

// DELETE /api/categorias?id=xxx
export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  await prisma.categoria.delete({ where: { id, user_id: user.id } });
  return NextResponse.json({ ok: true });
}
