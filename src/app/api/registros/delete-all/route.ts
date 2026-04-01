import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

// DELETE /api/registros/delete-all — deletes all registros for the current user
export async function DELETE() {
  const user = await requireUser();
  await prisma.registro.deleteMany({ where: { user_id: user.id } });
  return NextResponse.json({ ok: true });
}
