import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/supabase/user";

export async function GET() {
  const user = await requireUser();

  const sub = await prisma.subscription.findUnique({ where: { user_id: user.id } });

  if (!sub) {
    return NextResponse.json({ active: false, status: "none" });
  }

  const now = new Date();
  const isTrialing = sub.status === "trialing" && sub.trial_end && sub.trial_end > now;
  const isActive = sub.status === "active" && sub.current_period_end && sub.current_period_end > now;

  return NextResponse.json({
    active: isTrialing || isActive,
    status: sub.status,
    trial_end: sub.trial_end?.toISOString() || null,
    current_period_end: sub.current_period_end?.toISOString() || null,
  });
}
