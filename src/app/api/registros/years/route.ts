import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

// GET /api/registros/years — returns distinct years that have registros
export async function GET() {
  const user = await requireUser();

  const registros = await prisma.registro.findMany({
    where: { user_id: user.id },
    select: { fecha: true },
    distinct: ["fecha"],
  });

  const yearsSet = new Set<number>();
  for (const r of registros) {
    const d = new Date(r.fecha);
    yearsSet.add(d.getFullYear());
  }

  const years = [...yearsSet].sort((a, b) => b - a);
  return NextResponse.json(years);
}
