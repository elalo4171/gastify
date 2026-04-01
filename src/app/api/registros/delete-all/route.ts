import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";
import { apiHandler } from "@/lib/api";

// DELETE /api/registros/delete-all — deletes all registros for the current user
export const DELETE = apiHandler(async () => {
  const user = await requireUser();
  await prisma.registro.deleteMany({ where: { user_id: user.id } });
  return NextResponse.json({ ok: true });
});
