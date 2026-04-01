import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";
import { apiHandler } from "@/lib/api";

// GET /api/exportar — returns all registros for CSV export
export const GET = apiHandler(async () => {
  const user = await requireUser();

  const registros = await prisma.registro.findMany({
    where: { user_id: user.id },
    include: { categoria: true },
    orderBy: { fecha: "desc" },
  });

  const serialized = registros.map((r) => ({
    fecha: r.fecha.toISOString().split("T")[0],
    tipo: r.tipo,
    descripcion: r.descripcion,
    monto: Number(r.monto),
    categorias: r.categoria
      ? { nombre: r.categoria.nombre, emoji: r.categoria.emoji }
      : null,
  }));

  return NextResponse.json(serialized);
});
