import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/registros/balance — returns current month's entradas/salidas
export async function GET() {
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const registros = await prisma.registro.findMany({
    where: {
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
}
