import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";
import { apiHandler } from "@/lib/api";

// GET /api/registros/balance — returns entradas/salidas for a given month
export const GET = apiHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const { searchParams } = request.nextUrl;
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  const now = new Date();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam) : now.getMonth();

  if (isNaN(month) || month < 0 || month > 11) {
    return NextResponse.json({ error: "month debe ser entre 0 y 11" }, { status: 400 });
  }
  if (isNaN(year) || year < 1900 || year > 2100) {
    return NextResponse.json({ error: "year debe ser entre 1900 y 2100" }, { status: 400 });
  }

  const inicioMes = new Date(year, month, 1);
  const finMes = new Date(year, month + 1, 0);

  const registros = await prisma.registro.findMany({
    where: {
      user_id: user.id,
      fecha: {
        gte: inicioMes,
        lte: finMes,
      },
    },
    select: { tipo: true, monto: true },
  });

  let entradas = 0;
  let salidas = 0;
  for (const r of registros) {
    if (r.tipo === "entrada") entradas += Number(r.monto);
    else salidas += Number(r.monto);
  }

  return NextResponse.json({ entradas, salidas, balance: entradas - salidas });
});
