import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireActiveSubscription } from "@/lib/supabase/user";
import { apiHandler } from "@/lib/api";

// GET /api/categorias?all=true (all=true includes hidden)
export const GET = apiHandler(async (req: NextRequest) => {
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
});

// POST /api/categorias
export const POST = apiHandler(async (req: NextRequest) => {
  const user = await requireUser();
  await requireActiveSubscription(user.id);
  const body = await req.json();
  const { nombre, emoji } = body;

  if (!nombre?.trim() || !emoji?.trim()) {
    return NextResponse.json({ error: "nombre y emoji requeridos" }, { status: 400 });
  }
  if (nombre.trim().length > 100) {
    return NextResponse.json({ error: "nombre no puede exceder 100 caracteres" }, { status: 400 });
  }
  if (emoji.trim().length > 10) {
    return NextResponse.json({ error: "emoji no puede exceder 10 caracteres" }, { status: 400 });
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
});

// PUT /api/categorias
export const PUT = apiHandler(async (req: NextRequest) => {
  const user = await requireUser();
  await requireActiveSubscription(user.id);
  const body = await req.json();
  const { id, nombre, emoji, visible } = body;

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (nombre !== undefined) {
    if (typeof nombre !== "string" || nombre.trim().length === 0) {
      return NextResponse.json({ error: "nombre no puede estar vacío" }, { status: 400 });
    }
    if (nombre.trim().length > 100) {
      return NextResponse.json({ error: "nombre no puede exceder 100 caracteres" }, { status: 400 });
    }
    data.nombre = nombre;
  }
  if (emoji !== undefined) {
    if (typeof emoji !== "string" || emoji.trim().length === 0) {
      return NextResponse.json({ error: "emoji no puede estar vacío" }, { status: 400 });
    }
    if (emoji.trim().length > 10) {
      return NextResponse.json({ error: "emoji no puede exceder 10 caracteres" }, { status: 400 });
    }
    data.emoji = emoji;
  }
  if (visible !== undefined) data.visible = visible;

  const categoria = await prisma.categoria.update({
    where: { id, user_id: user.id },
    data,
  });

  return NextResponse.json(categoria);
});

// DELETE /api/categorias?id=xxx
export const DELETE = apiHandler(async (req: NextRequest) => {
  const user = await requireUser();
  await requireActiveSubscription(user.id);
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  await prisma.categoria.delete({ where: { id, user_id: user.id } });
  return NextResponse.json({ ok: true });
});
