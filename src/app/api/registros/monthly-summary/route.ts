import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

// GET /api/registros/monthly-summary?year=2026
export async function GET(request: NextRequest) {
  const user = await requireUser();
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  if (isNaN(year) || year < 1900 || year > 2100) {
    return NextResponse.json({ error: "year debe ser entre 1900 y 2100" }, { status: 400 });
  }

  const inicio = new Date(year, 0, 1);
  const fin = new Date(year, 11, 31);

  const registros = await prisma.registro.findMany({
    where: {
      user_id: user.id,
      fecha: { gte: inicio, lte: fin },
    },
    select: { fecha: true, tipo: true, monto: true },
  });

  const summary: Record<number, number> = {};
  for (const r of registros) {
    const month = new Date(r.fecha).getMonth();
    const amount = r.tipo === "entrada" ? Number(r.monto) : -Number(r.monto);
    summary[month] = (summary[month] || 0) + amount;
  }

  return NextResponse.json(summary);
}
