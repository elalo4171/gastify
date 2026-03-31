import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/registros/delete-all — deletes all registros
export async function DELETE() {
  await prisma.registro.deleteMany({});
  return NextResponse.json({ ok: true });
}
