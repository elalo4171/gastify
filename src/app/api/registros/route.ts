import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/registros?limit=10&tipo=salida&categoria_id=xxx&fecha_inicio=2024-01-01&fecha_fin=2024-12-31
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const limit = params.get("limit") ? parseInt(params.get("limit")!) : undefined;
  const tipo = params.get("tipo");
  const categoriaId = params.get("categoria_id");
  const fechaInicio = params.get("fecha_inicio");
  const fechaFin = params.get("fecha_fin");

  const where: Record<string, unknown> = {};
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

  // Serialize Decimal and Date fields
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
}

// POST /api/registros
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tipo, monto, descripcion, categoria_id, fecha } = body;

  if (!tipo || !monto || !descripcion?.trim()) {
    return NextResponse.json({ error: "campos requeridos" }, { status: 400 });
  }

  const registro = await prisma.registro.create({
    data: {
      tipo,
      monto,
      descripcion: descripcion.trim(),
      categoria_id: categoria_id || null,
      fecha: new Date(fecha),
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
}

// PUT /api/registros
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  if (updates.fecha) updates.fecha = new Date(updates.fecha);

  const registro = await prisma.registro.update({
    where: { id },
    data: updates,
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
}

// DELETE /api/registros?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  await prisma.registro.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
