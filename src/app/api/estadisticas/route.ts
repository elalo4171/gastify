import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

// GET /api/estadisticas?fecha_inicio=2024-01-01&fecha_fin=2024-12-31
export async function GET(req: NextRequest) {
  const user = await requireUser();
  const params = req.nextUrl.searchParams;
  const fechaInicio = params.get("fecha_inicio");
  const fechaFin = params.get("fecha_fin");

  if (!fechaInicio || !fechaFin) {
    return NextResponse.json({ error: "fechas requeridas" }, { status: 400 });
  }

  const registros = await prisma.registro.findMany({
    where: {
      user_id: user.id,
      fecha: {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      },
    },
    include: { categoria: true },
    orderBy: { fecha: "asc" },
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
}
