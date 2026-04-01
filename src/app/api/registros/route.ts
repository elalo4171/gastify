import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireActiveSubscription } from "@/lib/supabase/user";
import { apiHandler } from "@/lib/api";

// GET /api/registros
export const GET = apiHandler(async (req: NextRequest) => {
  const user = await requireUser();
  const params = req.nextUrl.searchParams;
  const limit = params.get("limit") ? parseInt(params.get("limit")!) : undefined;
  const tipo = params.get("tipo");
  const categoriaId = params.get("categoria_id");
  const fechaInicio = params.get("fecha_inicio");
  const fechaFin = params.get("fecha_fin");

  const where: Record<string, unknown> = { user_id: user.id };
  if (tipo && tipo !== "todos") where.tipo = tipo;
  if (categoriaId) where.categoria_id = categoriaId;

  const fechaFilter: Record<string, unknown> = {};
  if (fechaInicio) fechaFilter.gte = new Date(fechaInicio);
  if (fechaFin) fechaFilter.lte = new Date(fechaFin);
  if (Object.keys(fechaFilter).length > 0) where.fecha = fechaFilter;

  const registros = await prisma.registro.findMany({
    where,
    include: { categoria: true },
    orderBy: [{ fecha: "desc" }, { created_at: "desc" }],
    ...(limit ? { take: limit } : {}),
  });

  const serialized = registros.map((r) => ({
    ...r,
    monto: Number(r.monto),
    fecha: r.fecha.toISOString().split("T")[0],
    created_at: r.created_at.toISOString(),
    categoria: r.categoria
      ? { ...r.categoria, created_at: r.categoria.created_at.toISOString() }
      : null,
  }));

  return NextResponse.json(serialized);
});

// POST /api/registros
export const POST = apiHandler(async (req: NextRequest) => {
  const user = await requireUser();
  await requireActiveSubscription(user.id);
  const body = await req.json();
  const { tipo, monto, descripcion, categoria_id, fecha } = body;

  if (!tipo || !monto || !descripcion?.trim() || !fecha) {
    return NextResponse.json({ error: "campos requeridos" }, { status: 400 });
  }
  if (!["entrada", "salida"].includes(tipo)) {
    return NextResponse.json({ error: "tipo inválido" }, { status: 400 });
  }
  if (typeof monto !== "number" || monto <= 0) {
    return NextResponse.json({ error: "monto inválido" }, { status: 400 });
  }

  const registro = await prisma.registro.create({
    data: {
      tipo,
      monto,
      descripcion: descripcion.trim(),
      categoria_id: categoria_id || null,
      fecha: new Date(fecha),
      user_id: user.id,
    },
    include: { categoria: true },
  });

  return NextResponse.json({
    ...registro,
    monto: Number(registro.monto),
    fecha: registro.fecha.toISOString().split("T")[0],
    created_at: registro.created_at.toISOString(),
    categoria: registro.categoria
      ? { ...registro.categoria, created_at: registro.categoria.created_at.toISOString() }
      : null,
  });
});

// PUT /api/registros
export const PUT = apiHandler(async (req: NextRequest) => {
  const user = await requireUser();
  await requireActiveSubscription(user.id);
  const body = await req.json();
  const { id, tipo, monto, descripcion, categoria_id, fecha } = body;

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (tipo !== undefined) data.tipo = tipo;
  if (monto !== undefined) data.monto = monto;
  if (descripcion !== undefined) data.descripcion = descripcion;
  if (categoria_id !== undefined) data.categoria_id = categoria_id || null;
  if (fecha !== undefined) data.fecha = new Date(fecha);

  const registro = await prisma.registro.update({
    where: { id, user_id: user.id },
    data,
    include: { categoria: true },
  });

  return NextResponse.json({
    ...registro,
    monto: Number(registro.monto),
    fecha: registro.fecha.toISOString().split("T")[0],
    created_at: registro.created_at.toISOString(),
    categoria: registro.categoria
      ? { ...registro.categoria, created_at: registro.categoria.created_at.toISOString() }
      : null,
  });
});

// DELETE /api/registros?id=xxx
export const DELETE = apiHandler(async (req: NextRequest) => {
  const user = await requireUser();
  await requireActiveSubscription(user.id);
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  await prisma.registro.delete({ where: { id, user_id: user.id } });
  return NextResponse.json({ ok: true });
});
